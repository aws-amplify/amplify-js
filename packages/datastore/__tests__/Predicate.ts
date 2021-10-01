import { predicateFor } from '../src/predicates/next';
import {
	PersistentModel,
	PersistentModelConstructor,
	ModelPredicate as FlatModelPredicate,
	PaginationInput,
	SchemaModel,
	Schema,
} from '../src/types';
import { ModelPredicateCreator } from '../src/predicates';
import { validatePredicate as flatPredicateMatches } from '../src/util';
import { schema, Author, Post, Blog, BlogOwner } from './model';

const AuthorMeta = {
	builder: Author,
	schema: schema.models['Author'],
};

const BlogMeta = {
	builder: Blog,
	schema: schema.models['Blog'],
};

const metas = {
	Author: AuthorMeta,
	Blog: BlogMeta,
	Post: {
		builder: Post,
		schema: schema.models['Post'],
	},
	BlogOwner: {
		builder: BlogOwner,
		schema: schema.models['BlogOwner'],
	},
};

type ModelOf<T> = T extends PersistentModelConstructor<infer M> ? M : T;

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
						predicateFor(AuthorMeta).name[operator]();
					}).toThrow(
						`Incorrect usage of \`${operator}()\`: Exactly 1 argument is required.`
					);
				});

				test('too many arguments are given', () => {
					expect(() => {
						predicateFor(AuthorMeta).name[operator]('a', 'b');
					}).toThrow(
						`Incorrect usage of \`${operator}()\`: Exactly 1 argument is required.`
					);
				});
			});
		});

		describe('`between` when', () => {
			test('no bounds are given', async () => {
				expect(() => {
					predicateFor(AuthorMeta).name.between();
				}).toThrow(
					'Incorrect usage of `between()`: Exactly 2 arguments are required.'
				);
			});

			test('only one bound is given', async () => {
				expect(() => {
					predicateFor(AuthorMeta).name.between('z');
				}).toThrow(
					'Incorrect usage of `between()`: Exactly 2 arguments are required.'
				);
			});

			test('lowerbound > upperbound', async () => {
				expect(() => {
					predicateFor(AuthorMeta).name.between('z', 'a');
				}).toThrow(
					'Incorrect usage of `between()`: The first argument must be less than or equal to the second argument.'
				);
			});

			test('more than 2 arguments are given', async () => {
				expect(() => {
					predicateFor(AuthorMeta).name.between('a', 'b', 'c');
				}).toThrow(
					'Incorrect usage of `between()`: Exactly 2 arguments are required.'
				);
			});
		});
	});

	// TODO: NOTICE!
	// All test cases should be able to successfully execute both as filter()
	// and query() tests. When at all possible and relevant, add test cases HERE
	// to cover both cases with fidelity. (HERE == inside `defineTests(f)`)
	// function defineTests(f) {

	describe('on local properties ', () => {
		const getFlatAuthorsArrayFixture = function() {
			return [
				'Adam West',
				'Bob Jones',
				'Clarice Starling',
				'Debbie Donut',
				'Zelda from the Legend of Zelda',
			].map(name => new Author({ name }));
		};

		const getStorageFake = () => {
			return {
				collections: {
					[Author.name]: getFlatAuthorsArrayFixture(),
				},

				async query<T extends PersistentModel>(
					modelConstructor: PersistentModelConstructor<T>,
					predicate?: FlatModelPredicate<T>,
					pagination?: PaginationInput<T>
				) {
					const baseSet: T[] = this.collections[modelConstructor.name];
					if (!predicate) {
						return baseSet;
					} else {
						const predicates = ModelPredicateCreator.getPredicates(predicate);
						return baseSet.filter(item =>
							flatPredicateMatches(item, 'and', [predicates])
						);
					}
				},
			};
		};
		[
			{
				name: 'filters',
				execute: async <T>(query: any) =>
					query.filter(getFlatAuthorsArrayFixture()) as T[],
			},
			{
				name: 'storage predicates',
				execute: async <T>(query: any) =>
					(await query.__query.fetch(getStorageFake())) as T[],
			},
		].forEach(mechanism => {
			describe('as ' + mechanism.name, () => {
				// REMINDER! string comparison uses ASCII values. and lowercase > upper case
				// e.g.: 'a' > 'A' && 'b' > 'a' && 'a' > 'Z'  === true

				test('match on eq', async () => {
					const query = predicateFor(AuthorMeta).name.eq('Adam West');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(1);
					expect(matches[0].name).toBe('Adam West');
				});

				test('match on ne', async () => {
					const query = predicateFor(AuthorMeta).name.ne('Adam West');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(getFlatAuthorsArrayFixture().length - 1);
					expect(matches.some(a => a.name === 'Adam West')).toBe(false);
				});

				test('match on gt', async () => {
					const query = predicateFor(AuthorMeta).name.gt('Clarice Starling');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(2);
					expect(matches.map(m => m.name)).toEqual([
						'Debbie Donut',
						'Zelda from the Legend of Zelda',
					]);
				});

				test('match on ge', async () => {
					const query = predicateFor(AuthorMeta).name.ge('Clarice Starling');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(3);
					expect(matches.map(m => m.name)).toEqual([
						'Clarice Starling',
						'Debbie Donut',
						'Zelda from the Legend of Zelda',
					]);
				});

				test('match on lt', async () => {
					const query = predicateFor(AuthorMeta).name.lt('Clarice Starling');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(2);
					expect(matches.map(m => m.name)).toEqual(['Adam West', 'Bob Jones']);
				});

				test('match on le', async () => {
					const query = predicateFor(AuthorMeta).name.le('Clarice Starling');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(3);
					expect(matches.map(m => m.name)).toEqual([
						'Adam West',
						'Bob Jones',
						'Clarice Starling',
					]);
				});

				test('match beginsWith', async () => {
					const query = predicateFor(AuthorMeta).name.beginsWith('Debbie');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(1);
					expect(matches[0].name).toBe('Debbie Donut');
				});

				// GraphQL raises an exception when the given lower > upper.
				// I assume we're doing the same ...

				test('match between an outer inclusive range', async () => {
					// `0` is immediately before `A`
					// `{` is immediately after `z`
					const query = predicateFor(AuthorMeta).name.between('0', '{');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(5);
					expect(matches.map(m => m.name)).toEqual([
						'Adam West',
						'Bob Jones',
						'Clarice Starling',
						'Debbie Donut',
						'Zelda from the Legend of Zelda',
					]);
				});

				test('match between with equality at both ends', async () => {
					const query = predicateFor(AuthorMeta).name.between(
						'Bob Jones',
						'Debbie Donut'
					);
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(3);
					expect(matches.map(m => m.name)).toEqual([
						'Bob Jones',
						'Clarice Starling',
						'Debbie Donut',
					]);
				});

				test('match between an inner range', async () => {
					const query = predicateFor(AuthorMeta).name.between('Az', 'E');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(3);
					expect(matches.map(m => m.name)).toEqual([
						'Bob Jones',
						'Clarice Starling',
						'Debbie Donut',
					]);
				});

				test('match nothing between a mismatching range', async () => {
					const query = predicateFor(AuthorMeta).name.between('{', '}');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(0);
				});

				test('match contains', async () => {
					const query = predicateFor(AuthorMeta).name.contains('Jones');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(1);
					expect(matches[0].name).toBe('Bob Jones');
				});

				test('match notContains', async () => {
					const query = predicateFor(AuthorMeta).name.notContains('Jones');
					const matches = await mechanism.execute<typeof Author>(query);

					expect(matches.length).toBe(4);
					expect(matches.map(m => m.name)).toEqual([
						'Adam West',
						'Clarice Starling',
						'Debbie Donut',
						'Zelda from the Legend of Zelda',
					]);
				});

				describe('with a logical grouping', () => {
					test('can perform and() logic, matching an item', async () => {
						const query = predicateFor(AuthorMeta).and(a => [
							a.name.contains('Bob'),
							a.name.contains('Jones'),
						]);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(1);
						expect(matches[0].name).toBe('Bob Jones');
					});

					test('can perform and() logic, matching no items', async () => {
						const query = predicateFor(AuthorMeta).and(a => [
							a.name.contains('Adam'),
							a.name.contains('Donut'),
						]);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(0);
					});

					test('can perform or() logic, matching different items', async () => {
						const query = predicateFor(AuthorMeta).or(a => [
							a.name.contains('Bob'),
							a.name.contains('Donut'),
						]);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(2);
						expect(matches.map(m => m.name)).toEqual([
							'Bob Jones',
							'Debbie Donut',
						]);
					});

					test('can perform or() logic, matching a single item', async () => {
						const query = predicateFor(AuthorMeta).or(a => [
							a.name.contains('Bob'),
							a.name.contains('Jones'),
						]);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(1);
						expect(matches[0].name).toEqual('Bob Jones');
					});

					test('can perform or() logic, matching a single item with extra unmatched conditions', async () => {
						const query = predicateFor(AuthorMeta).or(a => [
							a.name.contains('Bob'),
							a.name.contains('Thanos'),
						]);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(1);
						expect(matches[0].name).toEqual('Bob Jones');
					});

					test('can perform or() logic, matching NO items', async () => {
						const query = predicateFor(AuthorMeta).or(a => [
							a.name.contains('Thanos'),
							a.name.contains('Thor (God of Thunder, as it just so happens)'),
						]);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(0);
					});

					test('can perform or() logic with nested and() logic', async () => {
						const query = predicateFor(AuthorMeta).or(author_or => [
							author_or.and(a => [
								a.name.contains('Bob'),
								a.name.contains('Jones'),
							]),
							author_or.and(a => [
								a.name.contains('Debbie'),
								a.name.contains('from the Legend of Zelda'),
							]),
						]);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(1);
						expect(matches.map(m => m.name)).toEqual(['Bob Jones']);
					});

					test('can perform and() logic with nested or() logic', async () => {
						const query = predicateFor(AuthorMeta).and(author_and => [
							author_and.or(a => [
								a.name.contains('Bob'),
								a.name.contains('Donut'),
							]),
							author_and.or(a => [
								a.name.contains('Debbie'),
								a.name.contains('from the Legend of Zelda'),
							]),
						]);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(1);
						expect(matches.map(m => m.name)).toEqual(['Debbie Donut']);
					});

					test('can perform simple not() logic, matching all but one item', async () => {
						const query = predicateFor(AuthorMeta).not(a =>
							a.name.eq('Bob Jones')
						);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(4);
						expect(matches.map(m => m.name)).toEqual([
							'Adam West',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('can perform simple not() logic, matching no items', async () => {
						const query = predicateFor(AuthorMeta).not(a => a.name.gt('0'));
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(0);
					});

					test('can perform not() logic around another logical group, matching all but N items', async () => {
						const query = predicateFor(AuthorMeta).not(author =>
							author.or(a => [
								a.name.eq('Bob Jones'),
								a.name.eq('Debbie Donut'),
								a.name.between('C', 'D'),
							])
						);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(2);
						expect(matches.map(m => m.name)).toEqual([
							'Adam West',
							'Zelda from the Legend of Zelda',
						]);
					});

					// TODO: test case for not not and not not not
					test('can perform 2-nots', async () => {
						const query = predicateFor(AuthorMeta).not(a1 =>
							a1.not(a2 => a2.name.eq('Bob Jones'))
						);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(1);
						expect(matches.map(m => m.name)).toEqual(['Bob Jones']);
					});

					test('can perform 3-nots', async () => {
						const query = predicateFor(AuthorMeta).not(a1 =>
							a1.not(a2 => a2.not(a3 => a3.name.eq('Bob Jones')))
						);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(4);
						expect(matches.map(m => m.name)).toEqual([
							'Adam West',
							'Clarice Starling',
							'Debbie Donut',
							'Zelda from the Legend of Zelda',
						]);
					});

					test('can perform 4-nots', async () => {
						const query = predicateFor(AuthorMeta).not(a1 =>
							a1.not(a2 => a2.not(a3 => a3.not(a4 => a4.name.eq('Bob Jones'))))
						);
						const matches = await mechanism.execute<typeof Author>(query);

						expect(matches.length).toBe(1);
						expect(matches.map(m => m.name)).toEqual(['Bob Jones']);
					});

					// TODO: test case(s) for no predicate / predicate.all
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
				owner,
				posts: [],
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
						blog,
					} as ModelOf<typeof Post>;
					blog.posts.push(post);
					return post;
				});
			})
			.flat();

		const storage = {
			collections: {
				[BlogOwner.name]: owners,
				[Blog.name]: blogs,
				[Post.name]: posts,
			},

			async query<T extends PersistentModel>(
				modelConstructor: PersistentModelConstructor<T>,
				predicate?: FlatModelPredicate<T>,
				pagination?: PaginationInput<T>
			) {
				const baseSet: T[] = this.collections[modelConstructor.name].map(
					item => {
						const itemCopy = { ...item };

						// simulating goofiness with DS stuffing ID's into related model field names.
						const meta = metas[modelConstructor.name].schema as SchemaModel;
						for (const field of Object.values(meta.fields)) {
							if (field.association) {
								itemCopy[field.name] = itemCopy[field.association.targetName];
							}
						}
						return itemCopy;
					}
				);

				if (!predicate) {
					return baseSet;
				} else {
					const predicates = ModelPredicateCreator.getPredicates(predicate);
					return baseSet.filter(item =>
						flatPredicateMatches(item, 'and', [predicates])
					);
				}
			},
		};

		[
			{
				name: 'filters',
				execute: async <T>(query: any) => query.filter(blogs) as T[],
			},
			{
				name: 'storage predicates',
				execute: async <T>(query: any) =>
					(await query.__query.fetch(storage)) as T[],
			},
		].forEach(mechanism => {
			describe('as ' + mechanism.name, () => {
				test('can filter eq()', async () => {
					const query = predicateFor(BlogMeta).owner.name.eq('Adam West');
					const matches = await mechanism.execute<typeof Blog>(query);

					expect(matches.length).toBe(1);
					expect(matches[0].name).toBe("Adam West's Blog");
				});

				test('can filter ne()', async () => {
					const query = predicateFor(BlogMeta).owner.name.ne('Debbie Donut');
					const matches = await mechanism.execute<typeof Blog>(query);

					expect(matches.length).toBe(4);
					expect(matches.map(m => m.name)).toEqual([
						"Adam West's Blog",
						"Bob Jones's Blog",
						"Clarice Starling's Blog",
						"Zelda from the Legend of Zelda's Blog",
					]);
				});

				test('can filter nested or() .. and()', async () => {
					const query = predicateFor(BlogMeta).or(b => [
						b.owner.and(o => [
							o.name.contains('Bob'),
							o.name.contains('Jones'),
						]),
						b.owner.and(o => [
							o.name.contains('Debbie'),
							o.name.contains('Starling'),
						]),
					]);
					const matches = await mechanism.execute<typeof Blog>(query);

					expect(matches.length).toBe(1);
					expect(matches[0].name).toBe("Bob Jones's Blog");
				});

				test('can filter 3 level nested, logically grouped', async () => {
					const query = predicateFor(BlogMeta).or(b => [
						b.owner.and(o => [o.name.contains('Bob'), o.name.contains('West')]),
						b.owner.and(owner => [
							owner.blog.or(innerBlog => [
								innerBlog.name.contains('Debbie'),
								innerBlog.name.contains('from the Legend of Zelda'),
							]),
							owner.name.contains('Donut'),
						]),
					]);
					const matches = await mechanism.execute<typeof Blog>(query);

					expect(matches.length).toBe(1);
					expect(matches[0].name).toBe("Debbie Donut's Blog");
				});

				test('can filter on child collections', async () => {
					const query = predicateFor(BlogMeta).posts.title.contains(
						'Bob Jones'
					);
					const matches = await mechanism.execute<typeof Blog>(query);

					expect(matches.length).toBe(1);
					expect(matches[0].name).toBe("Bob Jones's Blog");
				});

				test('can filter on child collections in or()', async () => {
					const query = predicateFor(BlogMeta).or(b => [
						b.posts.title.contains('Bob Jones'),
						b.posts.title.contains("Zelda's Blog post"),
					]);
					const matches = await mechanism.execute<typeof Blog>(query);

					expect(matches.length).toBe(2);
					expect(matches.map(m => m.name)).toEqual([
						"Bob Jones's Blog",
						"Zelda from the Legend of Zelda's Blog",
					]);
				});

				test('can filter on or() extended off child collections', async () => {
					const query = predicateFor(BlogMeta).posts.or(p => [
						p.title.contains('Bob Jones'),
						p.title.contains("Zelda's Blog post"),
					]);
					const matches = await mechanism.execute<typeof Blog>(query);

					expect(matches.length).toBe(2);
					expect(matches.map(m => m.name)).toEqual([
						"Bob Jones's Blog",
						"Zelda from the Legend of Zelda's Blog",
					]);
				});

				test('can filter and() between parent and child collection properties', async () => {
					const query = predicateFor(BlogMeta).and(b => [
						b.name.contains('Bob Jones'),
						b.posts.title.contains('Zelda'),
					]);
					const matches = await mechanism.execute<typeof Blog>(query);

					expect(matches.length).toBe(0);
				});
			});
		});
	});
});
