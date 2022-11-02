import {
	Scalar,
	PersistentModel,
	ModelFieldType,
	ModelMeta,
	AllOperators,
	PredicateFieldType,
	ModelPredicate as StoragePredicate,
} from '../types';

import {
	ModelPredicateCreator as FlatModelPredicateCreator,
	comparisonKeys,
} from './index';
import { ExclusiveStorage as StorageAdapter } from '../storage/storage';
import { ModelRelationship } from '../storage/relationship';
import { asyncSome, asyncEvery, asyncFilter } from '../util';

type MatchableTypes =
	| string
	| string[]
	| number
	| number[]
	| boolean
	| boolean[];

type AllFieldOperators = keyof AllOperators;

const ops = [...comparisonKeys] as AllFieldOperators[];

type NonNeverKeys<T> = {
	[K in keyof T]: T[K] extends never ? never : K;
}[keyof T];

type WithoutNevers<T> = Pick<T, NonNeverKeys<T>>;

/**
 * A function that accepts a RecursiveModelPrecicate<T>, which it must use to
 * return a final condition.
 *
 * This is used in `DataStore.query()`, `DataStore.observe()`, and
 * `DataStore.observeQuery()` as the second argument. E.g.,
 *
 * ```
 * DataStore.query(MyModel, model => model.field.eq('some value'))
 * ```
 *
 * More complex queries should also be supported. E.g.,
 *
 * ```
 * DataStore.query(MyModel, model => model.and(m => [
 *   m.relatedEntity.or(relative => [
 *     relative.relativeField.eq('whatever'),
 *     relative.relativeField.eq('whatever else')
 *   ]),
 *   m.myModelField.ne('something')
 * ]))
 * ```
 */
export type RecursiveModelPredicateExtender<RT extends PersistentModel> = (
	lambda: RecursiveModelPredicate<RT>
) => {
	/**
	 * @private
	 *
	 * DataStore internal
	 */
	__query: GroupCondition;
};

export type RecursiveModelPredicateAggregateExtender<
	RT extends PersistentModel
> = (lambda: RecursiveModelPredicate<RT>) => {
	/**
	 * @private
	 *
	 * DataStore internal
	 */
	__query: GroupCondition;
}[];

/**
 * A function that accepts a ModelPrecicate<T>, which it must use to return a
 * final condition.
 *
 * This is used as predicates in `DataStore.save()`, `DataStore.delete()`, and
 * DataStore sync expressions.
 *
 * ```
 * DataStore.save(record, model => model.field.eq('some value'))
 * ```
 *
 * Logical operators are supported. But, condtiions are related records are
 * NOT supported. E.g.,
 *
 * ```
 * DataStore.delete(record, model => model.or(m => [
 * 	m.field.eq('whatever'),
 * 	m.field.eq('whatever else')
 * ]))
 * ```
 */
export type ModelPredicateExtender<RT extends PersistentModel> = (
	lambda: ModelPredicate<RT>
) => {
	/**
	 * @private
	 *
	 * DataStore internal
	 */
	__query: GroupCondition;
};

export type ModelPredicateAggregateExtender<RT extends PersistentModel> = (
	lambda: ModelPredicate<RT>
) => {
	/**
	 * @private
	 *
	 * DataStore internal
	 */
	__query: GroupCondition;
}[];

type ValuePredicate<RT extends PersistentModel, MT extends MatchableTypes> = {
	[K in AllFieldOperators]: K extends 'between'
		? (
				inclusiveLowerBound: Scalar<MT>,
				inclusiveUpperBound: Scalar<MT>
		  ) => ModelPredicateLeaf
		: (operand: Scalar<MT>) => ModelPredicateLeaf;
};

type RecursiveModelPredicateOperator<RT extends PersistentModel> = (
	...predicates:
		| [RecursiveModelPredicateAggregateExtender<RT>]
		| ModelPredicateLeaf[]
) => ModelPredicateLeaf;

type RecursiveModelPredicateNegation<RT extends PersistentModel> = (
	predicate: RecursiveModelPredicateExtender<RT> | ModelPredicateLeaf
) => ModelPredicateLeaf;

type ModelPredicateOperator<RT extends PersistentModel> = (
	...predicates: [ModelPredicateAggregateExtender<RT>] | ModelPredicateLeaf[]
) => ModelPredicateLeaf;

