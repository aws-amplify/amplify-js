import {
	AllOperators,
	ModelPredicate,
	PersistentModel,
	PredicateExpression,
	PredicateGroups,
	PredicatesGroup,
	ProducerModelPredicate,
	SchemaModel,
	GraphQLCondition,
	GraphQLFilter,
} from '../types';
import {
	exhaustiveCheck,
	extractPrimaryKeyFieldNames,
	extractPrimaryKeyValues,
} from '../util';

export { ModelSortPredicateCreator } from './sort';

const predicatesAllSet = new WeakSet<ProducerModelPredicate<any>>();

export function isPredicatesAll(
	predicate: any
): predicate is typeof PredicateAll {
	return predicatesAllSet.has(predicate);
}

const groupKeys = new Set(['and', 'or', 'not']);
const isGroup = o => {
	const keys = [...Object.keys(o)];
	return keys.length === 1 && groupKeys.has(keys[0]);
};

const comparisonKeys = new Set([
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
const isComparison = o => {
	const keys = [...Object.keys(o)];
	return !Array.isArray(o) && keys.length === 1 && comparisonKeys.has(keys[0]);
};

const isValid = o => {
	if (Array.isArray(o)) {
		return o.every(v => isValid(v));
	} else {
		return Object.keys(o).length === 1;
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
	private static predicateGroupsMap = new WeakMap<
		ModelPredicate<any>,
		PredicatesGroup<any>
	>();

	static createPredicateBuilder<T extends PersistentModel>(
		modelDefinition: SchemaModel
	) {
		const { name: modelName } = modelDefinition;
		const fieldNames = new Set<keyof T>(Object.keys(modelDefinition.fields));

		let handler: ProxyHandler<ModelPredicate<T>>;

		const predicate = new Proxy(
			{} as ModelPredicate<T>,
			(handler = {
				get(
					_,
					propertyKey,
					self: ModelPredicate<T>
				): PredicateExpression<T, any> {
					const groupType = propertyKey as keyof PredicateGroups<T>;

					switch (groupType) {
						case 'and':
						case 'or':
						case 'not':
							const result: PredicateExpression<T, any> = (
								newPredicate: (criteria: ModelPredicate<T>) => ModelPredicate<T>
							) => {
								const group: PredicatesGroup<T> = {
									type: groupType,
									predicates: [],
								};

								// Create a new recorder
								const tmpPredicateRecorder = new Proxy(
									{} as ModelPredicate<T>,
									handler
								);

								// Set the recorder group
								ModelPredicateCreator.predicateGroupsMap.set(
									tmpPredicateRecorder as any,
									group
								);

								// Apply the predicates to the recorder (this is the step that records the changes)
								newPredicate(tmpPredicateRecorder);

								// Push the group to the top-level recorder
								ModelPredicateCreator.predicateGroupsMap
									.get(self as any)!
									.predicates.push(group);

								return self;
							};

							return result;
						default:
						// intentionally blank.
					}

					const field = propertyKey as keyof T;

					if (!fieldNames.has(field)) {
						throw new Error(
							`Invalid field for model. field: ${field}, model: ${modelName}`
						);
					}

					const result: PredicateExpression<T, any> = (
						operator: keyof AllOperators,
						operand: any
					) => {
						ModelPredicateCreator.predicateGroupsMap
							.get(self as any)!
							.predicates.push({ field, operator, operand });
						return self;
					};
					return result;
				},
			})
		);

		const group: PredicatesGroup<T> = {
			type: 'and',
			predicates: [],
		};
		ModelPredicateCreator.predicateGroupsMap.set(predicate as any, group);

		return predicate;
	}

	static isValidPredicate<T extends PersistentModel>(
		predicate: any
	): predicate is ModelPredicate<T> {
		return ModelPredicateCreator.predicateGroupsMap.has(predicate);
	}

	static getPredicates<T extends PersistentModel>(
		predicate: ModelPredicate<T>,
		throwOnInvalid: boolean = true
	) {
		if (throwOnInvalid && !ModelPredicateCreator.isValidPredicate(predicate)) {
			throw new Error('The predicate is not valid');
		}

		return ModelPredicateCreator.predicateGroupsMap.get(predicate as any);
	}

	// transforms cb-style predicate into Proxy
	static createFromExisting<T extends PersistentModel>(
		modelDefinition?: SchemaModel,
		existing?: ProducerModelPredicate<T>
	) {
		if (!existing || !modelDefinition) {
			return undefined;
		}

		return existing(
			ModelPredicateCreator.createPredicateBuilder(modelDefinition)
		);
	}

	static createForSingleField<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		fieldName: string,
		value: string
	) {
		return ModelPredicateCreator.createPredicateBuilder<T>(modelDefinition)[
			fieldName
		](<any>'eq', <any>value);
	}

	static createForPk<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		model: T
	) {
		const keyFields = extractPrimaryKeyFieldNames(modelDefinition);
		const keyValues = extractPrimaryKeyValues(model, keyFields);

		let modelPredicate =
			ModelPredicateCreator.createPredicateBuilder<T>(modelDefinition);

		keyFields.forEach((field, idx) => {
			const operand = keyValues[idx];
			modelPredicate = modelPredicate[field](<any>'eq', <any>operand);
		});

		return modelPredicate;
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
		let predicate =
			ModelPredicateCreator.createPredicateBuilder<T>(modelDefinition);

		for (const [field, value] of Object.entries(flatEqualities)) {
			predicate = predicate[field]('eq' as any, value);
		}

		return predicate;
	}

	static createGroupFromExisting<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		group: 'and' | 'or' | 'not',
		existingPredicates: (ProducerModelPredicate<T> | ModelPredicate<T>)[]
	) {
		let outer =
			ModelPredicateCreator.createPredicateBuilder<T>(modelDefinition);

		outer = outer[group](seed => {
			let inner = seed;
			for (const existing of existingPredicates) {
				if (typeof existing === 'function') {
					inner = existing(inner);
				} else {
					ModelPredicateCreator.predicateGroupsMap
						.get(inner)
						?.predicates.push(
							ModelPredicateCreator.predicateGroupsMap.get(
								existing as ModelPredicate<T>
							)!
						);
				}
			}
			return inner;
		});

		return outer;
	}

	static transformGraphQLtoPredicateAST(gql: any) {
		if (!isValid(gql)) {
			throw new Error('Invalid QGL AST: ' + gql);
		}

		if (isGroup(gql)) {
			const groupkey = Object.keys(gql)[0];
			const children = this.transformGraphQLtoPredicateAST(gql[groupkey]);
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
				return gql.map(o => this.transformGraphQLtoPredicateAST(o));
			} else {
				const fieldKey = Object.keys(gql)[0];
				return {
					field: fieldKey,
					...this.transformGraphQLtoPredicateAST(gql[fieldKey]),
				};
			}
		}
	}

	static createFromAST(
		modelDefinition: SchemaModel,
		ast: any
	): ModelPredicate<any> {
		const predicate =
			ModelPredicateCreator.createPredicateBuilder(modelDefinition);

		ModelPredicateCreator.predicateGroupsMap.set(
			predicate,
			this.transformGraphQLtoPredicateAST(ast)
		);

		return predicate;
	}
}
