import {
	Scalar,
	PersistentModel,
	// PersistentModelConstructor,
	SchemaModel,
	ModelFieldType,
	ModelAssociation,
	PaginationInput,
	QueryOne,
	ModelPredicate as FlatModelPredicate,
	PredicateExpression as FlatPredicateExpression,
	InternalSchema,
	ModelMeta,
	PersistentModelConstructor,
	AllOperators,
} from '../types';

import { ModelPredicateCreator as FlatModelPredicateCreator } from './index';
import { ExclusiveStorage as StorageAdapter } from '../storage/storage';

type MatchableTypes =
	| string
	| string[]
	| number
	| number[]
	| boolean
	| boolean[];

type AllFieldOperators = keyof AllOperators;

// TODO: this is TEMP to make the types work.
class AsyncCollection<T> {
	toArray(): T[] {
		return [];
	}
}

type FinalFieldType<T> = NonNullable<
	Scalar<
		T extends Promise<infer InnerPromiseType>
			? InnerPromiseType
			: T extends AsyncCollection<infer InnerCollectionType>
			? InnerCollectionType
			: T
	>
>;

const ops: AllFieldOperators[] = [
	'eq',
	'ne',
	'gt',
	'ge',
	'lt',
	'le',
	'beginsWith',
	'between',
	'contains',
	'notContains',
];

export type ModelPredicateExtender<RT extends PersistentModel> = (
	lambda: ModelPredicate<RT>
) => {
	__query: GroupCondition;
}[];

