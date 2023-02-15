import {
	PersistentModel,
	ModelFieldType,
	ModelMeta,
	ModelPredicate as StoragePredicate,
	AllFieldOperators,
	PredicateInternalsKey,
	V5ModelPredicate as ModelPredicate,
	RecursiveModelPredicate,
	RecursiveModelPredicateExtender,
	RecursiveModelPredicateAggregateExtender,
} from '../types';

import {
	ModelPredicateCreator as FlatModelPredicateCreator,
	comparisonKeys,
} from './index';
import { ExclusiveStorage as StorageAdapter } from '../storage/storage';
import { ModelRelationship } from '../storage/relationship';
import { asyncSome, asyncEvery } from '../util';

const ops = [...comparisonKeys] as AllFieldOperators[];

type GroupOperator = 'and' | 'or' | 'not';

type UntypedCondition = {
	fetch: (storage: StorageAdapter) => Promise<Record<string, any>[]>;
	matches: (item: Record<string, any>) => Promise<boolean>;
	copy(
		extract?: GroupCondition
	): [UntypedCondition, GroupCondition | undefined];
	toAST(): any;
};

/**
 * A map from keys (exposed to customers) to the internal predicate data
 * structures invoking code should not muck with.
 */
const predicateInternalsMap = new Map<PredicateInternalsKey, GroupCondition>();

/**
 * Creates a link between a key (and generates a key if needed) and an internal
 * `GroupCondition`, which allows us to return a key object instead of the gory
 * conditions details to customers/invoking code.
 *
 * @param condition The internal condition to keep hidden.
 * @param key The object DataStore will use to find the internal condition.
 * If no key is given, an empty one is created.
 */
const registerPredicateInternals = (condition: GroupCondition, key?: any) => {
	const finalKey = key || new PredicateInternalsKey();
	predicateInternalsMap.set(finalKey, condition);
	return finalKey;
};

/**
 * Takes a key object from `registerPredicateInternals()` to fetch an internal
 * `GroupCondition` object, which can then be used to query storage or
 * test/match objects.
 *
 * This indirection exists to hide `GroupCondition` from public interfaces, since
 * `GroupCondition` contains extra methods and properties that public callers
 * should not use.
 *
 * @param key A key object previously returned by `registerPredicateInternals()`
 */
