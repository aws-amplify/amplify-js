import {
	predicateFor,
	recursivePredicateFor,
	internals,
} from '../src/predicates/next';
import {
	PersistentModel,
	PersistentModelConstructor,
	ModelPredicate as FlatModelPredicate,
	PaginationInput,
	SchemaModel,
	Schema,
} from '../src/types';
import {
	ModelPredicateCreator,
	PredicateAll,
	Predicates as V1Predicates,
} from '../src/predicates';
import {
	validatePredicate as flatPredicateMatches,
	asyncFilter,
} from '../src/util';
import {
	predicateToGraphQLCondition,
	predicateToGraphQLFilter,
} from '../src/sync/utils';
import { schema, Author, Post, Blog, BlogOwner, Person } from './model';
import { AsyncCollection } from '../src';

const AuthorMeta = {
	builder: Author,
	schema: schema.models['Author'],
	pkField: ['id'],
};

const BlogMeta = {
	builder: Blog,
	schema: schema.models['Blog'],
	pkField: ['id'],
};

const PostMeta = {
	builder: Post,
	schema: schema.models['Post'],
	pkField: ['id'],
};

const PersonMeta = {
	builder: Person,
	schema: schema.models['Person'],
	pkField: ['id'],
};

const metas = {
	Author: AuthorMeta,
	Blog: BlogMeta,
	Post: PostMeta,
	BlogOwner: {
		builder: BlogOwner,
		schema: schema.models['BlogOwner'],
		pkField: ['id'],
	},
	Person: PersonMeta,
};

type ModelOf<T> = T extends PersistentModelConstructor<infer M> ? M : T;

function getStorageFake(collections) {
	return {
		collections,

		async query<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			predicate?: FlatModelPredicate<T>,
			pagination?: PaginationInput<T>,
		) {
			const baseSet: T[] = this.collections[modelConstructor.name].map(item => {
				const itemCopy = { ...item };

				return itemCopy;
			});

			if (!predicate) {
				return baseSet;
			} else {
				const predicates = ModelPredicateCreator.getPredicates(predicate)!;
				return baseSet.filter(item =>
					flatPredicateMatches(item, 'and', [predicates]),
				);
			}
		},
	};
}

