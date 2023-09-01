// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	ModelPredicate,
	PersistentModel,
	PredicatesGroup,
	ProducerModelPredicate,
	SchemaModel,
} from '../types';
import { extractPrimaryKeyFieldNames, extractPrimaryKeyValues } from '../util';

export { ModelSortPredicateCreator } from './sort';

const predicatesAllSet = new WeakSet<ProducerModelPredicate<any>>();

export function isPredicatesAll(
	predicate: any
): predicate is typeof PredicateAll {
	return predicatesAllSet.has(predicate);
}

/**
 * The valid logical grouping keys for a predicate group.
 */
const groupKeys = new Set(['and', 'or', 'not']);

/**
 * Determines whether an object is a GraphQL style predicate "group", which must be an
 * object containing a single "group key", which then contains the child condition(s).
 *
 * E.g.,
 *
 * ```
 * { and: [ ... ] }
 * { not: { ... } }
 * ```
 *
 * @param o The object to test.
 */
const isGroup = o => {
	const keys = [...Object.keys(o)];
	return keys.length === 1 && groupKeys.has(keys[0]);
};

/**
 * Determines whether an object specifies no conditions and should match everything,
 * as would be the case with `Predicates.ALL`.
 *
 * @param o The object to test.
 */
const isEmpty = o => {
	return !Array.isArray(o) && Object.keys(o).length === 0;
};

/**
 * The valid comparison operators that can be used as keys in a predicate comparison object.
 */
export const comparisonKeys = new Set([
	'eq',
	'ne',
	'gt',
	'lt',
	'ge',
	'le',
	'contains',
	'notContains',
	'beginsWith',
	'between',
]);

/**
 * Determines whether an object is a GraphQL style predicate comparison node, which must
 * be an object containing a single "comparison operator" key, which then contains the
 * operand or operands to compare against.
 *
 * @param o The object to test.
 */
const isComparison = o => {
	const keys = [...Object.keys(o)];
	return !Array.isArray(o) && keys.length === 1 && comparisonKeys.has(keys[0]);
};

/**
 * A light check to determine whether an object is a valid GraphQL Condition AST.
 *
 * @param o The object to test.
 */
const isValid = o => {
	if (Array.isArray(o)) {
		return o.every(v => isValid(v));
	} else {
		return Object.keys(o).length <= 1;
	}
};

// This symbol is not used at runtime, only its type (unique symbol)
export const PredicateAll = Symbol('A predicate that matches all records');

export class Predicates {
	public static get ALL(): typeof PredicateAll {
		const predicate = <ProducerModelPredicate<any>>(c => c);

		predicatesAllSet.add(predicate);

		return <typeof PredicateAll>(<unknown>predicate);
	}
}

export class ModelPredicateCreator {
	/**
	 * Map of storage predicates (key objects) to storage predicate AST's.
	 */
	private static predicateGroupsMap = new WeakMap<
		ModelPredicate<any>,
		PredicatesGroup<any>
	>();

	/**
	 * Determines whether the given storage predicate (lookup key) is a predicate
	 * key that DataStore recognizes.
	 *
	 * @param predicate The storage predicate (lookup key) to test.
	 */
	static isValidPredicate<T extends PersistentModel>(
		predicate: any
	): predicate is ModelPredicate<T> {
		return ModelPredicateCreator.predicateGroupsMap.has(predicate);
	}

	/**
	 * Looks for the storage predicate AST that corresponds to a given storage
	 * predicate key.
	 *
	 * The key must have been created internally by a DataStore utility
	 * method, such as `ModelPredicate.createFromAST()`.
	 *
	 * @param predicate The predicate reference to look up.
	 * @param throwOnInvalid Whether to throw an exception if the predicate
	 * isn't a valid DataStore predicate.
	 */
	static getPredicates<T extends PersistentModel>(
		predicate: ModelPredicate<T>,
		throwOnInvalid: boolean = true
	) {
		if (throwOnInvalid && !ModelPredicateCreator.isValidPredicate(predicate)) {
			throw new Error('The predicate is not valid');
		}

		return ModelPredicateCreator.predicateGroupsMap.get(predicate);
	}