type ModelPredicateNegation<RT extends PersistentModel> = (
	predicate: ModelPredicateExtender<RT> | ModelPredicateLeaf
) => ModelPredicateLeaf;

export type RecursiveModelPredicate<RT extends PersistentModel> = {
	[K in keyof RT]-?: PredicateFieldType<RT[K]> extends PersistentModel
		? RecursiveModelPredicate<PredicateFieldType<RT[K]>>
		: ValuePredicate<RT, RT[K]>;
} & {
	or: RecursiveModelPredicateOperator<RT>;
	and: RecursiveModelPredicateOperator<RT>;
	not: RecursiveModelPredicateNegation<RT>;
	/**
	 * @private
	 *
	 * DataStore internal
	 */
	__copy: () => RecursiveModelPredicate<RT>;
} & ModelPredicateLeaf;

export type ModelPredicate<RT extends PersistentModel> = WithoutNevers<{
	[K in keyof RT]-?: PredicateFieldType<RT[K]> extends PersistentModel
		? never
		: ValuePredicate<RT, RT[K]>;
}> & {
	or: ModelPredicateOperator<RT>;
	and: ModelPredicateOperator<RT>;
	not: ModelPredicateNegation<RT>;

	/**
	 * @private
	 *
	 * DataStore internal
	 */
	__copy: () => ModelPredicate<RT>;
} & ModelPredicateLeaf;

export type ModelPredicateLeaf = {
	/**
	 * @private
	 *
	 * DataStore internal
	 */
	__query: GroupCondition;

	/**
	 * @private
	 *
	 * DataStore internal
	 */
	__tail: GroupCondition;
};

type GroupOperator = 'and' | 'or' | 'not';

type UntypedCondition = {
	fetch: (storage: StorageAdapter) => Promise<Record<string, any>[]>;
	matches: (item: Record<string, any>) => Promise<boolean>;
	copy(extract: GroupCondition): [UntypedCondition, GroupCondition | undefined];
	toAST(): any;
};

/**
 * Maps operators to negated operators.
 * Used to facilitate propagation of negation down a tree of conditions.
 */
const negations = {
	and: 'or',
	or: 'and',
	not: 'and',
	eq: 'ne',
	ne: 'eq',
	gt: 'le',
	ge: 'lt',
	lt: 'ge',
	le: 'gt',
	contains: 'notContains',
	notContains: 'contains',
};

/**
 * Given a V1 predicate "seed", applies a list of V2 field-level conditions
 * to the predicate, returning a new/final V1 predicate chain link.
 * @param predicate The base/seed V1 predicate to build on
 * @param conditions The V2 conditions to add to the predicate chain.
 * @param negateChildren Whether the conditions should be negated first.
 * @returns A V1 predicate, with conditions incorporated.
 */
function applyConditionsToV1Predicate<T>(
	predicate: T,
	conditions: FieldCondition[],
	negateChildren: boolean
): T {
	let p = predicate;
	const finalConditions: FieldCondition[] = [];

	for (const c of conditions) {
		if (negateChildren) {
			if (c.operator === 'between') {
				finalConditions.push(
					new FieldCondition(c.field, 'lt', [c.operands[0]]),
					new FieldCondition(c.field, 'gt', [c.operands[1]])
				);
			} else {
				finalConditions.push(
					new FieldCondition(c.field, negations[c.operator], c.operands)
				);
			}
		} else {
			finalConditions.push(c);
		}
	}

	for (const c of finalConditions) {
		p = p[c.field](
			c.operator as never,
			(c.operator === 'between' ? c.operands : c.operands[0]) as never
		);
	}
	return p;
}

/**
 * A condition that can operate against a single "primitive" field of a model or item.
 * @member field The field of *some record* to test against.
 * @member operator The equality or comparison operator to use.
 * @member operands The operands for the equality/comparison check.
 */
export class FieldCondition {
	constructor(
		public field: string,
		public operator: string,
		public operands: string[]
	) {
		this.validate();
	}

	/**
	 * Creates a copy of self.
	 * @param extract Not used. Present only to fulfill the `UntypedCondition` interface.
	 * @returns A new, identitical `FieldCondition`.
	 */
	copy(extract: GroupCondition): [FieldCondition, GroupCondition | undefined] {
		return [
			new FieldCondition(this.field, this.operator, [...this.operands]),
			undefined,
		];
	}

	toAST() {
		return {
			[this.field]: {
				[this.operator]:
					this.operator === 'between'
						? [this.operands[0], this.operands[1]]
						: this.operands[0],
			},
		};
	}