describe('Predicates', () => {
	describe('validate arguments by throwing exceptions for', () => {
		[
			'eq',
			'ne',
			'gt',
			'ge',
			'lt',
			'le',
			'beginsWith',
			'contains',
			'notContains',
		].forEach(operator => {
			describe(`\`${operator}\` when`, () => {
				test('no argument is given', () => {
					expect(() => {
						recursivePredicateFor(AuthorMeta).name[operator]();
					}).toThrow(
						`Incorrect usage of \`${operator}()\`: Exactly 1 argument is required.`,
					);
				});

				test('too many arguments are given', () => {
					expect(() => {
						recursivePredicateFor(AuthorMeta).name[operator]('a', 'b');
					}).toThrow(
						`Incorrect usage of \`${operator}()\`: Exactly 1 argument is required.`,
					);
				});
			});
		});

		describe('`between` when', () => {
			test('no bounds are given', async () => {
				expect(() => {
					// @ts-ignore
					recursivePredicateFor(AuthorMeta).name.between();
				}).toThrow(
					'Incorrect usage of `between()`: Exactly 2 arguments are required.',
				);
			});

			test('only one bound is given', async () => {
				expect(() => {
					// @ts-ignore
					recursivePredicateFor(AuthorMeta).name.between('z');
				}).toThrow(
					'Incorrect usage of `between()`: Exactly 2 arguments are required.',
				);
			});

			test('lowerbound > upperbound', async () => {
				expect(() => {
					recursivePredicateFor(AuthorMeta).name.between('z', 'a');
				}).toThrow(
					'Incorrect usage of `between()`: The first argument must be less than or equal to the second argument.',
				);
			});

			test('more than 2 arguments are given', async () => {
				expect(() => {
					// @ts-ignore
					recursivePredicateFor(AuthorMeta).name.between('a', 'b', 'c');
				}).toThrow(
					'Incorrect usage of `between()`: Exactly 2 arguments are required.',
				);
			});
		});
	});

	/**
	 *
	 * ~~~ NOTICE ~~~
	 *
	 * All new predicate test cases should follow the pattern below to ensure
	 * they function the same in both query() and filter() contexts.
	 */

	describe('on local properties ', () => {
		const getFlatAuthorsArrayFixture = () => {
			return [
				'Adam West',
				'Bob Jones',
				'Clarice Starling',
				'Debbie Donut',
				'Zelda from the Legend of Zelda',
			].map((name, index) => {
				return new Author({
					name,

					// [true, false, true, false, true]
					isActive: index % 2 === 0,

					// [0, .25, .5, .75, 1]
					rating: index / 4,

					// [0, 1, 2, 3, 4]
					karma: index,
				});
			});
		};

		[
			{
				name: 'filters',
				execute: async <T>(query: any) =>
					asyncFilter(getFlatAuthorsArrayFixture(), i =>
						internals(query).matches(i),
					),
			},
			{
				name: 'storage predicates',
				execute: async <T>(query: any) => {
					return (await internals(query).fetch(
						getStorageFake({
							[Author.name]: getFlatAuthorsArrayFixture(),
						}) as any,
					)) as T[];
				},
			},
		].forEach(mechanism => {
			describe('as ' + mechanism.name, () => {
				// REMINDER! string comparison uses ASCII values. and lowercase > upper case
				// e.g.: 'a' > 'A' && 'b' > 'a' && 'a' > 'Z'  === true

				describe('on string fields', () => {
					test('match on eq', async () => {
						const query =
							recursivePredicateFor(AuthorMeta).name.eq('Adam West');
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on eq - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.eq('Adam West'),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ne', async () => {
						const query =
							recursivePredicateFor(AuthorMeta).name.ne('Adam West');
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ne - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.ne('Adam West'),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on gt', async () => {
						const query =
							recursivePredicateFor(AuthorMeta).name.gt('Clarice Starling');
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on gt - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.gt('Clarice Starling'),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ge', async () => {
						const query =
							recursivePredicateFor(AuthorMeta).name.ge('Clarice Starling');
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ge - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.ge('Clarice Starling'),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on lt', async () => {
						const query =
							recursivePredicateFor(AuthorMeta).name.lt('Clarice Starling');
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on lt - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.lt('Clarice Starling'),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on le', async () => {
						const query =
							recursivePredicateFor(AuthorMeta).name.le('Clarice Starling');
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on le - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.le('Clarice Starling'),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match beginsWith', async () => {
						const query =
							recursivePredicateFor(AuthorMeta).name.beginsWith('Debbie');
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match beginsWith - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.beginsWith('Debbie'),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match between an outer inclusive range', async () => {
						// `0` is immediately before `A`
						// `{` is immediately after `z`
						const query = recursivePredicateFor(AuthorMeta).name.between(
							'0',
							'{',
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(m => m.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match between an outer inclusive range - NEGATED', async () => {
						// `0` is immediately before `A`
						// `{` is immediately after `z`
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.between('0', '{'),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(0);
					});

					test('match between with equality at both ends', async () => {
						const query = recursivePredicateFor(AuthorMeta).name.between(
							'Bob Jones',
							'Debbie Donut',
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match between with equality at both ends - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.between('Bob Jones', 'Debbie Donut'),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match between an inner range', async () => {
						const query = recursivePredicateFor(AuthorMeta).name.between(
							'Az',
							'E',
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match between an inner range - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.between('Az', 'E'),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match nothing between a mismatching range', async () => {
						const query = recursivePredicateFor(AuthorMeta).name.between(
							'{',
							'}',
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(0);
					});

					test('match nothing between a mismatching range - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.between('{', '}'),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(5);
					});

					test('match contains', async () => {
						const query =
							recursivePredicateFor(AuthorMeta).name.contains('Jones');
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match contains - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.contains('Jones'),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match notContains', async () => {
						const query =
							recursivePredicateFor(AuthorMeta).name.notContains('Jones');
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match notContains - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.notContains('Jones'),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});
				});

				describe('on boolean fields', () => {
					test('match on eq', async () => {
						const query = recursivePredicateFor(AuthorMeta).isActive.eq(true);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on eq - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.isActive.eq(true),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ne', async () => {
						const query = recursivePredicateFor(AuthorMeta).isActive.ne(true);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ne - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.isActive.ne(true),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on gt true', async () => {
						const query = recursivePredicateFor(AuthorMeta).isActive.gt(true);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.length).toBe(0);
					});

					test('match on gt true - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.isActive.gt(true),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.length).toBe(5);
					});

					test('match on gt false', async () => {
						const query = recursivePredicateFor(AuthorMeta).isActive.gt(false);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on gt false - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.isActive.gt(false),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ge true - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.isActive.ge(true),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ge false', async () => {
						const query = recursivePredicateFor(AuthorMeta).isActive.ge(false);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.length).toBe(5);
					});

					test('match on ge false - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.isActive.ge(false),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.length).toBe(0);
					});

					test('match on lt true', async () => {
						const query = recursivePredicateFor(AuthorMeta).isActive.lt(true);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on lt true - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.isActive.lt(true),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on lt false', async () => {
						const query = recursivePredicateFor(AuthorMeta).isActive.lt(false);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.length).toBe(0);
					});

					test('match on lt false - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.isActive.lt(false),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.length).toBe(5);
					});

					test('match on le true', async () => {
						const query = recursivePredicateFor(AuthorMeta).isActive.le(true);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.length).toBe(5);
					});

					test('match on le true - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.isActive.le(true),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.length).toBe(0);
					});

					test('match on le false', async () => {
						const query = recursivePredicateFor(AuthorMeta).isActive.le(false);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on le false - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.isActive.le(false),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});
				});

				describe('on int fields', () => {
					test('match on eq', async () => {
						const query = recursivePredicateFor(AuthorMeta).karma.eq(3);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on eq - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.karma.eq(3),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ne', async () => {
						const query = recursivePredicateFor(AuthorMeta).karma.ne(3);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ne - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.karma.ne(3),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on gt', async () => {
						const query = recursivePredicateFor(AuthorMeta).karma.gt(3);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on gt - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.karma.gt(3),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ge', async () => {
						const query = recursivePredicateFor(AuthorMeta).karma.ge(3);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ge - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.karma.ge(3),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on lt', async () => {
						const query = recursivePredicateFor(AuthorMeta).karma.lt(3);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on lt - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.karma.lt(3),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on le', async () => {
						const query = recursivePredicateFor(AuthorMeta).karma.le(3);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on le - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.karma.le(3),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on between', async () => {
						const query = recursivePredicateFor(AuthorMeta).karma.between(1, 3);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on between - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.karma.between(1, 3),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});
				});

				describe('on float fields', () => {
					test('match on eq', async () => {
						const query = recursivePredicateFor(AuthorMeta).rating.eq(0.75);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on eq - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.rating.eq(0.75),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ne', async () => {
						const query = recursivePredicateFor(AuthorMeta).rating.ne(0.75);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ne - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.rating.ne(0.75),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on gt', async () => {
						const query = recursivePredicateFor(AuthorMeta).rating.gt(0.75);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on gt - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.rating.gt(0.75),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ge', async () => {
						const query = recursivePredicateFor(AuthorMeta).rating.ge(0.75);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on ge - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.rating.ge(0.75),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on lt', async () => {
						const query = recursivePredicateFor(AuthorMeta).rating.lt(0.75);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							// 'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on lt - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.rating.lt(0.75),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on le', async () => {
						const query = recursivePredicateFor(AuthorMeta).rating.le(0.75);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on le - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.rating.le(0.75),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('match on between', async () => {
						const query = recursivePredicateFor(AuthorMeta).rating.between(
							0.25,
							0.75,
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							// 'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							// 'Zelda from the Legend of Zelda',
						]);
					});

					test('match on between - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.rating.between(0.25, 0.75),
						);
						const matches =
							await mechanism.execute<ModelOf<ModelOf<typeof Author>>>(query);

						expect(matches.map(n => n.name)).toEqual([
							'Adam West',
							// 'Bob Jones',
							// 'Clarice Starling',
							// 'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});
				});

				describe('predicate typings', () => {
					test('not group builders must return single child condition - recursive/relational predicates', async () => {
						expect(() =>
							// TODO: @ts-expect-error doesn't work until TS 3.9 ... until then:
							// @ts-ignore
							recursivePredicateFor(AuthorMeta).not(a => [
								a.name.contains('Bob'),
							]),
						).toThrow(
							"Invalid predicate. Terminate your predicate with a valid condition (e.g., `p => p.field.eq('value')`) or pass `Predicates.ALL`.",
						);
					});

					test('and group builders must return an array of child conditions - recursive/relational predicates', async () => {
						expect(() =>
							recursivePredicateFor(AuthorMeta).and(a =>
								// TODO: @ts-expect-error doesn't work until TS 3.9 ... until then:
								// @ts-ignore
								a.name.contains('Bob'),
							),
						).toThrow(
							'Invalid predicate. `and` groups must return an array of child conditions.',
						);
					});

					test('or group builders must return array of child conditions - recursive/relational predicates', async () => {
						expect(() =>
							// TODO: @ts-expect-error doesn't work until TS 3.9 ... until then:
							// @ts-ignore
							recursivePredicateFor(AuthorMeta).or(a => a.name.contains('Bob')),
						).toThrow(
							'Invalid predicate. `or` groups must return an array of child conditions.',
						);
					});

					test('not group builders must return single child condition - flat predicates', async () => {
						expect(() =>
							// TODO: @ts-expect-error doesn't work until TS 3.9 ... until then:
							// @ts-ignore
							predicateFor(AuthorMeta).not(a => [a.name.contains('Bob')]),
						).toThrow(
							"Invalid predicate. Terminate your predicate with a valid condition (e.g., `p => p.field.eq('value')`) or pass `Predicates.ALL`.",
						);
					});

					test('and group builders must return an array of child conditions - flat predicates', async () => {
						expect(() =>
							// TODO: @ts-expect-error doesn't work until TS 3.9 ... until then:
							// @ts-ignore
							predicateFor(AuthorMeta).and(a => a.name.contains('Bob')),
						).toThrow(
							'Invalid predicate. `and` groups must return an array of child conditions.',
						);
					});

					test('or group builders must return array of child conditions - flat predicates', async () => {
						expect(() =>
							// TODO: @ts-expect-error doesn't work until TS 3.9 ... until then:
							// @ts-ignore
							predicateFor(AuthorMeta).or(a => a.name.contains('Bob')),
						).toThrow(
							'Invalid predicate. `or` groups must return an array of child conditions.',
						);
					});
				});

				describe('with a logical grouping', () => {
					test('can perform and() logic, matching an item', async () => {
						const query = recursivePredicateFor(AuthorMeta).and(a => [
							a.name.contains('Bob'),
							a.name.contains('Jones'),
						]);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(1);
						expect(matches[0].name).toBe('Bob Jones');
					});

					test('can perform and() logic, matching an item - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(negated =>
							negated.and(a => [
								a.name.contains('Bob'),
								a.name.contains('Jones'),
							]),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(4);
						expect(matches.map(n => n.name)).not.toContain('Bob Jones');
					});

					test('can perform and() logic, matching no items', async () => {
						const query = recursivePredicateFor(AuthorMeta).and(a => [
							a.name.contains('Adam'),
							a.name.contains('Donut'),
						]);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(0);
					});

					test('can perform and() logic, matching no items - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(negated =>
							negated.and(a => [
								a.name.contains('Adam'),
								a.name.contains('Donut'),
							]),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(5);
					});

					test('can perform or() logic, matching different items', async () => {
						const query = recursivePredicateFor(AuthorMeta).or(a => [
							a.name.contains('Bob'),
							a.name.contains('Donut'),
						]);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(2);
						expect(matches.map(m => m.name)).toEqual([
							'Bob Jones',
							'Debbie Donut',
						]);
					});

					test('can perform or() logic, matching different items - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(negated =>
							negated.or(a => [
								a.name.contains('Bob'),
								a.name.contains('Donut'),
							]),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(3);
						expect(matches.map(m => m.name)).not.toContain('Bob Jones');
						expect(matches.map(m => m.name)).not.toContain('Debbie Donut');
					});

					test('can perform or() logic, matching a single item', async () => {
						const query = recursivePredicateFor(AuthorMeta).or(a => [
							a.name.contains('Bob'),
							a.name.contains('Jones'),
						]);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(1);
						expect(matches[0].name).toEqual('Bob Jones');
					});

					test('can perform or() logic, matching a single item - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(negated =>
							negated.or(a => [
								a.name.contains('Bob'),
								a.name.contains('Jones'),
							]),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(4);
						expect(matches.map(n => n.name)).not.toContain('Bob Jones');
					});

					test('can perform or() logic, matching a single item with extra unmatched conditions', async () => {
						const query = recursivePredicateFor(AuthorMeta).or(a => [
							a.name.contains('Bob'),
							a.name.contains('Thanos'),
						]);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(1);
						expect(matches[0].name).toEqual('Bob Jones');
					});

					test('can perform or() logic, matching NO items', async () => {
						const query = recursivePredicateFor(AuthorMeta).or(a => [
							a.name.contains('Thanos'),
							a.name.contains('Thor (God of Thunder, as it just so happens)'),
						]);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(0);
					});

					test('can perform or() logic with nested and() logic', async () => {
						const query = recursivePredicateFor(AuthorMeta).or(author_or => [
							author_or.and(a => [
								a.name.contains('Bob'),
								a.name.contains('Jones'),
							]),
							author_or.and(a => [
								a.name.contains('Debbie'),
								a.name.contains('from the Legend of Zelda'),
							]),
						]);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(1);
						expect(matches.map(m => m.name)).toEqual(['Bob Jones']);
					});

					test('can perform and() logic with nested or() logic', async () => {
						const query = recursivePredicateFor(AuthorMeta).and(author_and => [
							author_and.or(a => [
								a.name.contains('Bob'),
								a.name.contains('Donut'),
							]),
							author_and.or(a => [
								a.name.contains('Debbie'),
								a.name.contains('from the Legend of Zelda'),
							]),
						]);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(1);
						expect(matches.map(m => m.name)).toEqual(['Debbie Donut']);
					});

					test('can perform and() logic with nested or() logic - NEGATED', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(c =>
							c.and(author_and => [
								author_and.or(a => [
									a.name.contains('Bob'),
									a.name.contains('Donut'),
								]),
								author_and.or(a => [
									a.name.contains('Debbie'),
									a.name.contains('from the Legend of Zelda'),
								]),
							]),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(4);
						expect(matches.map(m => m.name)).not.toContain('Debbie Donut');
					});

					test('can perform simple not() logic, matching all but one item', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.eq('Bob Jones'),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(4);
						expect(matches.map(m => m.name)).toEqual([
							'Adam West',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('can perform simple not() logic, matching no items', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a =>
							a.name.gt('0'),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(0);
					});

					test('can perform not() logic around another logical group, matching all but N items', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(author =>
							author.or(a => [
								a.name.eq('Bob Jones'),
								a.name.eq('Debbie Donut'),
								a.name.between('C', 'D'),
							]),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(2);
						expect(matches.map(m => m.name)).toEqual([
							'Adam West',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('can perform 2-nots', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a1 =>
							a1.not(a2 => a2.name.eq('Bob Jones')),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(1);
						expect(matches.map(m => m.name)).toEqual(['Bob Jones']);
					});

					test('can perform 3-nots', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a1 =>
							a1.not(a2 => a2.not(a3 => a3.name.eq('Bob Jones'))),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(4);
						expect(matches.map(m => m.name)).toEqual([
							'Adam West',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('can perform 4-nots', async () => {
						const query = recursivePredicateFor(AuthorMeta).not(a1 =>
							a1.not(a2 => a2.not(a3 => a3.not(a4 => a4.name.eq('Bob Jones')))),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(1);
						expect(matches.map(m => m.name)).toEqual(['Bob Jones']);
					});

					// NOTE: `DataStore.query(Model)` should not construct a base predicate, and there
					// is therefore nothing to test on this interface. However, if Predicate.ALL is
					// explicitly passed, it *sometimes* fails the `isPredicateAll()` check. So, we need
					// to test for Predicates.ALL handling a little strangely here -- which basically
					// amounts to ensuring the Predicates.ALL operates like a customer-provided predicate
					// builder.

					test('can fetch ALL with Predicates.ALL', async () => {
						// Predicates.ALL is expected to return our base match-all predicate as-is.
						const query = (V1Predicates.ALL as any)(
							recursivePredicateFor(AuthorMeta),
						);
						const matches =
							await mechanism.execute<ModelOf<typeof Author>>(query);

						expect(matches.length).toBe(5);
						expect(matches.map(m => m.name)).toEqual([
							'Adam West',
							'Bob Jones',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});
				});
			});
		});
	});

	describe('handling of null and undefined', () => {
		const getFixture = () => {
			return ['null 01', 'defined 01', 'null 02', 'defined 02', 'null 03'].map(
				name => {
					return new Person({
						firstName: `${name} first name`,
						lastName: `${name} last name`,
						username: name.includes('null') ? null : name,
						age: name.includes('null') ? null : parseInt(name.split(' ')[1]),
					});
				},
			);
		};

		[
			{
				name: 'filters',
				execute: async <T>(query: any) =>
					asyncFilter(getFixture(), i => internals(query).matches(i)),
			},
			{
				name: 'storage predicates',
				execute: async <T>(query: any) => {
					return (await internals(query).fetch(
						getStorageFake({
							[Person.name]: getFixture(),
						}) as any,
					)) as T[];
				},
			},
		].forEach(mechanism => {
			describe(`as ${mechanism.name}`, () => {
				test('can select non-null values by their defined values', async () => {
					const query =
						recursivePredicateFor(PersonMeta).username.eq('defined 01');
					const matches =
						await mechanism.execute<ModelOf<typeof Person>>(query);

					expect(matches.length).toBe(1);
					expect(matches.map(n => n.username)).toEqual(['defined 01']);
				});

				test('can select non-null values by searching for != null', async () => {
					const query = recursivePredicateFor(PersonMeta).username.ne(
						null as any,
					);
					const matches =
						await mechanism.execute<ModelOf<typeof Person>>(query);

					expect(matches.length).toBe(2);
					expect(matches.map(n => n.username)).toEqual([
						'defined 01',
						'defined 02',
					]);
				});

				test('can select non-null values by searching for != undefined', async () => {
					const query =
						recursivePredicateFor(PersonMeta).username.ne(undefined);
					const matches =
						await mechanism.execute<ModelOf<typeof Person>>(query);

					expect(matches.length).toBe(2);
					expect(matches.map(n => n.username)).toEqual([
						'defined 01',
						'defined 02',
					]);
				});

				test('can select null values by searching for == null', async () => {
					const query = recursivePredicateFor(PersonMeta).username.eq(
						null as any,
					);
					const matches =
						await mechanism.execute<ModelOf<typeof Person>>(query);

					expect(matches.length).toBe(3);
					expect(matches.map(n => n.username)).toEqual([null, null, null]);
				});

				test('can select null values by searching for == undefined', async () => {
					const query =
						recursivePredicateFor(PersonMeta).username.eq(undefined);
					const matches =
						await mechanism.execute<ModelOf<typeof Person>>(query);

					expect(matches.length).toBe(3);
					expect(matches.map(n => n.username)).toEqual([null, null, null]);
				});

				describe('can query on null fields without error', () => {
					test('eq', async () => {
						expect.assertions(2);
						const query =
							recursivePredicateFor(PersonMeta).username.eq('defined 01');
						const matches =
							await mechanism.execute<ModelOf<typeof Person>>(query);
						expect(matches.length).toBe(1);
						expect(matches.map(n => n.username)).toEqual(['defined 01']);
					});

					test('ne', async () => {
						expect.assertions(2);
						const query =
							recursivePredicateFor(PersonMeta).username.ne('defined 01');
						const matches =
							await mechanism.execute<ModelOf<typeof Person>>(query);
						expect(matches.length).toBe(4);
						expect(matches.map(n => n.username)).toEqual([
							null,
							null,
							'defined 02',
							null,
						]);
					});

					test('gt', async () => {
						expect.assertions(2);
						const query = recursivePredicateFor(PersonMeta).age.gt(1);
						const matches =
							await mechanism.execute<ModelOf<typeof Person>>(query);
						expect(matches.length).toBe(1);
						expect(matches.map(n => n.username)).toEqual(['defined 02']);
					});

					test('ge', async () => {
						expect.assertions(2);
						const query = recursivePredicateFor(PersonMeta).age.ge(1);
						const matches =
							await mechanism.execute<ModelOf<typeof Person>>(query);
						expect(matches.length).toBe(2);
						expect(matches.map(n => n.username)).toEqual([
							'defined 01',
							'defined 02',
						]);
					});

					test('lt', async () => {
						expect.assertions(2);
						const query = recursivePredicateFor(PersonMeta).age.lt(2);
						const matches =
							await mechanism.execute<ModelOf<typeof Person>>(query);
						expect(matches.length).toBe(4);
						expect(matches.map(n => n.username)).toEqual([
							null,
							'defined 01',
							null,
							null,
						]);
					});

					test('le', async () => {
						expect.assertions(2);
						const query = recursivePredicateFor(PersonMeta).age.le(2);
						const matches =
							await mechanism.execute<ModelOf<typeof Person>>(query);
						expect(matches.length).toBe(5);
						expect(matches.map(n => n.username)).toEqual([
							null,
							'defined 01',
							null,
							'defined 02',
							null,
						]);
					});

					test('contains', async () => {
						expect.assertions(2);
						const query =
							recursivePredicateFor(PersonMeta).username.contains('defined');
						const matches =
							await mechanism.execute<ModelOf<typeof Person>>(query);
						expect(matches.length).toBe(2);
						expect(matches.map(n => n.username)).toEqual([
							'defined 01',
							'defined 02',
						]);
					});

					test('notContains', async () => {
						expect.assertions(2);
						const query =
							recursivePredicateFor(PersonMeta).username.notContains('defined');
						const matches =
							await mechanism.execute<ModelOf<typeof Person>>(query);
						expect(matches.length).toBe(3);
						expect(matches.map(n => n.username)).toEqual([null, null, null]);
					});

					test('beginsWith', async () => {
						expect.assertions(2);
						const query =
							recursivePredicateFor(PersonMeta).username.beginsWith('defined');
						const matches =
							await mechanism.execute<ModelOf<typeof Person>>(query);
						expect(matches.length).toBe(2);
						expect(matches.map(n => n.username)).toEqual([
							'defined 01',
							'defined 02',
						]);
					});

					test('between', async () => {
						expect.assertions(2);
						const query = recursivePredicateFor(PersonMeta).age.between(1, 2);
						const matches =
							await mechanism.execute<ModelOf<typeof Person>>(query);
						expect(matches.length).toBe(2);
						expect(matches.map(n => n.username)).toEqual([
							'defined 01',
							'defined 02',
						]);
					});
				});
			});
		});
	});

	describe('on related/nested properties', () => {
		const blogOwnerNames = [
			'Adam West',
			'Bob Jones',
			'Clarice Starling',
			'Debbie Donut',
			'Zelda from the Legend of Zelda',
		];

		const owners = blogOwnerNames.map(name => {
			const owner = {
				id: `ownerId${name}`,
				name,
			} as ModelOf<typeof BlogOwner>;
			return owner;
		});

		const blogs = owners.map(owner => {
			const blog = {
				id: `BlogID${owner.id}`,
				name: `${owner.name}'s Blog`,
				owner: Promise.resolve(owner),
				posts: new AsyncCollection([]),
				blogOwnerId: owner.id,
			} as ModelOf<typeof Blog>;
			(owner as any).blog = blog;
			return blog;
		});

		const posts = blogs
			.map(blog => {
				return [1, 2, 3, 4].map(n => {
					const post = {
						id: `postID${blog.id}${n}`,
						title: `${blog.name} post ${n}`,
						postBlogId: blog.id,
						blog: Promise.resolve(blog),
					} as unknown as ModelOf<typeof Post>;
					((blog.posts as any).values as any).push(post);
					return post;
				});
			})
			.flat();

		[
			//
			// NOTICE: the `filters` executor will need to be updated to select the right
			// collection to filter on if non-Blog cases are needed here:
			//
			{
				name: 'filters',
				execute: async <T>(query: any) =>
					asyncFilter(blogs, b => internals(query).matches(b)),
			},
			{
				name: 'storage predicates',
				execute: async <T>(query: any) => {
					return (await internals(query).fetch(
						getStorageFake({
							[BlogOwner.name]: owners,
							[Blog.name]: blogs,
							[Post.name]: posts,
						}) as any,
					)) as T[];
				},
			},
		].forEach(mechanism => {
			describe('as ' + mechanism.name, () => {
				test('can filter eq()', async () => {
					const query =
						recursivePredicateFor(BlogMeta).owner.name.eq('Adam West');
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(1);
					expect(matches[0].name).toBe("Adam West's Blog");
				});

				test('can filter ne()', async () => {
					const query =
						recursivePredicateFor(BlogMeta).owner.name.ne('Debbie Donut');
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(4);
					expect(matches.map(m => m.name)).toEqual([
						"Adam West's Blog",
						"Bob Jones's Blog",
						"Clarice Starling's Blog",
						"Zelda from the Legend of Zelda's Blog",
					]);
				});

				test('can filter nested or() .. and()', async () => {
					const query = recursivePredicateFor(BlogMeta).or(b => [
						b.owner.and(o => [
							o.name.contains('Bob'),
							o.name.contains('Jones'),
						]),
						b.owner.and(o => [
							o.name.contains('Debbie'),
							o.name.contains('Starling'),
						]),
					]);
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(1);
					expect(matches[0].name).toBe("Bob Jones's Blog");
				});

				test('can filter nested or() .. and() - NEGATED', async () => {
					const query = recursivePredicateFor(BlogMeta).not(c =>
						c.or(b => [
							b.owner.and(o => [
								o.name.contains('Bob'),
								o.name.contains('Jones'),
							]),
							b.owner.and(o => [
								o.name.contains('Debbie'),
								o.name.contains('Starling'),
							]),
						]),
					);
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(4);
					expect(matches.map(m => m.name)).not.toContain("Bob Jones's Blog");
				});

				test('can filter 3 level nested, logically grouped', async () => {
					const query = recursivePredicateFor(BlogMeta).or(b => [
						b.owner.and(o => [o.name.contains('Bob'), o.name.contains('West')]),
						b.owner.and(owner => [
							owner.blog.or(innerBlog => [
								innerBlog.name.contains('Debbie'),
								innerBlog.name.contains('from the Legend of Zelda'),
							]),
							owner.name.contains('Donut'),
						]),
					]);
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(1);
					expect(matches[0].name).toBe("Debbie Donut's Blog");
				});

				test('can filter 3 level nested, logically grouped - NEGATED', async () => {
					const query = recursivePredicateFor(BlogMeta).not(negated =>
						negated.or(b => [
							b.owner.and(o => [
								o.name.contains('Bob'),
								o.name.contains('West'),
							]),
							b.owner.and(owner => [
								owner.blog.or(innerBlog => [
									innerBlog.name.contains('Debbie'),
									innerBlog.name.contains('from the Legend of Zelda'),
								]),
								owner.name.contains('Donut'),
							]),
						]),
					);
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(4);
					expect(matches.map(n => n.name)).not.toContain("Debbie Donut's Blog");
				});

				test('can filter on child collections', async () => {
					const query =
						recursivePredicateFor(BlogMeta).posts.title.contains('Bob Jones');
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(1);
					expect(matches[0].name).toBe("Bob Jones's Blog");
				});

				test('can filter on child collections - NEGATED', async () => {
					const query = recursivePredicateFor(BlogMeta).not(negated =>
						negated.posts.title.contains('Bob Jones'),
					);
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(4);
					expect(matches.map(n => n.name)).not.toContain("Bob Jones's Blog");
				});

				test('can filter on child collections in or()', async () => {
					const query = recursivePredicateFor(BlogMeta).or(b => [
						b.posts.title.contains('Bob Jones'),
						b.posts.title.contains("Zelda's Blog post"),
					]);
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(2);
					expect(matches.map(m => m.name)).toEqual([
						"Bob Jones's Blog",
						"Zelda from the Legend of Zelda's Blog",
					]);
				});

				test('can filter on child collections in or() - NEGATED', async () => {
					const query = recursivePredicateFor(BlogMeta).not(negated =>
						negated.or(b => [
							b.posts.title.contains('Bob Jones'),
							b.posts.title.contains("Zelda's Blog post"),
						]),
					);
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(3);
					expect(matches.map(m => m.name)).not.toContain("Bob Jones's Blog");
					expect(matches.map(m => m.name)).not.toContain(
						"Zelda from the Legend of Zelda's Blog",
					);
				});

				test('can filter on or() extended off child collections', async () => {
					const query = recursivePredicateFor(BlogMeta).posts.or(p => [
						p.title.contains('Bob Jones'),
						p.title.contains("Zelda's Blog post"),
					]);
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(2);
					expect(matches.map(m => m.name)).toEqual([
						"Bob Jones's Blog",
						"Zelda from the Legend of Zelda's Blog",
					]);
				});

				test('can filter on or() extended off child collections - NEGATED', async () => {
					const query = recursivePredicateFor(BlogMeta).not(negated =>
						negated.posts.or(p => [
							p.title.contains('Bob Jones'),
							p.title.contains("Zelda's Blog post"),
						]),
					);
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(3);
					expect(matches.map(m => m.name)).not.toContain("Bob Jones's Blog");
					expect(matches.map(m => m.name)).not.toContain(
						"Zelda from the Legend of Zelda's Blog",
					);
				});

				test('can filter and() between parent and child collection properties', async () => {
					const query = recursivePredicateFor(BlogMeta).and(b => [
						b.name.contains('Bob Jones'),
						b.posts.title.contains('Zelda'),
					]);
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(0);
				});

				test('can filter and() between parent and child collection properties - NEGATED', async () => {
					const query = recursivePredicateFor(BlogMeta).not(negated =>
						negated.and(b => [
							b.name.contains('Bob Jones'),
							b.posts.title.contains('Zelda'),
						]),
					);
					const matches = await mechanism.execute<ModelOf<typeof Blog>>(query);

					expect(matches.length).toBe(5);
				});
			});
		});
	});

	describe('on recursive models/properties', () => {
		const names = [
			'Adam West',
			'Bob Jones',
			'Clarice Starling',
			'Debbie Donut',
			'Zelda from the Legend of Zelda',
		];

		const posts = names
			.map(name => {
				return [1, 2, 3, 4]
					.map(n => {
						const posts = [
							{
								id: `postID_${name}_${n}`,
								title: `${name} post ${n} ROOT`,
							} as ModelOf<typeof Post>,
						];
						let parent = posts[0];

						[1, 2, 3, 4].map(layer => {
							const child = {
								id: `postID_${name}_${n}_${layer}`,
								title: `${name} post ${n} layer ${layer}`,
							} as ModelOf<typeof Post>;
							(parent as any).reference = child;
							(parent as any).referencePostId = child.id;
							parent = child;
							posts.push(child);
						});

						return posts;
					})
					.flat();
			})
			.flat();

		[
			{
				name: 'filters',
				execute: async <T>(query: any) =>
					asyncFilter(posts, p => internals(query).matches(p)),
			},
			{
				name: 'storage predicates',
				execute: async <T>(query: any) =>
					(await internals(query).fetch(
						getStorageFake({
							[Post.name]: posts,
						}) as any,
					)) as T[],
			},
		].forEach(mechanism => {
			describe('as ' + mechanism.name, () => {
				test('can filter 1 level deep', async () => {
					const query = recursivePredicateFor(PostMeta).reference.title.eq(
						'Bob Jones post 2 layer 1',
					);
					const matches = await mechanism.execute<ModelOf<typeof Post>>(query);

					expect(matches.length).toBe(1);
					expect(matches.map(p => p.title)).toEqual(['Bob Jones post 2 ROOT']);
				});

				test('can filter 2 levels deep', async () => {
					const query = recursivePredicateFor(
						PostMeta,
					).reference.reference.title.eq('Bob Jones post 2 layer 2');
					const matches = await mechanism.execute<ModelOf<typeof Post>>(query);

					expect(matches.length).toBe(1);
					expect(matches.map(p => p.title)).toEqual(['Bob Jones post 2 ROOT']);
				});

				test('can filter 3 levels deep', async () => {
					const query = recursivePredicateFor(
						PostMeta,
					).reference.reference.reference.title.eq('Bob Jones post 2 layer 3');
					const matches = await mechanism.execute<ModelOf<typeof Post>>(query);

					expect(matches.length).toBe(1);
					expect(matches.map(p => p.title)).toEqual(['Bob Jones post 2 ROOT']);
				});

				test('safely returns [] on too many levels deep', async () => {
					const query = recursivePredicateFor(
						PostMeta,
					).reference.reference.reference.reference.reference.title.eq(
						'Bob Jones post 2 layer 4',
					);
					const matches = await mechanism.execute<ModelOf<typeof Post>>(query);

					expect(matches.length).toBe(0);
				});

				test('can filter 4 levels deep to match all', async () => {
					const query =
						recursivePredicateFor(
							PostMeta,
						).reference.reference.reference.reference.title.contains('layer 4');
					const matches = await mechanism.execute<ModelOf<typeof Post>>(query);

					expect(matches.length).toBe(20);
					expect(matches.map(m => m.title)).toEqual([
						'Adam West post 1 ROOT',
						'Adam West post 2 ROOT',
						'Adam West post 3 ROOT',
						'Adam West post 4 ROOT',
						'Bob Jones post 1 ROOT',
						'Bob Jones post 2 ROOT',
						'Bob Jones post 3 ROOT',
						'Bob Jones post 4 ROOT',
						'Clarice Starling post 1 ROOT',
						'Clarice Starling post 2 ROOT',
						'Clarice Starling post 3 ROOT',
						'Clarice Starling post 4 ROOT',
						'Debbie Donut post 1 ROOT',
						'Debbie Donut post 2 ROOT',
						'Debbie Donut post 3 ROOT',
						'Debbie Donut post 4 ROOT',
						'Zelda from the Legend of Zelda post 1 ROOT',
						'Zelda from the Legend of Zelda post 2 ROOT',
						'Zelda from the Legend of Zelda post 3 ROOT',
						'Zelda from the Legend of Zelda post 4 ROOT',
					]);
				});

				test('can filter at various levels', async () => {
					const query = recursivePredicateFor(PostMeta).and(top => [
						top.title.contains('3'),
						top.reference.title.contains('West'),
						top.reference.reference.title.contains('layer 2'),
					]);
					const matches = await mechanism.execute<ModelOf<typeof Post>>(query);

					expect(matches.length).toBe(1);
					expect(matches.map(m => m.title)).toEqual(['Adam West post 3 ROOT']);
				});

				test('can filter at various levels with range conditions', async () => {
					const query = recursivePredicateFor(PostMeta).and(top => [
						top.title.ge('Bob Jones post 2 ROOT'),
						top.reference.title.lt('Zelda'),
						top.reference.reference.title.contains('layer 2'),
					]);
					const matches = await mechanism.execute<ModelOf<typeof Post>>(query);

					expect(matches.length).toBe(11);
					expect(matches.map(m => m.title)).toEqual([
						'Bob Jones post 2 ROOT',
						'Bob Jones post 3 ROOT',
						'Bob Jones post 4 ROOT',
						'Clarice Starling post 1 ROOT',
						'Clarice Starling post 2 ROOT',
						'Clarice Starling post 3 ROOT',
						'Clarice Starling post 4 ROOT',
						'Debbie Donut post 1 ROOT',
						'Debbie Donut post 2 ROOT',
						'Debbie Donut post 3 ROOT',
						'Debbie Donut post 4 ROOT',
					]);
				});
			});
		});
	});

	describe('non-recursive predicate to storage predicate generation', () => {
		const ASTTransalationTestCases = [
			{
				gql: {},
				expectedRegeneration: {},
				matches: [{ name: 'abc' }],
				mismatches: [],
			},
			{
				gql: { and: [] },
				expectedRegeneration: {},
				matches: [{ name: 'abc' }],
				mismatches: [],
			},
			{
				gql: { and: [{ name: { eq: 'abc' } }, { or: [] }] },
				expectedRegeneration: {
					and: [{ name: { eq: 'abc' } }],
				},
				matches: [{ name: 'abc' }],
				mismatches: [{ name: 'abc_' }, { name: '_abc' }],
			},
			{
				gql: { and: { name: { eq: 'abc' } } },
				expectedRegeneration: {
					and: [{ name: { eq: 'abc' } }],
				},
				matches: [{ name: 'abc' }],
				mismatches: [{ name: 'abc_' }, { name: '_abc' }],
			},
			{
				gql: { and: [{ name: { eq: 'abc' } }] },
				expectedRegeneration: {
					and: [{ name: { eq: 'abc' } }],
				},
				matches: [{ name: 'abc' }],
				mismatches: [{ name: 'abc_' }, { name: '_abc' }],
			},
			{
				gql: {
					and: [{ name: { eq: 'abc' } }, { name: { gt: 'a' } }],
				},
				expectedRegeneration: {
					and: [{ name: { eq: 'abc' } }, { name: { gt: 'a' } }],
				},
				matches: [{ name: 'abc' }],
				mismatches: [{ name: 'abc_' }, { name: '_abc' }],
			},
			{
				gql: {
					and: [{ name: { gt: 'j' } }],
				},
				expectedRegeneration: {
					and: [{ name: { gt: 'j' } }],
				},
				matches: [{ name: 'tim' }, { name: 'sam' }],
				mismatches: [{ name: 'al' }, { name: 'fran' }],
			},
			{
				gql: {
					and: [{ rating: { gt: 123 } }],
				},
				expectedRegeneration: {
					and: [{ rating: { gt: 123 } }],
				},
				matches: [{ rating: 124 }, { rating: 125 }],
				mismatches: [{ rating: 122 }, { rating: 123 }],
			},
			{
				gql: {
					and: [{ rating: { eq: 123 } }],
				},
				expectedRegeneration: {
					and: [{ rating: { eq: 123 } }],
				},
				matches: [{ rating: 123 }],
				mismatches: [{ rating: 122 }, { rating: 124 }],
			},
		];

		for (const [i, testCase] of ASTTransalationTestCases.entries()) {
			test(`can create storage predicate from conditions AST ${i} : ${JSON.stringify(
				testCase.gql,
			)}`, () => {
				const condition = testCase.gql;
				const builder = ModelPredicateCreator.createFromAST(
					AuthorMeta.schema,
					condition,
				);
				const predicate = ModelPredicateCreator.getPredicates(builder)!;

				const regeneratedCondition = predicateToGraphQLCondition(
					predicate,
					AuthorMeta.schema,
				);
				const regeneratedFilter = predicateToGraphQLFilter(predicate);

				for (const expectedMatch of testCase.matches) {
					expect(flatPredicateMatches(expectedMatch, 'and', [predicate])).toBe(
						true,
					);
				}

				for (const expectedMismatch of testCase.mismatches) {
					expect(
						flatPredicateMatches(expectedMismatch, 'and', [predicate]),
					).toBe(false);
				}

				expect(regeneratedCondition).toEqual(testCase.expectedRegeneration);
				expect(regeneratedFilter).toEqual(testCase.expectedRegeneration);
			});
		}
		const predicateTestCases = [
			{
				predicate: p => p,
				matches: [{ name: 'abc' }],
				mismatches: [],
			},
			{
				predicate: p => p.name.eq('abc'),
				matches: [{ name: 'abc' }],
				mismatches: [{ name: 'abc_' }, { name: '_abc' }],
			},
			{
				predicate: p => p.name.ne('abc'),
				matches: [{ name: 'abc_' }, { name: '_abc' }],
				mismatches: [{ name: 'abc' }],
			},
			{
				predicate: p => p.name.gt('j'),
				matches: [{ name: 'tim' }, { name: 'sam' }],
				mismatches: [{ name: 'al' }, { name: 'fran' }],
			},
			{
				predicate: p => p.rating.eq(123),
				matches: [{ rating: 123 }],
				mismatches: [{ rating: 122 }, { rating: 124 }],
			},

			// `undefined` in predicates should be treated as `null` for matching purposes.
			// neither cloud storage nor any correctly implemented adapters respond with
			// `undefined` values in model instance fields.
			{
				predicate: p => p.name.eq(null),
				matches: [{ name: null }],
				mismatches: [{ name: '' }, { name: 'abc' }],
			},
			{
				predicate: p => p.name.ne(null),
				matches: [{ name: '' }, { name: 'abc' }],
				mismatches: [{ name: null }],
			},
			{
				predicate: p => p.name.eq(undefined),
				matches: [{ name: null }],
				mismatches: [{ name: '' }, { name: 'abc' }],
			},
			{
				predicate: p => p.name.ne(undefined),
				matches: [{ name: '' }, { name: 'abc' }],
				mismatches: [{ name: null }],
			},
		];
		for (const [i, testCase] of predicateTestCases.entries()) {
			test(`nested predicate builder can produce storage predicate ${i}: ${testCase.predicate}`, () => {
				const builder = internals(
					testCase.predicate(predicateFor(AuthorMeta)),
				).toStoragePredicate();

				const predicate = ModelPredicateCreator.getPredicates(builder)!;

				for (const expectedMatch of testCase.matches) {
					expect(flatPredicateMatches(expectedMatch, 'and', [predicate])).toBe(
						true,
					);
				}

				for (const expectedMismatch of testCase.mismatches) {
					expect(
						flatPredicateMatches(expectedMismatch, 'and', [predicate]),
					).toBe(false);
				}
			});
		}
	});
});
