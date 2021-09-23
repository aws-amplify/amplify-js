// REF: https://tiny.amazon.com/1bqg7c90h/typeorgplay

import {
	Scalar,
	PersistentModel,
	PersistentModelConstructor,
	SchemaModel,
	ModelFieldType,
	ModelAssociation,
} from '../types';

type MatchableTypes =
	| string
	| string[]
	| number
	| number[]
	| boolean
	| boolean[];

type EqualityOperators = 'eq' | 'ne';
type ComparisonOperators = 'gt' | 'ge' | 'lt' | 'le' | 'between' | 'beginsWith';
type ScalarOperators = EqualityOperators | ComparisonOperators;
type CollectionOperators = 'contains' | 'notContains';
type AllFieldOperators = CollectionOperators | ScalarOperators;

// TODO: this is TEMP to make the types work.
class AsyncCollection<T> {
	toArray(): T[] {
		return [];
	}
}

type FinalFieldType<T> = T extends Promise<infer InnerPromiseType>
	? InnerPromiseType
	: T extends AsyncCollection<infer InnerCollectionType>
	? InnerCollectionType
	: T;

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

type Operator<T extends MatchableTypes> = T extends string[] | number[]
	? CollectionOperators
	: ScalarOperators;

type ModelPredicateExtendor<RT extends PersistentModel> = (
	lambda: ModelPredicate<RT>
) => {
	__query: GroupCondition;
}[];

type SingularModelPredicateExtendor<RT extends PersistentModel> = (
	lambda: ModelPredicate<RT>
) => {
	__query: GroupCondition;
};

type ValuePredicate<RT extends PersistentModel, MT extends MatchableTypes> = {
	[K in AllFieldOperators]: (
		...operands: Scalar<MT>[]
	) => FinalModelPredicate<RT>;
};

type ModelPredicateOperator<RT extends PersistentModel> = (
	...predicates: [ModelPredicateExtendor<RT>] | FinalModelPredicate<any>[]
) => FinalModelPredicate<RT>;

type ModelPredicateNegation<RT extends PersistentModel> = (
	predicate: SingularModelPredicateExtendor<RT> | FinalModelPredicate<any>
) => FinalModelPredicate<RT>;

type ModelPredicate<RT extends PersistentModel> = {
	[K in keyof RT]: FinalFieldType<RT[K]> extends PersistentModel
		? ModelPredicate<FinalFieldType<RT[K]>>
		: FinalFieldType<RT[K]> extends PersistentModel[]
		? ModelPredicate<FinalFieldType<Scalar<RT[K]>>>
		: ValuePredicate<RT, RT[K]>;
} & {
	or: ModelPredicateOperator<RT>;
	and: ModelPredicateOperator<RT>;
	not: ModelPredicateNegation<RT>;
	__copy: () => ModelPredicate<RT>;
} & FinalModelPredicate<RT>;

type FinalModelPredicate<RT extends PersistentModel> = {
	__class: PersistentModelConstructor<RT>;
	__className: string;
	__query: GroupCondition;
	__tail: GroupCondition;
	filter: (items: RT[]) => Promise<RT[]>;
};

type GroupConditionType<RT extends PersistentModel> = {
	operator: 'and' | 'or' | 'not';
	// conditions: (ModelPredicate<RT>)[]
	conditions: (ModelPredicate<RT> | GroupConditionType<RT> | Condition<RT>)[];
};

type Condition<T extends PersistentModel> = {
	[K in keyof T]: {
		fieldName: K;
		operator: Operator<T[K]>;
		operands: T[K][];
	};
}[keyof T];

type GroupOperator = 'and' | 'or' | 'not';

type UntypedCondition = {
	fetch: () => Promise<Record<string, any>>;
	matches: (item: Record<string, any>) => Promise<boolean>;
	copy(extract: GroupCondition): [UntypedCondition, GroupCondition | undefined];
};

class FieldCondition {
	constructor(
		public field: string,
		public operator: string, // TODO: tighter type?
		public operands: string[]
	) {
		this.validate();
	}

	copy(extract: GroupCondition): [FieldCondition, GroupCondition | undefined] {
		return [
			new FieldCondition(this.field, this.operator, [...this.operands]),
			undefined,
		];
	}

	async fetch(): Promise<Record<string, any>> {
		return Promise.reject('Not yet implemented.');
	}

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