	/**
	 * Not implemented. Not needed. GroupCondition instead consumes FieldConditions and
	 * transforms them into legacy predicates. (*For now.*)
	 * @param storage N/A. If ever implemented, the storage adapter to query.
	 * @returns N/A. If ever implemented, return items from `storage` that match.
	 */
	async fetch(storage: StorageAdapter): Promise<Record<string, any>[]> {
		return Promise.reject('No implementation needed [yet].');
	}

	/**
	 * Determins whether a given item matches the expressed condition.
	 * @param item The item to test.
	 * @returns `Promise<boolean>`, `true` if matches; `false` otherwise.
	 */
	async matches(item: Record<string, any>): Promise<boolean> {
		const v = String(item[this.field]);
		const operations = {
			eq: () => v === this.operands[0],
			ne: () => v !== this.operands[0],
			gt: () => v > this.operands[0],
			ge: () => v >= this.operands[0],
			lt: () => v < this.operands[0],
			le: () => v <= this.operands[0],
			contains: () => v.indexOf(this.operands[0]) > -1,
			notContains: () => v.indexOf(this.operands[0]) === -1,
			beginsWith: () => v.startsWith(this.operands[0]),
			between: () => v >= this.operands[0] && v <= this.operands[1],
		};
		const operation = operations[this.operator as keyof typeof operations];
		if (operation) {
			return operation();
		} else {
			throw new Error(`Invalid operator given: ${this.operator}`);
		}
	}

	/**
	 * Checks `this.operands` for compatibility with `this.operator`.
	 */
	validate(): void {
		/**
		 * Creates a validator that checks for a particular `operands` count.
		 * Throws an exception if the `count` disagrees with `operands.length`.
		 * @param count The number of `operands` expected.
		 */
		const argumentCount = count => {
			const argsClause = count === 1 ? 'argument is' : 'arguments are';
			return () => {
				if (this.operands.length !== count) {
					return `Exactly ${count} ${argsClause} required.`;
				}
			};
		};

		// NOTE: validations should return a message on failure.
		// hence, they should be "joined" together with logical OR's
		// as seen in the `between:` entry.
		const validations = {
			eq: argumentCount(1),
			ne: argumentCount(1),
			gt: argumentCount(1),
			ge: argumentCount(1),
			lt: argumentCount(1),
			le: argumentCount(1),
			contains: argumentCount(1),
			notContains: argumentCount(1),
			beginsWith: argumentCount(1),
			between: () =>
				argumentCount(2)() ||
				(this.operands[0] > this.operands[1]
					? 'The first argument must be less than or equal to the second argument.'
					: null),
		};
		const validate = validations[this.operator as keyof typeof validations];
		if (validate) {
			const e = validate();
			if (typeof e === 'string')
				throw new Error(`Incorrect usage of \`${this.operator}()\`: ${e}`);
		} else {
			throw new Error(`Non-existent operator: \`${this.operator}()\``);
		}
	}
}

/**
 * Small utility function to generate a monotonically increasing ID.
 * Used by GroupCondition to help keep track of which group is doing what,
 * when, and where during troubleshooting.
 */
const getGroupId = (() => {
	let seed = 1;
	return () => `group_${seed++}`;
})();

/**
 * A set of sub-conditions to operate against a model, optionally scoped to
 * a specific field, combined with the given operator (one of `and`, `or`, or `not`).
 * @member groupId Used to distinguish between GroupCondition instances for
 * debugging and troublehsooting.
 * @member model A metadata object that tells GroupCondition what to query and how.
 * @member field The field on the model that the sub-conditions apply to.
 * @member operator How to group child conditions together.
 * @member operands The child conditions.
 */
export class GroupCondition {
	// `groupId` was used for development/debugging.
	// Should we leave this in for future troubleshooting?
	public groupId = getGroupId();