export const internals = (key: any) => {
	if (!predicateInternalsMap.has(key)) {
		throw new Error(
			"Invalid predicate. Terminate your predicate with a valid condition (e.g., `p => p.field.eq('value')`) or pass `Predicates.ALL`."
		);
	}
	return predicateInternalsMap.get(key)!;
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
	copy(extract?: GroupCondition): [FieldCondition, GroupCondition | undefined] {
		return [
			new FieldCondition(this.field, this.operator, [...this.operands]),
			undefined,
		];
	}

	/**
	 * Produces a tree structure similar to a graphql condition. The returned
	 * structure is "dumb" and is intended for another query/condition
	 * generation mechanism to interpret, such as the cloud or storage query
	 * builders.
	 *
	 * E.g.,
	 *
	 * ```json
	 * {
	 * 	"name": {
	 * 		"eq": "robert"
	 * 	}
	 * }
	 * ```
	 */
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
	 * Produces a new condition (`FieldCondition` or `GroupCondition`) that
	 * matches the opposite of this condition.
	 *
	 * Intended to be used when applying De Morgan's Law, which can be done to
	 * produce more efficient queries against the storage layer if a negation
	 * appears in the query tree.
	 *
	 * For example:
	 *
	 * 1. `name.eq('robert')` becomes `name.ne('robert')`
	 * 2. `price.between(100, 200)` becomes `m => m.or(m => [m.price.lt(100), m.price.gt(200)])`
	 *
	 * @param model The model meta to use when construction a new `GroupCondition`
	 * for cases where the negation requires multiple `FieldCondition`'s.
	 */
	negated(model: ModelMeta<any>) {
		if (this.operator === 'between') {
			return new GroupCondition(model, undefined, undefined, 'or', [
				new FieldCondition(this.field, 'lt', [this.operands[0]]),
				new FieldCondition(this.field, 'gt', [this.operands[1]]),
			]);
		} else if (this.operator === 'beginsWith') {
			// beginsWith negation doesn't have a good, safe optimation right now.
			// just re-wrap it in negation. The adapter will have to scan-and-filter,
			// as is likely optimal for negated beginsWith conditions *anyway*.
			return new GroupCondition(model, undefined, undefined, 'not', [
				new FieldCondition(this.field, 'beginsWith', [this.operands[0]]),
			]);
		} else {
			return new FieldCondition(
				this.field,
				negations[this.operator],
				this.operands
			);
		}
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
		const v = item[this.field];
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
			const result = operation();
			return result;
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
		public operands: UntypedCondition[],

		/**
		 * Whether this GroupCondition is the result of an optimize call.
		 *
		 * This is used to guard against infinitely fetch -> optimize -> fetch
		 * recursion.
		 */
		public isOptimized: boolean = false
	) {}

	/**
	 * Returns a copy of a GroupCondition, which also returns the copy of a
	 * given reference node to "extract".
	 * @param extract A node of interest. Its copy will *also* be returned if the node exists.
	 * @returns [The full copy, the copy of `extract` | undefined]
	 */
	copy(extract?: GroupCondition): [GroupCondition, GroupCondition | undefined] {
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
	 * Creates a new `GroupCondition` that contains only the local field conditions,
	 * omitting related model conditions. That resulting `GroupCondition` can be
	 * used to produce predicates that are compatible with the storage adapters and
	 * Cloud storage.
	 *
	 * @param negate Whether the condition tree should be negated according
	 * to De Morgan's law.
	 */
	withFieldConditionsOnly(negate: boolean) {
		const negateChildren = negate !== (this.operator === 'not');
		return new GroupCondition(
			this.model,
			undefined,
			undefined,
			(negate ? negations[this.operator] : this.operator) as
				| 'or'
				| 'and'
				| 'not',
			this.operands
				.filter(o => o instanceof FieldCondition)
				.map(o =>
					negateChildren ? (o as FieldCondition).negated(this.model) : o
				)
		);
	}

	/**
	 * Returns a version of the predicate tree with unnecessary logical groups
	 * condensed and merged together. This is intended to create a dense tree
	 * with leaf nodes (`FieldCondition`'s) aggregated under as few group conditions
	 * as possible for the most efficient fetching possible -- it allows `fetch()`.
	 *
	 * E.g. a grouping like this:
	 *
	 * ```yaml
	 * and:
	 * 	and:
	 * 		id:
	 * 			eq: "abc"
	 * 	and:
	 * 		name:
	 * 			eq: "xyz"
	 * ```
	 *
	 * Will become this:
	 *
	 * ```yaml
	 * and:
	 * 	id:
	 * 		eq: "abc"
	 * 	name:
	 * 		eq: "xyz"
	 * ```
	 *
	 * This allows `fetch()` to pass both the `id` and `name` conditions to the adapter
	 * together, which can then decide what index to use based on both fields together.
	 *
	 * @param preserveNode Whether to preserve the current node and to explicitly not eliminate
	 * it during optimization. Used internally to preserve the root node and children of
	 * `not` groups. `not` groups will always have a single child, so there's nothing to
	 * optimize below a `not` (for now), and it makes the query logic simpler later.
	 */
	optimized(preserveNode = true): UntypedCondition {
		const operands = this.operands.map(o =>
			o instanceof GroupCondition ? o.optimized(this.operator === 'not') : o
		);

		// we're only collapsing and/or groups that contains a single child for now,
		// because they're much more common and much more trivial to collapse. basically,
		// an `and`/`or` that contains a single child doesn't require the layer of
		// logical grouping.
		if (
			!preserveNode &&
			['and', 'or'].includes(this.operator) &&
			!this.field &&
			operands.length === 1
		) {
			const operand = operands[0];
			if (operand instanceof FieldCondition) {
				// between conditions should NOT be passed up the chain. if they
				// need to be *negated* later, it is important that they be properly
				// contained in an AND group. when de morgan's law is applied, the
				// conditions are reversed and the AND group flips to an OR. this
				// doesn't work right if the a `between` doesn't live in an AND group.
				if (operand.operator !== 'between') {
					return operand;
				}
			} else {
				return operand;
			}
		}

		return new GroupCondition(
			this.model,
			this.field,
			this.relationshipType,
			this.operator,
			operands,
			true
		);
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
		if (!this.isOptimized) {
			return this.optimized().fetch(storage);
		}

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

				type JoinCondition = { [x: string]: { eq: any } };
				if (relationship) {
					const allJoinConditions: { and: JoinCondition[] }[] = [];
					for (const relative of relatives) {
						const relativeConditions: JoinCondition[] = [];
						for (let i = 0; i < relationship.localJoinFields.length; i++) {
							relativeConditions.push({
								[relationship.localJoinFields[i]]: {
									eq: relative[relationship.remoteJoinFields[i]],
								},
							});
						}
						allJoinConditions.push({ and: relativeConditions });
					}

					const predicate = FlatModelPredicateCreator.createFromAST(
						this.model.schema,
						{
							or: allJoinConditions,
						}
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
			const predicate =
				this.withFieldConditionsOnly(negateChildren).toStoragePredicate();
			resultGroups.push(await storage.query(this.model.builder, predicate));
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

	/**
	 * A JSON representation that's good for debugging.
	 */
	toJSON() {
		return {
			...this,
			model: this.model.schema.name,
		};
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
): RecursiveModelPredicate<T> & PredicateInternalsKey {
	// to be used if we don't have a base query or tail to build onto
	const starter = new GroupCondition(ModelType, field, undefined, 'and', []);

	const baseCondition = query && tail ? query : starter;
	const tailCondition = query && tail ? tail : starter;

	// our eventual return object, which can be built upon.
	// next steps will be to add or(), and(), not(), and field.op() methods.
	const link = {} as any;

	// so it can be looked up later with in the internals when processing conditions.
	registerPredicateInternals(baseCondition, link);

	const copyLink = () => {
		const [query, newTail] = baseCondition.copy(tailCondition);
		const newLink = recursivePredicateFor(
			ModelType,
			allowRecursion,
			undefined,
			query,
			newTail
		);
		return { query, newTail, newLink };
	};

	// Adds .or() and .and() methods to the link.
	// TODO: If revisiting this code, consider writing a Proxy instead.
	['and', 'or'].forEach(op => {
		(link as any)[op] = (
			builder: RecursiveModelPredicateAggregateExtender<T>
		) => {
			// or() and and() will return a copy of the original link
			// to head off mutability concerns.
			const { query, newTail } = copyLink();

			const childConditions = builder(
				recursivePredicateFor(ModelType, allowRecursion)
			);
			if (!Array.isArray(childConditions)) {
				throw new Error(
					`Invalid predicate. \`${op}\` groups must return an array of child conditions.`
				);
			}

			// the customer will supply a child predicate, which apply to the `model.field`
			// of the tail GroupCondition.
			newTail?.operands.push(
				new GroupCondition(
					ModelType,
					field,
					undefined,
					op as 'and' | 'or',
					childConditions.map(c => internals(c))
				)
			);

			// FinalPredicate
			return registerPredicateInternals(query);
		};
	});

	// TODO: If revisiting this code, consider proxy.
	link.not = (
		builder: RecursiveModelPredicateExtender<T>
	): PredicateInternalsKey => {
		// not() will return a copy of the original link
		// to head off mutability concerns.
		const { query, newTail } = copyLink();

		// unlike and() and or(), the customer will supply a "singular" child predicate.
		// the difference being: not() does not accept an array of predicate-like objects.
		// it negates only a *single* predicate subtree.
		newTail?.operands.push(
			new GroupCondition(ModelType, field, undefined, 'not', [
				internals(builder(recursivePredicateFor(ModelType, allowRecursion))),
			])
		);

		// A `FinalModelPredicate`.
		// Return a thing that can no longer be extended, but instead used to `async filter(items)`
		// or query storage: `.__query.fetch(storage)`.
		return registerPredicateInternals(query);
	};

	// For each field on the model schema, we want to add a getter
	// that creates the appropriate new `link` in the query chain.
	// TODO: If revisiting, consider a proxy.
	for (const fieldName in ModelType.schema.allFields) {
		Object.defineProperty(link, fieldName, {
			enumerable: true,
			get: () => {
				const def = ModelType.schema.allFields![fieldName];

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
								const { query, newTail } = copyLink();

								// add the given condition to the link's TAIL node.
								// remember: the base link might go N nodes deep! e.g.,
								newTail?.operands.push(
									new FieldCondition(fieldName, operator, operands)
								);

								// A `FinalModelPredicate`.
								// Return a thing that can no longer be extended, but instead used to `async filter(items)`
								// or query storage: `.__query.fetch(storage)`.
								return registerPredicateInternals(query);
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
						const [newquery, oldtail] = baseCondition.copy(tailCondition);
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
): ModelPredicate<T> & PredicateInternalsKey {
	return recursivePredicateFor(ModelType, false) as any as ModelPredicate<T>;
}