	validate(): void {
		const _t = this;
		function argumentCount(count) {
			const argsClause = count === 1 ? 'argument is' : 'arguments are';
			return () => {
				if (_t.operands.length !== count) {
					return `Exactly ${count} ${argsClause} required.`;
				}
			};
		}

		// NOTE: validations should return a message on failure.
		// hence, they should be "joined" together with logical OR's.
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

class GroupCondition {
	constructor(
		public classname: string,
		public field: string | undefined,
		public operator: GroupOperator,
		public operands: UntypedCondition[]
	) {}

	copy(extract: GroupCondition): [GroupCondition, GroupCondition | undefined] {
		const copied = new GroupCondition(
			this.classname,
			this.field,
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

	async fetch(): Promise<Record<string, any>> {
		return Promise.reject('Not yet implemented.');
	}

	async matches(item: Record<string, any>): Promise<boolean> {
		const itemToCheck = this.field ? await item[this.field] : item;

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

async function asyncSome(
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

async function asyncEvery(
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

async function asyncFilter<T>(
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

// TODO: wayyyyyy too much nesting. DECOMPOSE.
// TODO: shouldn't this be returning FinalModelPredicate<T>?
export function predicateFor<T extends PersistentModel>(
	ModelType: PersistentModelConstructor<T>,
	field?: string,
	query?: GroupCondition,
	tail?: GroupCondition
): ModelPredicate<T> {
	//
	// TODO: when/where/how do we bail if `ModelType.__meta.syncable == false`?
	//

	// using this type explicitly instead of depending on the inference from ModelType
	// solves the "Type instantiation is excessively deep and possibly infinite" error.
	// Why? ... I have no idea. If someone can tell me ... uhh ... please do.
	type IndirectT = typeof ModelType extends PersistentModelConstructor<infer I>
		? I
		: never;

	const link = {
		__class: ModelType as PersistentModelConstructor<T>,
		__className: ModelType.name,
		__query: query || new GroupCondition(ModelType.name, field, 'and', []),
		__tail: new GroupCondition(ModelType.name, field, 'and', []),
		__copy: () => {
			const [query, newtail] = link.__query.copy(link.__tail);
			return predicateFor<IndirectT>(ModelType, undefined, query, newtail);
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
	// TODO: break `not` out? or let TS and runtime checks handle it later?
	['and', 'or'].forEach(op => {
		(link as any)[op] = (
			...builderOrPredicates:
				| [ModelPredicateExtendor<T>]
				| FinalModelPredicate<T>[]
		): FinalModelPredicate<T> => {
			const newlink = link.__copy();
			newlink.__tail.operands.push(
				new GroupCondition(
					ModelType.name,
					field,
					op as 'and' | 'or',
					typeof builderOrPredicates[0] === 'function'
						? builderOrPredicates[0](predicateFor<IndirectT>(ModelType)).map(
								p => p.__query
						  )
						: (builderOrPredicates as FinalModelPredicate<T>[]).map(
								p => p.__query
						  )
				)
			);

			// hmm ... do all these underscore props need to be here?
			return {
				__class: newlink.__class,
				__className: newlink.__className,
				__query: newlink.__query,
				__tail: newlink.__tail,
				filter: items => {
					return asyncFilter(items, i => newlink.__query.matches(i));
				},
			};
		};
	});

	link.not = (
		builderOrPredicate:
			| SingularModelPredicateExtendor<T>
			| FinalModelPredicate<T>
	): FinalModelPredicate<T> => {
		const newlink = link.__copy();
		newlink.__tail.operands.push(
			new GroupCondition(
				ModelType.name,
				field,
				'not',
				typeof builderOrPredicate === 'function'
					? [builderOrPredicate(predicateFor<IndirectT>(ModelType)).__query]
					: [builderOrPredicate.__query]
			)
		);

		// hmm ... do all these underscore props need to be here?
		return {
			__class: newlink.__class,
			__className: newlink.__className,
			__query: newlink.__query,
			__tail: newlink.__tail,
			filter: items => {
				return asyncFilter(items, i => newlink.__query.matches(i));
			},
		};
	};

	// looks like we need to build in a new/alt schema JSON
	// parsing thing ...

	for (const fieldName in ModelType.__meta.fields) {
		Object.defineProperty(link, fieldName, {
			enumerable: true,
			get: () => {
				const def = ModelType.__meta.fields[fieldName];
				if (!def.association) {
					return ops.reduce((fieldMatcher, operator) => {
						return {
							...fieldMatcher,
							[operator]: (...operands: any[]) => {
								const newlink = link.__copy();
								newlink.__tail.operands.push(
									new FieldCondition(fieldName, operator, operands)
								);

								// same question as above: do all these underscore props need to be here?
								return {
									__class: newlink.__class,
									__className: newlink.__className,
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
						def.association.connectionType === 'HAS_ONE'
					) {
						const [newquery, oldtail] = link.__query.copy(link.__tail);
						const newtail = new GroupCondition(
							def.association.targetName ||
								(def.association as any).associatedWith,
							fieldName,
							'and',
							[]
						);
						(oldtail as GroupCondition).operands.push(newtail);
						const newlink = predicateFor(
							(<ModelFieldType>def.type).modelConstructor,
							undefined,
							newquery,
							newtail
						);
						return newlink;
					} else if (def.association.connectionType === 'HAS_MANY') {
						throw new Error('Not implemented yet.');
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