	constructor(
		/**
		 * The `ModelMeta` of the model to query and/or filter against.
		 * Expected to contain:
		 *
		 * ```js
		 * {
		 * 	builder: ModelConstructor,
		 * 	schema: SchemaModel,
		 * 	pkField: string[]
		 * }
		 * ```
		 */
		public model: ModelMeta<any>,

		/**
		 * If populated, this group specifices a condition on a relationship.
		 *
		 * If `field` does *not* point to a related model, that's an error. It
		 * could indicate that the `GroupCondition` was instantiated with bad
		 * data, or that the model metadata is incorrect.
		 */
		public field: string | undefined,

		/**
		 * If a `field` is given, whether the relationship is a `HAS_ONE`,
		 * 'HAS_MANY`, or `BELONGS_TO`.
		 *
		 * TODO: Remove this and replace with derivation using
		 * `ModelRelationship.from(this.model, this.field).relationship`;
		 */
		public relationshipType: string | undefined,

		/**
		 *
		 */
		public operator: GroupOperator,

		/**
		 *
		 */
		public operands: UntypedCondition[]
	) {}

	/**
	 * Returns a copy of a GroupCondition, which also returns the copy of a
	 * given reference node to "extract".
	 * @param extract A node of interest. Its copy will *also* be returned if the node exists.
	 * @returns [The full copy, the copy of `extract` | undefined]
	 */
	copy(extract: GroupCondition): [GroupCondition, GroupCondition | undefined] {
		const copied = new GroupCondition(
			this.model,
			this.field,
			this.relationshipType,
			this.operator,
			[]
		);

		let extractedCopy: GroupCondition | undefined =
			extract === this ? copied : undefined;

		this.operands.forEach(o => {
			const [operandCopy, extractedFromOperand] = o.copy(extract);
			copied.operands.push(operandCopy);
			extractedCopy = extractedCopy || extractedFromOperand;
		});

		return [copied, extractedCopy];
	}

	/**
	 * Fetches matching records from a given storage adapter using legacy predicates (for now).
	 * @param storage The storage adapter this predicate will query against.
	 * @param breadcrumb For debugging/troubleshooting. A list of the `groupId`'s this
	 * GroupdCondition.fetch is nested within.
	 * @param negate Whether to match on the `NOT` of `this`.
	 * @returns An `Promise` of `any[]` from `storage` matching the child conditions.
	 */
	async fetch(
		storage: StorageAdapter,
		breadcrumb: string[] = [],
		negate = false
	): Promise<Record<string, any>[]> {
		const resultGroups: Array<Record<string, any>[]> = [];

		const operator = (negate ? negations[this.operator] : this.operator) as
			| 'or'
			| 'and'
			| 'not';

		const negateChildren = negate !== (this.operator === 'not');

		/**
		 * Conditions that must be branched out and used to generate a base, "candidate"
		 * result set.
		 *
		 * If `field` is populated, these groups select *related* records, and the base,
		 * candidate results are selected to match those.
		 */
		const groups = this.operands.filter(
			op => op instanceof GroupCondition
		) as GroupCondition[];

		/**
		 * Simple conditions that must match the target model of `this`.
		 */
		const conditions = this.operands.filter(
			op => op instanceof FieldCondition
		) as FieldCondition[];

		for (const g of groups) {
			const relatives = await g.fetch(
				storage,
				[...breadcrumb, this.groupId],
				negateChildren
			);

			// no relatives -> no need to attempt to perform a "join" query for
			// candidate results:
			//
			// select a.* from a,b where b.id in EMPTY_SET ==> EMPTY_SET
			//
			// Additionally, the entire (sub)-query can be short-circuited if
			// the operator is `AND`. Illustrated in SQL:
			//
			// select a.* from a where
			//   id in [a,b,c]
			//     AND                        <
			//   id in EMTPY_SET            <<< Look!
			//     AND                        <
			//   id in [x,y,z]
			//
			// YIELDS: EMPTY_SET           // <-- Easy peasy. Lemon squeezy.
			//
			if (relatives.length === 0) {
				// aggressively short-circuit as soon as we know the group condition will fail
				if (operator === 'and') {
					return [];
				}

				// less aggressive short-circuit if we know the relatives will produce no
				// candidate results; but aren't sure yet how this affects the group condition.
				resultGroups.push([]);
				continue;
			}

			if (g.field) {
				// `relatives` are actual relatives. We'll skim them for FK query values.
				// Use the relatives to add candidate result sets (`resultGroups`)

				const relationship = ModelRelationship.from(this.model, g.field);

				if (relationship) {
					const relativesPredicates: ((
						p: RecursiveModelPredicate<any>
					) => RecursiveModelPredicate<any>)[] = [];
					for (const relative of relatives) {
						const individualRowJoinConditions: FieldCondition[] = [];

						for (let i = 0; i < relationship.localJoinFields.length; i++) {
							// rightHandValue
							individualRowJoinConditions.push(
								new FieldCondition(relationship.localJoinFields[i], 'eq', [
									relative[relationship.remoteJoinFields[i]],
								])
							);
						}

						const predicate = p =>
							applyConditionsToV1Predicate(
								p,
								individualRowJoinConditions,
								negateChildren
							);
						relativesPredicates.push(predicate as any);
					}

					const predicate = FlatModelPredicateCreator.createGroupFromExisting(
						this.model.schema,
						'or',
						relativesPredicates as any
					);

					resultGroups.push(
						await storage.query(this.model.builder, predicate as any)
					);
				} else {
					throw new Error('Missing field metadata.');
				}
			} else {
				// relatives are not actually relatives. they're candidate results.
				resultGroups.push(relatives);
			}
		}

		// if conditions is empty at this point, child predicates found no matches.
		// i.e., we can stop looking and return empty.
		if (conditions.length > 0) {
			const predicate = FlatModelPredicateCreator.createFromExisting(
				this.model.schema,
				p =>
					p[operator](c =>
						applyConditionsToV1Predicate(c, conditions, negateChildren)
					)
			);
			resultGroups.push(
				await storage.query(this.model.builder, predicate as any)
			);
		} else if (conditions.length === 0 && resultGroups.length === 0) {
			resultGroups.push(await storage.query(this.model.builder));
		}

		// PK might be a single field, like `id`, or it might be several fields.
		// so, we'll need to extract the list of PK fields from an object
		// and stringify the list for easy comparison / merging.
		const getPKValue = item =>
			JSON.stringify(this.model.pkField.map(name => item[name]));

		// will be used for intersecting or unioning results
		let resultIndex: Map<string, Record<string, any>> | undefined;

		if (operator === 'and') {
			if (resultGroups.length === 0) {
				return [];
			}

			// for each group, we intersect, removing items from the result index
			// that aren't present in each subsequent group.
			for (const group of resultGroups) {
				if (resultIndex === undefined) {
					resultIndex = new Map(group.map(item => [getPKValue(item), item]));
				} else {
					const intersectWith = new Map<string, Record<string, any>>(
						group.map(item => [getPKValue(item), item])
					);
					for (const k of resultIndex.keys()) {
						if (!intersectWith.has(k)) {
							resultIndex.delete(k);
						}
					}
				}
			}
		} else if (operator === 'or' || operator === 'not') {
			// it's OK to handle NOT here, because NOT must always only negate
			// a single child predicate. NOT logic will have been distributed down
			// to the leaf conditions already.

			resultIndex = new Map();

			// just merge the groups, performing DISTINCT-ification by ID.
			for (const group of resultGroups) {
				for (const item of group) {
					resultIndex.set(getPKValue(item), item);
				}
			}
		}

		return Array.from(resultIndex?.values() || []);
	}