	/**
	 * using the PK values from the given `model` (which can be a partial of T
	 * Creates a predicate that matches an instance described by `modelDefinition`
	 * that contains only PK field values.)
	 *
	 * @param modelDefinition The model definition to create a predicate for.
	 * @param model The model instance to extract value equalities from.
	 */
	static createForPk<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		model: T
	) {
		const keyFields = extractPrimaryKeyFieldNames(modelDefinition);
		const keyValues = extractPrimaryKeyValues(model, keyFields);

		const predicate = this.createFromAST<T>(modelDefinition, {
			and: keyFields.map((field, idx) => {
				const operand = keyValues[idx];
				return { [field]: { eq: operand } };
			}),
		});

		return predicate;
	}

	/**
	 * Searches a `Model` table for records matching the given equalities object.
	 *
	 * This only matches against fields given in the equalities object. No other
	 * fields are tested by the predicate.
	 *
	 * @param modelDefinition The model we need a predicate for.
	 * @param flatEqualities An object holding field equalities to search for.
	 */
	static createFromFlatEqualities<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		flatEqualities: Record<string, any>
	) {
		const ast = {
			and: Object.entries(flatEqualities).map(([k, v]) => ({ [k]: { eq: v } })),
		};
		return this.createFromAST<T>(modelDefinition, ast);
	}

	/**
	 * Accepts a GraphQL style filter predicate tree and transforms it into an
	 * AST that can be used for a storage adapter predicate. Example input:
	 *
	 * ```js
	 * {
	 * 	and: [
	 * 		{ name: { eq: "Bob Jones" } },
	 * 		{ age: { between: [32, 64] } },
	 * 		{ not: {
	 * 			or: [
	 * 				{ favoriteFood: { eq: 'pizza' } },
	 * 				{ favoriteFood: { eq: 'tacos' } },
	 * 			]
	 * 		}}
	 * 	]
	 * }
	 * ```
	 *
	 * @param gql GraphQL style filter node.
	 */
	static transformGraphQLFilterNodeToPredicateAST(gql: any) {
		if (!isValid(gql)) {
			throw new Error(
				'Invalid GraphQL Condition or subtree: ' + JSON.stringify(gql)
			);
		}

		if (isEmpty(gql)) {
			return {
				type: 'and',
				predicates: [],
			};
		} else if (isGroup(gql)) {
			const groupkey = Object.keys(gql)[0];
			const children = this.transformGraphQLFilterNodeToPredicateAST(
				gql[groupkey]
			);
			return {
				type: groupkey,
				predicates: Array.isArray(children) ? children : [children],
			};
		} else if (isComparison(gql)) {
			const operatorKey = Object.keys(gql)[0];
			return {
				operator: operatorKey,
				operand: gql[operatorKey],
			};
		} else {
			if (Array.isArray(gql)) {
				return gql.map(o => this.transformGraphQLFilterNodeToPredicateAST(o));
			} else {
				const fieldKey = Object.keys(gql)[0];
				return {
					field: fieldKey,
					...this.transformGraphQLFilterNodeToPredicateAST(gql[fieldKey]),
				};
			}
		}
	}

	/**
	 * Accepts a GraphQL style filter predicate tree and transforms it into a predicate
	 * that storage adapters understand. Example input:
	 *
	 * ```js
	 * {
	 * 	and: [
	 * 		{ name: { eq: "Bob Jones" } },
	 * 		{ age: { between: [32, 64] } },
	 * 		{ not: {
	 * 			or: [
	 * 				{ favoriteFood: { eq: 'pizza' } },
	 * 				{ favoriteFood: { eq: 'tacos' } },
	 * 			]
	 * 		}}
	 * 	]
	 * }
	 * ```
	 *
	 * @param modelDefinition The model that the AST/predicate must be compatible with.
	 * @param ast The graphQL style AST that should specify conditions for `modelDefinition`.
	 */
	static createFromAST<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		ast: any
	): ModelPredicate<T> {
		const key = {} as ModelPredicate<T>;

		ModelPredicateCreator.predicateGroupsMap.set(
			key,
			this.transformGraphQLFilterNodeToPredicateAST(ast)
		);

		return key;
	}
}
