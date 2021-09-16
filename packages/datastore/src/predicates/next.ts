import { Options } from 'webpack';
import {
	Scalar,
	PersistentModel,
	PersistentModelConstructor,
	SchemaModel,
} from '../types';

type MatchableTypes =
	| string
	| string[]
	| number
	| number[]
	| boolean
	| boolean[];

type EqualityOperators = 'eq' | 'ne';
type ComparisonOperators = 'gt' | 'ge' | 'lt' | 'le' | 'between';
type ScalarOperators = EqualityOperators | ComparisonOperators;
type CollectionOperators = 'contains' | 'notContains';
type AllFieldOperators = CollectionOperators | ScalarOperators;

const ops: AllFieldOperators[] = [
	'eq',
	'ne',
	'gt',
	'ge',
	'lt',
	'le',
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

type ValuePredicate<RT extends PersistentModel, MT extends MatchableTypes> = {
	[K in AllFieldOperators]: (
		...operands: Scalar<MT>[]
	) => FinalModelPredicate<RT>;
};

type ModelPredicateOperator<RT extends PersistentModel> = (
	...predicates: [ModelPredicateExtendor<RT>] | FinalModelPredicate<RT>[]
) => FinalModelPredicate<RT>;

type ModelPredicate<RT extends PersistentModel> = {
	[K in keyof RT]: RT[K] extends PersistentModel
		? ModelPredicate<RT[K]>
		: RT[K] extends PersistentModel[]
		? ModelPredicate<Scalar<RT[K]>>
		: ValuePredicate<RT, RT[K]>;
} & {
	or: ModelPredicateOperator<RT>;
	and: ModelPredicateOperator<RT>;
	not: ModelPredicateOperator<RT>;
	__copy: () => ModelPredicate<RT>;
} & FinalModelPredicate<RT>;

type FinalModelPredicate<RT extends PersistentModel> = {
	__class: PersistentModelConstructor<RT>;
	__className: string;
	__query: GroupCondition;
	__tail: GroupCondition;
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
		public operator: string,
		public operands: string[]
	) {}

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
			eq: () => v == this.operands[0],
			ne: () => v != this.operands[0],
			gt: () => v > this.operands[0],
			ge: () => v >= this.operands[0],
			lt: () => v < this.operands[0],
			le: () => v <= this.operands[0],
			contains: () => v.indexOf(this.operands[0]) > -1,
			beginsWith: () => v.startsWith(this.operands[0]),
			between: () => v > this.operands[0] && v < this.operands[1],
		};
		const operation = operations[this.operator as keyof typeof operations];
		if (operation) {
			return operation();
		} else {
			throw new Error(`Invalid operator given: ${this.operator}`);
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
			// console.log('d', copied, copied.operands === undefined);
			copied.operands.push(operandCopy);
			extractedCopy = extractedCopy || extractedFromOperand;
		});

		return [copied, extractedCopy];
	}

	async fetch(): Promise<Record<string, any>> {
		return Promise.reject('Not yet implemented.');
	}

	async matches(item: Record<string, any>): Promise<boolean> {
		if (this.field) {
			item = await item[this.field];
		}

		if (this.operator === 'or') {
			return asyncSome(this.operands, c => c.matches(item));
		} else if (this.operator === 'and') {
			return asyncEvery(this.operands, c => c.matches(item));
		} else if (this.operator === 'not') {
			// TODO: update TS to make not() take a single conditon.
			if (this.operands.length !== 1) {
				throw new Error(
					'Invalid arguments! `not()` accepts exactly one predicate expression.'
				);
			}
			return !this.operands[0].matches(item);
		} else {
			throw new Error('Invalid group operator!');
		}
	}
}

async function asyncSome(
	items: Record<string, any>[],
	matches: (item: Record<string, any>) => Promise<boolean>
): Promise<boolean> {
	for (let item of items) {
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
	for (let item of items) {
		if (!(await matches(item))) {
			return false;
		}
	}
	return true;
}

async function asyncFilter(
	items: Record<string, any>[],
	matches: (item: Record<string, any>) => Promise<boolean>
): Promise<Record<string, any>[]> {
	const results = [];
	for (let item of items) {
		if (await matches(item)) {
			results.push(item);
		}
	}
	return results;
}

// TODO: wayyyyyy too much nesting. DECOMPOSE.
// TODO: shouldn't this be returning FinalModelPredicate<T>?
export const Predicate = {
	for: function<T extends PersistentModel>(
		ModelType: PersistentModelConstructor<T>,
		field?: string,
		query?: GroupCondition,
		tail?: GroupCondition
	): ModelPredicate<T> {
		//
		// TODO: when/where/how do we bail if `ModelType.__meta.syncable == false`?
		//

		const link: ModelPredicate<T> = {
			__class: ModelType as PersistentModelConstructor<T>,
			__className: ModelType.name,
			__query: query || new GroupCondition(ModelType.name, field, 'and', []),
			__tail: new GroupCondition(ModelType.name, field, 'and', []),
			__copy: () => {
				const [query, newtail] = link.__query.copy(link.__tail);
				return Predicate.for(ModelType, undefined, query, newtail);
			},
		} as ModelPredicate<T>;

		// if we're already building on a query, we need to extend it.
		// the tail is already constructed. just add it.
		if (tail) {
			link.__tail = tail;
		} else if (query) {
			// console.log('a', link.__query, link.__query.operands === undefined);
			link.__query.operands.push(link.__tail);
		} else {
			// only if it's a new query does tail === head
			link.__tail = link.__query;
		}

		// TODO: better handled with proxy?
		// TODO: break `not` out? or let TS and runtime checks handle it later?
		['and', 'or', 'not'].forEach(op => {
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
						op as 'and' | 'or' | 'not',
						typeof builderOrPredicates[0] === 'function'
							? builderOrPredicates[0](Predicate.for(ModelType)).map(
									p => p.__query
							  )
							: (builderOrPredicates as FinalModelPredicate<T>[]).map(
									p => p.__query
							  )
					)
				);

				// wait. is this the right return value?! ... (i think not...)
				// (it should be a pruned down FinalModelPredicate<T> I think.)
				return newlink;
			};
		});

		// looks like we need to build in a new/alt schema JSON
		// parsing thing ...

		for (let fieldName in ModelType.__meta.fields) {
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
									// if we wnat to re-enable implicit and stuff, return newLink here.
									return {
										__class: newlink.__class,
										__className: newlink.__className,
										__query: newlink.__query,
										__tail: newlink.__tail,
									};
								},
							};
						}, {});
					} else {
						if (def.association.targetName) {
							// this gives us the associated model name ... right?
							const [newquery, oldtail] = link.__query.copy(link.__tail);
							const newtail = new GroupCondition(
								def.association.targetName,
								fieldName,
								'and',
								[]
							);
							(oldtail as GroupCondition).operands.push(newtail);
							const newlink = Predicate.for(
								//
								// how do we get from name to type here?
								//
								def.type.model,
								fieldName,
								newquery,
								newtail
							);
							// NOTE: Future self, beware! This return-value *is*
							// correct! It facilitates Model.ChildModel.<more stuff> ...
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
	},
};