	/**
	 * Determines whether a single item matches the conditions of `this`.
	 * When checking the target `item`'s properties, each property will be `await`'d
	 * to ensure lazy-loading is respected where applicable.
	 * @param item The item to match against.
	 * @param ignoreFieldName Tells `match()` that the field name has already been dereferenced.
	 * (Used for iterating over children on HAS_MANY checks.)
	 * @returns A boolean (promise): `true` if matched, `false` otherwise.
	 */
	async matches(
		item: Record<string, any>,
		ignoreFieldName: boolean = false
	): Promise<boolean> {
		const itemToCheck =
			this.field && !ignoreFieldName ? await item[this.field] : item;

		// if there is no item to check, we can stop recursing immediately.
		// a condition cannot match against an item that does not exist. this
		// can occur when `item.field` is optional in the schema.
		if (!itemToCheck) {
			return false;
		}

		if (
			this.relationshipType === 'HAS_MANY' &&
			typeof itemToCheck[Symbol.asyncIterator] === 'function'
		) {
			for await (const singleItem of itemToCheck) {
				if (await this.matches(singleItem, true)) {
					return true;
				}
			}
			return false;
		}

		if (this.operator === 'or') {
			return asyncSome(this.operands, c => c.matches(itemToCheck));
		} else if (this.operator === 'and') {
			return asyncEvery(this.operands, c => c.matches(itemToCheck));
		} else if (this.operator === 'not') {
			if (this.operands.length !== 1) {
				throw new Error(
					'Invalid arguments! `not()` accepts exactly one predicate expression.'
				);
			}
			return !(await this.operands[0].matches(itemToCheck));
		} else {
			throw new Error('Invalid group operator!');
		}
	}