/**
 * A function that accepts a ModelPrecicate<T>, which it must use to return a final condition.
 *
 * This is used in `DataStore.query()` as the second argument. E.g.,
 *
 * ```
 * DataStore.query(MyModel, model => model.field.eq('some value'))
 * ```
 *
 * More complex queries should also be supported.
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
export type SingularModelPredicateExtender<RT extends PersistentModel> = (
	lambda: ModelPredicate<RT>
) => {
	__query: GroupCondition;
};

type ValuePredicate<RT extends PersistentModel, MT extends MatchableTypes> = {
	[K in AllFieldOperators]: (...operands: Scalar<MT>[]) => FinalModelPredicate;
};

type ModelPredicateOperator<RT extends PersistentModel> = (
	...predicates: [ModelPredicateExtender<RT>] | FinalModelPredicate[]
) => FinalModelPredicate;

type ModelPredicateNegation<RT extends PersistentModel> = (
	predicate: SingularModelPredicateExtender<RT> | FinalModelPredicate
) => FinalModelPredicate;

type ModelPredicate<RT extends PersistentModel> = {
	[K in keyof RT]-?: FinalFieldType<RT[K]> extends PersistentModel
		? ModelPredicate<FinalFieldType<RT[K]>>
		: ValuePredicate<RT, RT[K]>;
} & {
	or: ModelPredicateOperator<RT>;
	and: ModelPredicateOperator<RT>;
	not: ModelPredicateNegation<RT>;
	__copy: () => ModelPredicate<RT>;
} & FinalModelPredicate;

export type FinalModelPredicate = {
	__query: GroupCondition;
	__tail: GroupCondition;
	filter: <T>(items: T[]) => Promise<T[]>;
};

type GroupOperator = 'and' | 'or' | 'not';

type UntypedCondition = {
	fetch: (storage: StorageAdapter) => Promise<Record<string, any>[]>;
	matches: (item: Record<string, any>) => Promise<boolean>;
	copy(extract: GroupCondition): [UntypedCondition, GroupCondition | undefined];
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
	copy(extract: GroupCondition): [FieldCondition, GroupCondition | undefined] {
		return [
			new FieldCondition(this.field, this.operator, [...this.operands]),
			undefined,
		];
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
		const v = String(await item[this.field]);
		const operations = {
			eq: () => v === this.operands[0],
			ne: () => v !== this.operands[0],
			gt: () => v > this.operands[0],
			ge: () => v >= this.operands[0],
			lt: () => v < this.operands[0],
			le: () => v <= this.operands[0],
			contains: () => v.indexOf(this.operands[0]) > -1,
			notContains: () => v.indexOf(this.operands[0]) < 0,
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
		const _t = this;

		/**
		 * Creates a validator that checks for a particular `operands` count.
		 * Throws an exception if the `count` disagrees with `operands.length`.
		 * @param count The number of `operands` expected.
		 */
		function argumentCount(count) {
			const argsClause = count === 1 ? 'argument is' : 'arguments are';
			return () => {
				if (_t.operands.length !== count) {
					return `Exactly ${count} ${argsClause} required.`;
				}
			};
		}

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
	public groupId: string =
		new Date().getTime() + '.' + (Math.random() * 1000).toFixed(3);

	constructor(
		public model: ModelMeta<any>,
		public field: string | undefined,
		public relationshipType: string | undefined,
		public operator: GroupOperator,
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

	// TODO: decompose fetch().

	/**
	 * Fetches matching records from a given storage adapter using legacy predicates (for now).
	 * @param storage The storage adapter this predicate will query against.
	 * @param breadcrumb For debugging/troubleshooting. A list of the `groupId`'s this GroupdCondition.fetch is nested within.
	 * @param negate Whether to match on the `NOT` of `this`.
	 * @returns An `Promise` of `any[]` from `storage` matching the child conditions.
	 */
	async fetch(
		storage: StorageAdapter,
		breadcrumb = [],
		negate = false
	): Promise<Record<string, any>[]> {
		const resultGroups: Array<Record<string, any>[]> = [];

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

		const operator = (negate ? negations[this.operator] : this.operator) as
			| 'or'
			| 'and'
			| 'not';

		const negateChildren = negate !== (this.operator === 'not');

		const groups = this.operands.filter(
			op => op instanceof GroupCondition
		) as GroupCondition[];

		const conditions = this.operands.filter(
			op => op instanceof FieldCondition
		) as FieldCondition[];

		// TODO: fetch Predicate.ALL return early here?
		// TODO: parallize. (some storage engines may optimize parallel requests)
		for (const g of groups) {
			const relatives = await g.fetch(
				storage,
				[...breadcrumb, this.groupId],
				negateChildren
			);

			if (g.field) {
				// relatives needs to be used to find candidate results.
				// TODO: replace with lazy loading? ... :D ...
				const meta = this.model.schema.fields[g.field];
				const gIdField = 'id';
				if (meta.association) {
					let candidates = [];

					let leftHandField;
					if (meta.association.targetName == null) {
						leftHandField = 'id';
					} else {
						leftHandField = meta.association.targetName;
					}

					let rightHandField;
					if ((meta.association as any).associatedWith) {
						rightHandField = (meta.association as any).associatedWith;
					} else {
						rightHandField = 'id';
					}

					for (const relative of relatives) {
						const rightHandValue = relative[rightHandField].id
							? relative[rightHandField].id
							: relative[rightHandField];
						const predicate = FlatModelPredicateCreator.createFromExisting(
							this.model.schema,
							p => p[leftHandField]('eq' as never, rightHandValue as never)
						);
						candidates = [
							...candidates,
							...(await storage.query(this.model.builder, predicate as any)),
						];
					}
					resultGroups.push(candidates);
				} else {
					throw new Error('Missing field metadata.');
				}
			} else {
				// relatives are not actually relatives. they're candidate results.
				resultGroups.push(relatives);
			}
		}

		function addConditions<T>(predicate: T): T {
			let p = predicate;
			const finalConditions = [];

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

		// if conditions is empty at this point, child predicates found no matches.
		// i.e., we can stop looking and return empty.
		if (conditions.length > 0) {
			const predicate = FlatModelPredicateCreator.createFromExisting(
				this.model.schema,
				p => p[operator](c => addConditions(c))
			);
			resultGroups.push(
				await storage.query(this.model.builder, predicate as any)
			);
		} else if (conditions.length === 0 && resultGroups.length === 0) {
			resultGroups.push(await storage.query(this.model.builder));
		}

		// this needs to be read from metadata.
		const idField = 'id';
		let resultIndex: Record<string, Record<string, any>> = {};

		if (operator === 'and') {
			if (resultGroups.length === 0) {
				return [];
			}

			resultIndex = resultGroups[0].reduce((agg, item) => {
				return { ...agg, ...{ [item[idField]]: item } };
			}, {});

			resultGroups.forEach(group => {
				resultIndex = group.reduce((agg, item) => {
					const id = item[idField];
					if (resultIndex[id]) agg[id] = item;
					return agg;
				}, {});
			});
		} else if (operator === 'or' || operator === 'not') {
			// it's OK to handle NOT here, because NOT must always only negate
			// a single child predicate. NOT logic will have been distributed down
			// to the leaf conditions already.
			resultGroups.forEach(group => {
				resultIndex = {
					...resultIndex,
					...group.reduce((agg, item) => {
						return { ...agg, ...{ [item[idField]]: item } };
					}, {}),
				};
			});
		}
		const results = Object.values(resultIndex);
		return results;
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

		if (this.relationshipType === 'HAS_MANY' && itemToCheck instanceof Array) {
			for (const singleItem of itemToCheck) {
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
}

/**
 * An `aysnc` implementation of `Array.some()`. Returns as soon as a match is found.
 * @param items The items to check.
 * @param matches The async matcher function, expected to
 * return Promise<boolean>: `true` for a matching item, `false` otherwise.
 * @returns A `Promise<boolean>`, `true` if "some" items match; `false` otherwise.
 */
export async function asyncSome(
	items: Record<string, any>[],
	matches: (item: Record<string, any>) => Promise<boolean>
): Promise<boolean> {
	for (const item of items) {
		if (await matches(item)) {
			return true;
		}
	}
	return false;
}

/**
 * An `aysnc` implementation of `Array.every()`. Returns as soon as a non-match is found.
 * @param items The items to check.
 * @param matches The async matcher function, expected to
 * return Promise<boolean>: `true` for a matching item, `false` otherwise.
 * @returns A `Promise<boolean>`, `true` if every item matches; `false` otherwise.
 */
export async function asyncEvery(
	items: Record<string, any>[],
	matches: (item: Record<string, any>) => Promise<boolean>
): Promise<boolean> {
	for (const item of items) {
		if (!(await matches(item))) {
			return false;
		}
	}
	return true;
}

/**
 * An `async` implementation of `Array.filter()`. Returns after all items have been filtered.
 * TODO: Return AsyncIterable.
 * @param items The items to filter.
 * @param matches The `async` matcher function, expected to
 * return Promise<boolean>: `true` for a matching item, `false` otherwise.
 * @returns A `Promise<T>` of matching items.
 */
export async function asyncFilter<T>(
	items: T[],
	matches: (item: T) => Promise<boolean>
): Promise<T[]> {
	const results = [];
	for (const item of items) {
		if (await matches(item)) {
			results.push(item);
		}
	}
	return results;
}

// TODO: `predicateFor` => too long, too much much nesting. DECOMPOSE.
// Also ... should this be returning `FinalModelPredicate<T>` instead?

/**
 * Creates a "seed" predicate that can be used to build an executable condition.
 * This is used in `query()`, for example, to seed customer- E.g.,
 *
 * ```
 * const p = predicateFor({builder: modelConstructor, schema: modelSchema});
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
 * @param ModelType The ModelMeta used to build child properties.
 * @param field Obsolete. (I think!) Was intended to scope to a child model.
 * This info is now encoded directly in the inner `GroupCondition`.
 * @param query A base query to build on.
 * @param tail The point in the base query to attach new conditions to.
 * @returns A ModelPredicate (builder) that customers can create queries with.
 * (As shown in function description.)
 */
export function predicateFor<T extends PersistentModel>(
	ModelType: ModelMeta<T>,
	field?: string,
	query?: GroupCondition,
	tail?: GroupCondition
): ModelPredicate<T> {
	const link = {
		__query:
			query || new GroupCondition(ModelType, field, undefined, 'and', []),
		__tail: new GroupCondition(ModelType, field, undefined, 'and', []),
		__copy: () => {
			const [query, newtail] = link.__query.copy(link.__tail);
			return predicateFor(ModelType, undefined, query, newtail);
		},
	} as ModelPredicate<T>;

	// if we're already building on a query, we need to extend it.
	// the tail is already constructed. just add it.
	if (tail) {
		link.__tail = tail;
	} else if (query) {
		link.__query.operands.push(link.__tail);
	} else {
		// only if it's a new query does tail === head
		link.__tail = link.__query;
	}

	// TODO: better handled with proxy?
	['and', 'or'].forEach(op => {
		(link as any)[op] = (
			...builderOrPredicates:
				| [ModelPredicateExtender<T>]
				| FinalModelPredicate[]
		): FinalModelPredicate => {
			const newlink = link.__copy();
			newlink.__tail.operands.push(
				new GroupCondition(
					ModelType,
					field,
					undefined,
					op as 'and' | 'or',
					typeof builderOrPredicates[0] === 'function'
						? builderOrPredicates[0](predicateFor(ModelType)).map(
								p => p.__query
						  )
						: (builderOrPredicates as FinalModelPredicate[]).map(p => p.__query)
				)
			);

			return {
				__query: newlink.__query,
				__tail: newlink.__tail,
				filter: items => {
					return asyncFilter(items, i => newlink.__query.matches(i));
				},
			};
		};
	});

	link.not = (
		builderOrPredicate: SingularModelPredicateExtender<T> | FinalModelPredicate
	): FinalModelPredicate => {
		const newlink = link.__copy();
		newlink.__tail.operands.push(
			new GroupCondition(
				ModelType,
				field,
				undefined,
				'not',
				typeof builderOrPredicate === 'function'
					? [builderOrPredicate(predicateFor(ModelType)).__query]
					: [builderOrPredicate.__query]
			)
		);

		return {
			__query: newlink.__query,
			__tail: newlink.__tail,
			filter: items => {
				return asyncFilter(items, i => newlink.__query.matches(i));
			},
		};
	};

	for (const fieldName in ModelType.schema.fields) {
		Object.defineProperty(link, fieldName, {
			enumerable: true,
			get: () => {
				const def = ModelType.schema.fields[fieldName];
				if (!def.association) {
					return ops.reduce((fieldMatcher, operator) => {
						return {
							...fieldMatcher,
							[operator]: (...operands: any[]) => {
								const newlink = link.__copy();
								newlink.__tail.operands.push(
									new FieldCondition(fieldName, operator, operands)
								);

								return {
									__query: newlink.__query,
									__tail: newlink.__tail,
									filter: items => {
										return asyncFilter(items, i => newlink.__query.matches(i));
									},
								};
							},
						};
					}, {});
				} else {
					if (
						def.association.connectionType === 'BELONGS_TO' ||
						def.association.connectionType === 'HAS_ONE' ||
						def.association.connectionType === 'HAS_MANY'
					) {
						const [newquery, oldtail] = link.__query.copy(link.__tail);
						const newtail = new GroupCondition(
							(def.type as ModelFieldType).modelConstructor,
							fieldName,
							def.association.connectionType,
							'and',
							[]
						);
						(oldtail as GroupCondition).operands.push(newtail);
						const newlink = predicateFor(
							(def.type as ModelFieldType).modelConstructor,
							undefined,
							newquery,
							newtail
						);
						return newlink;
					} else {
						throw new Error(
							"Oh no! Related Model definition doesn't have a typedef!"
						);
					}
				}
			},
		});
	}

	return link;
}