	/**
	 * Tranfsorm to a AppSync GraphQL compatible AST.
	 * (Does not support filtering in nested types.)
	 */
	toAST() {
		if (this.field)
			throw new Error('Nested type conditions are not supported!');

		return {
			[this.operator]: this.operands.map(operand => operand.toAST()),
		};
	}

	toStoragePredicate<T>(
		baseCondition?: StoragePredicate<T>
	): StoragePredicate<T> {
		return FlatModelPredicateCreator.createFromAST(
			this.model.schema,
			this.toAST()
		) as unknown as StoragePredicate<T>;
	}
}

/**
 * Creates a "seed" predicate that can be used to build an executable condition.
 * This is used in `query()`, for example, to seed customer- E.g.,
 *
 * ```
 * const p = predicateFor({builder: modelConstructor, schema: modelSchema, pkField: string[]});
 * p.and(child => [
 *   child.field.eq('whatever'),
 *   child.childModel.childField.eq('whatever else'),
 *   child.childModel.or(child => [
 *     child.otherField.contains('x'),
 *     child.otherField.contains('y'),
 *     child.otherField.contains('z'),
 *   ])
 * ])
 * ```
 *
 * `predicateFor()` returns objecst with recursive getters. To facilitate this,
 * a `query` and `tail` can be provided to "accumulate" nested conditions.
 *
 * TODO: the sortof-immutable algorithm was originally done to support legacy style
 * predicate branching (`p => p.x.eq(value).y.eq(value)`). i'm not sure this is
 * necessary or beneficial at this point, since we decided that each field condition
 * must flly terminate a branch. is the strong mutation barrier between chain links
 * still necessary or helpful?
 *
 * @param ModelType The ModelMeta used to build child properties.
 * @param field Scopes the query branch to a field.
 * @param query A base query to build on. Omit to start a new query.
 * @param tail The point in an existing `query` to attach new conditions to.
 * @returns A ModelPredicate (builder) that customers can create queries with.
 * (As shown in function description.)
 */
export function recursivePredicateFor<T extends PersistentModel>(
	ModelType: ModelMeta<T>,
	allowRecursion: boolean = true,
	field?: string,
	query?: GroupCondition,
	tail?: GroupCondition
): RecursiveModelPredicate<T> {
	let starter: GroupCondition | undefined;
	// if we don't have an existing query + tail to build onto,
	// we need to start a new query chain.
	if (!query || !tail) {
		starter = new GroupCondition(ModelType, field, undefined, 'and', []);
	}

	// our eventual return object, which can be built upon.
	// next steps will be to add or(), and(), not(), and field.op() methods.
	const link = {
		__query: starter || query,
		__tail: starter || tail,
		__copy: () => {
			const [query, newtail] = link.__query.copy(link.__tail);
			return recursivePredicateFor(
				ModelType,
				allowRecursion,
				undefined,
				query,
				newtail
			);
		},
	} as RecursiveModelPredicate<T>;

	// Adds .or() and .and() methods to the link.
	// TODO: If revisiting this code, consider writing a Proxy instead.
	['and', 'or'].forEach(op => {
		(link as any)[op] = (
			...builderOrPredicates:
				| [RecursiveModelPredicateAggregateExtender<T>]
				| ModelPredicateLeaf[]
		): ModelPredicateLeaf => {
			// or() and and() will return a copy of the original link
			// to head off mutability concerns.
			const newlink = link.__copy();

			// the customer will supply a child predicate, which apply to the `model.field`
			// of the tail GroupCondition.
			newlink.__tail.operands.push(
				new GroupCondition(
					ModelType,
					field,
					undefined,
					op as 'and' | 'or',
					typeof builderOrPredicates[0] === 'function'
						? // handle the the `c => [c.field.eq(v)]` form
						  builderOrPredicates[0](
								recursivePredicateFor(ModelType, allowRecursion)
						  ).map(p => p.__query)
						: // handle the `[MyModel.field.eq(v)]` form (not yet available)
						  (builderOrPredicates as ModelPredicateLeaf[]).map(p => p.__query)
				)
			);

			// FinalPredicate
			return {
				__query: newlink.__query,
				__tail: newlink.__tail,
			};
		};
	});

	// TODO: If revisiting this code, consider proxy.
	link.not = (
		builderOrPredicate: RecursiveModelPredicateExtender<T> | ModelPredicateLeaf
	): ModelPredicateLeaf => {
		// not() will return a copy of the original link
		// to head off mutability concerns.
		const newlink = link.__copy();

		// unlike and() and or(), the customer will supply a "singular" child predicate.
		// the difference being: not() does not accept an array of predicate-like objects.
		// it negates only a *single* predicate subtree.
		newlink.__tail.operands.push(
			new GroupCondition(
				ModelType,
				field,
				undefined,
				'not',
				typeof builderOrPredicate === 'function'
					? // handle the the `c => c.field.eq(v)` form
					  [
							builderOrPredicate(
								recursivePredicateFor(ModelType, allowRecursion)
							).__query,
					  ]
					: // handle the `MyModel.field.eq(v)` form (not yet available)
					  [builderOrPredicate.__query]
			)
		);

		// A `FinalModelPredicate`.
		// Return a thing that can no longer be extended, but instead used to `async filter(items)`
		// or query storage: `.__query.fetch(storage)`.
		return {
			__query: newlink.__query,
			__tail: newlink.__tail,
		};
	};

	// For each field on the model schema, we want to add a getter
	// that creates the appropriate new `link` in the query chain.
	// TODO: If revisiting, consider a proxy.
	for (const fieldName in ModelType.schema.fields) {
		Object.defineProperty(link, fieldName, {
			enumerable: true,
			get: () => {
				const def = ModelType.schema.fields[fieldName];

				if (!def.association) {
					// we're looking at a value field. we need to return a
					// "field matcher object", which contains all of the comparison
					// functions ('eq', 'ne', 'gt', etc.), scoped to operate
					// against the target field (fieldName).
					return ops.reduce((fieldMatcher, operator) => {
						return {
							...fieldMatcher,

							// each operator on the fieldMatcher objcect is a function.
							// when the customer calls the function, it returns a new link
							// in the chain -- for now -- this is the "leaf" link that
							// cannot be further extended.
							[operator]: (...operands: any[]) => {
								// build off a fresh copy of the existing `link`, just in case
								// the same link is being used elsewhere by the customer.
								const newlink = link.__copy();

								// add the given condition to the link's TAIL node.
								// remember: the base link might go N nodes deep! e.g.,
								newlink.__tail.operands.push(
									new FieldCondition(fieldName, operator, operands)
								);

								// A `FinalModelPredicate`.
								// Return a thing that can no longer be extended, but instead used to `async filter(items)`
								// or query storage: `.__query.fetch(storage)`.
								return {
									__query: newlink.__query,
									__tail: newlink.__tail,
								};
							},
						};
					}, {});
				} else {
					if (!allowRecursion) {
						throw new Error(
							'Predication on releated models is not supported in this context.'
						);
					} else if (
						def.association.connectionType === 'BELONGS_TO' ||
						def.association.connectionType === 'HAS_ONE' ||
						def.association.connectionType === 'HAS_MANY'
					) {
						// the use has just typed '.someRelatedModel'. we need to given them
						// back a predicate chain.

						const relatedMeta = (def.type as ModelFieldType).modelConstructor;
						if (!relatedMeta) {
							throw new Error(
								'Related model metadata is missing. This is a bug! Please report it.'
							);
						}

						// `Model.reletedModelField` returns a copy of the original link,
						// and will contains copies of internal GroupConditions
						// to head off mutability concerns.
						const [newquery, oldtail] = link.__query.copy(link.__tail);
						const newtail = new GroupCondition(
							relatedMeta,
							fieldName,
							def.association.connectionType,
							'and',
							[]
						);

						// `oldtail` here refers to the *copy* of the old tail.
						// so, it's safe to modify at this point. and we need to modify
						// it to push the *new* tail onto the end of it.
						(oldtail as GroupCondition).operands.push(newtail);
						const newlink = recursivePredicateFor(
							relatedMeta,
							allowRecursion,
							undefined,
							newquery,
							newtail
						);
						return newlink;
					} else {
						throw new Error(
							"Related model definition doesn't have a typedef. This is a bug! Please report it."
						);
					}
				}
			},
		});
	}

	return link;
}

export function predicateFor<T extends PersistentModel>(
	ModelType: ModelMeta<T>
): ModelPredicate<T> {
	return recursivePredicateFor(ModelType, false) as any as ModelPredicate<T>;
}
