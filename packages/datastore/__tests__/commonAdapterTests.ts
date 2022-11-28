import { ulid } from 'ulid';

import {
	DataStore as DataStoreType,
	PersistentModelConstructor,
	PersistentModel,
	initSchema as initSchemaType,
} from '../src/';

import { ModelRelationship } from '../src/storage/relationship';
import {
	extractPrimaryKeyFieldNames,
	extractPrimaryKeysAndValues,
} from '../src/util';

import {
	pause,
	expectMutation,
	Model,
	User,
	Profile,
	Post,
	Comment,
	testSchema,
	CompositePKParent,
	HasOneParent,
	HasOneChild,
	MtmLeft,
	MtmRight,
	MtmJoin,
} from './helpers';

export { pause };

const isSQLiteAdapter = () =>
	expect.getState().testPath.includes('SQLiteAdapter');

/**
 * Adds common query test cases that all adapters should support.
 *
 * @param ctx A context object that provides a DataStore property, which returns
 * a DataStore instance loaded with the storage adapter to test.
 */
export function addCommonQueryTests({
	initSchema,
	DataStore,
	storageAdapter,
	getMutations,
	clearOutbox,
}: {
	initSchema: typeof initSchemaType;
	DataStore: typeof DataStoreType;
	storageAdapter: any;
	getMutations: any;
	clearOutbox: any;
}) {
	beforeAll(() => {
		DataStore.configure({ storageAdapter });
	});

	describe('Common `query()` cases', () => {
		let Model: PersistentModelConstructor<Model>;
		let Comment: PersistentModelConstructor<Comment>;
		let Post: PersistentModelConstructor<Post>;

		/**
		 * Creates the given number of models, with `field1` populated to
		 * `field1 value ${i}`.
		 *
		 * @param qty number of models to create. (default 3)
		 */
		async function addModels(qty = 3) {
			// NOTE: sort() test on these models can be flaky unless we
			// strictly control the datestring of each! In a non-negligible percentage
			// of test runs on a reasonably fast machine, DataStore.save() seemed to return
			// quickly enough that dates were colliding. (or so it seemed!)
			const baseDate = new Date();

			for (let i = 0; i < qty; i++) {
				await DataStore.save(
					new Model({
						field1: `field1 value ${i}`,
						dateCreated: new Date(baseDate.getTime() + i).toISOString(),
						emails: [`field${i}@example.com`],
					})
				);
			}
		}

		beforeEach(async () => {
			// establishing a fake appsync endpoint tricks DataStore into attempting
			// sync operations, which we'll leverage to monitor how DataStore manages
			// the outbox.
			(DataStore as any).amplifyConfig.aws_appsync_graphqlEndpoint =
				'https://0.0.0.0/does/not/exist/graphql';

			const classes = initSchema(testSchema());
			({ Comment, Model, Post } = classes as {
				Comment: PersistentModelConstructor<Comment>;
				Model: PersistentModelConstructor<Model>;
				Post: PersistentModelConstructor<Post>;
			});

			// start() ensures storageAdapter is set
			await DataStore.start();

			const adapter = (DataStore as any).storageAdapter;
			const db = (adapter as any).db;
			const syncEngine = (DataStore as any).sync;

			// my jest spy-fu wasn't up to snuff here. but, this succesfully
			// prevents the mutation process from clearing the mutation queue, which
			// allows us to observe the state of mutations.
			(syncEngine as any).mutationsProcessor.isReady = () => false;

			await addModels(3);
		});

		afterEach(async () => {
			await DataStore.clear();

			// prevent cross-contamination with other test suites which are using
			// the same instance.
			(DataStore as any).amplifyConfig.aws_appsync_graphqlEndpoint = '';
		});

		it('should match fields of any non-empty value for `("ne", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.ne(undefined!)
			);
			expect(results.length).toEqual(3);
		});

		it('should match fields of any non-empty value for `("ne", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.ne(null!));
			expect(results.length).toEqual(3);
		});

		it('should NOT match fields of any non-empty value for `("eq", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.eq(undefined!)
			);
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("eq", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.eq(null!));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("gt", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.gt(null!));
			expect(results.length).toEqual(0);
		});

		it('should NOT  match fields of any non-empty value for `("ge", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.ge(null!));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("lt", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.lt(null!));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("le", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.le(null!));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("gt", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.gt(undefined!)
			);
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("ge", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.ge(undefined!)
			);
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("lt", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.lt(undefined!)
			);
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("le", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.le(undefined!)
			);
			expect(results.length).toEqual(0);
		});

		it('should match gt', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.gt('field1 value 0')
			);
			expect(results.length).toEqual(2);
		});

		it('should match ge', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.ge('field1 value 1')
			);
			expect(results.length).toEqual(2);
		});

		it('should match lt', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.lt('field1 value 2')
			);
			expect(results.length).toEqual(2);
		});

		it('should match le', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.le('field1 value 1')
			);
			expect(results.length).toEqual(2);
		});

		it('should match eq', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.eq('field1 value 1')
			);
			expect(results.length).toEqual(1);
		});

		it('should match ne', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1.ne('field1 value 1')
			);
			expect(results.length).toEqual(2);
		});
	});

	describe('Common `save()` cases', () => {
		let Comment: PersistentModelConstructor<Comment>;
		let Post: PersistentModelConstructor<Post>;
		let Profile: PersistentModelConstructor<Profile>;
		let User: PersistentModelConstructor<User>;
		let adapter: any;

		beforeEach(async () => {
			// establishing a fake appsync endpoint tricks DataStore into attempting
			// sync operations, which we'll leverage to monitor how DataStore manages
			// the outbox.
			(DataStore as any).amplifyConfig.aws_appsync_graphqlEndpoint =
				'https://0.0.0.0/does/not/exist/graphql';

			const classes = initSchema(testSchema());
			({ User, Profile, Comment, Post } = classes as {
				Comment: PersistentModelConstructor<Comment>;
				Model: PersistentModelConstructor<Model>;
				Post: PersistentModelConstructor<Post>;
				Profile: PersistentModelConstructor<Profile>;
				User: PersistentModelConstructor<User>;
			});

			// start() ensures storageAdapter is set
			await DataStore.start();

			adapter = (DataStore as any).storageAdapter;
			const db = (adapter as any).db;
			const syncEngine = (DataStore as any).sync;

			// my jest spy-fu wasn't up to snuff here. but, this succesfully
			// prevents the mutation process from clearing the mutation queue, which
			// allows us to observe the state of mutations.
			(syncEngine as any).mutationsProcessor.isReady = () => false;
		});

		afterEach(async () => {
			await DataStore.clear();
			(DataStore as any).amplifyConfig.aws_appsync_graphqlEndpoint = '';
		});

		it('should allow linking model via model field', async () => {
			const profile = await DataStore.save(
				new Profile({ firstName: 'Rick', lastName: 'Bob' })
			);

			const savedUser = await DataStore.save(
				new User({ name: 'test', profile })
			);
			const user1Id = savedUser.id;

			const user = await DataStore.query(User, user1Id);
			expect(user!.profileID).toEqual(profile.id);
			expect(await user!.profile).toEqual(profile);
		});

		it('should allow linking model via FK', async () => {
			const profile = await DataStore.save(
				new Profile({ firstName: 'Rick', lastName: 'Bob' })
			);

			const savedUser = await DataStore.save(
				new User({ name: 'test', profileID: profile.id })
			);
			const user1Id = savedUser.id;

			const user = await DataStore.query(User, user1Id);
			expect(user!.profileID).toEqual(profile.id);
			expect(await user!.profile).toEqual(profile);
		});

		it('should produce a single mutation for an updated model with a BelongTo (regression test)', async () => {
			// SQLite adapter, for example, was producing an extra mutation
			// in this scenario.

			const post = await DataStore.save(
				new Post({
					title: 'some post',
				})
			);

			const comment = await DataStore.save(
				new Comment({
					content: 'some comment',
					post,
				})
			);

			const updatedComment = await DataStore.save(
				Comment.copyOf(comment, draft => {
					draft.content = 'updated content';
				})
			);

			const mutations = await getMutations(adapter);

			// comment update should be smashed to together with post
			expect(mutations.length).toBe(2);
			expectMutation(mutations[0], { title: 'some post' });
			expectMutation(mutations[1], {
				content: 'updated content',
				postId: mutations[0].modelId,
			});
		});

		it('only includes changed fields in mutations', async () => {
			const profile = await DataStore.save(
				new Profile({ firstName: 'original first', lastName: 'original last' })
			);

			await clearOutbox(adapter);

			await DataStore.save(
				Profile.copyOf(profile, draft => {
					draft.firstName = 'new first';
				})
			);

			const mutations = await getMutations(adapter);

			expect(mutations.length).toBe(1);
			expectMutation(mutations[0], {
				firstName: 'new first',
				_version: v => v === undefined || v === null,
				_lastChangedAt: v => v === undefined || v === null,
				_deleted: v => v === undefined || v === null,
			});
		});
	});

	describe('common `delete()` cases', () => {
		let Comment: PersistentModelConstructor<Comment>;
		let Post: PersistentModelConstructor<Post>;
		let HasOneParent: PersistentModelConstructor<HasOneParent>;
		let HasOneChild: PersistentModelConstructor<HasOneChild>;

		beforeEach(async () => {
			const classes = initSchema(testSchema());
			({ Comment, Post, HasOneParent, HasOneChild } = classes as {
				Comment: PersistentModelConstructor<Comment>;
				Post: PersistentModelConstructor<Post>;
				HasOneParent: PersistentModelConstructor<HasOneParent>;
				HasOneChild: PersistentModelConstructor<HasOneChild>;
			});
		});

		afterEach(async () => {
			await DataStore.clear();
		});

		test('can delete a single, simple record', async () => {
			const post = await DataStore.save(
				new Post({
					title: 'a simple title',
				})
			);

			// sanity check. make sure it was created.
			const retrieved = await DataStore.query(Post, post.id);
			expect(retrieved).not.toBeUndefined();
			expect(retrieved!.id).toEqual(post.id);

			await DataStore.delete(post);

			const retrievedAfterDelete = await DataStore.query(Post, post.id);
			expect(retrievedAfterDelete).toBeUndefined();
		});

		// see packages/datastore-storage-adapter/src/common/CommonSQLiteAdapter.ts
		// as long as the comment above `async delete` still says, "Currently does not cascade",
		// we don't want to try to enforce the requirementon SQLiteAdapter, which appears
		// to be knowingly in an unfinished state.

		(isSQLiteAdapter() ? test.skip : test)(
			'deleting hasMany side of relationship cascades',
			async () => {
				const post = await DataStore.save(
					new Post({
						title: 'parent post',
					})
				);
				const comment = await DataStore.save(
					new Comment({
						content: 'first!',
						post,
					})
				);

				// sanity check. make sure things were created.
				const retrievedPost = await DataStore.query(Post, post.id);
				expect(retrievedPost).not.toBeUndefined();
				expect(retrievedPost!.id).toEqual(post.id);

				const retrievedComment = await DataStore.query(Comment, comment.id);
				expect(retrievedComment).not.toBeUndefined();
				expect(retrievedComment!.id).toEqual(comment.id);

				await DataStore.delete(post);

				const retrievedDeletedPost = await DataStore.query(Post, post.id);
				expect(retrievedDeletedPost).toBeUndefined();

				const retrievedDeletedComment = await DataStore.query(
					Comment,
					comment.id
				);
				expect(retrievedDeletedComment).toBeUndefined();
			}
		);

		(isSQLiteAdapter() ? test.skip : test)(
			'deleting hasMany side of relationship by predicate cascades',
			async () => {
				const post = await DataStore.save(
					new Post({
						title: 'parent post',
					})
				);
				const comment = await DataStore.save(
					new Comment({
						content: 'first!',
						post,
					})
				);

				// sanity check. make sure things were created.
				const retrievedPost = await DataStore.query(Post, post.id);
				expect(retrievedPost).not.toBeUndefined();
				expect(retrievedPost!.id).toEqual(post.id);

				const retrievedComment = await DataStore.query(Comment, comment.id);
				expect(retrievedComment).not.toBeUndefined();
				expect(retrievedComment!.id).toEqual(comment.id);

				await DataStore.delete(Post, p => p.title.eq('parent post'));

				const retrievedDeletedPost = await DataStore.query(Post, post.id);
				expect(retrievedDeletedPost).toBeUndefined();

				const retrievedDeletedComment = await DataStore.query(
					Comment,
					comment.id
				);
				expect(retrievedDeletedComment).toBeUndefined();
			}
		);

		test('deleting belongsTo side of relationship does not cascade', async () => {
			const post = await DataStore.save(
				new Post({
					title: 'parent post',
				})
			);
			const comment = await DataStore.save(
				new Comment({
					content: 'first!',
					post,
				})
			);

			// sanity check. make sure things were created.
			const retrievedPost = await DataStore.query(Post, post.id);
			expect(retrievedPost).not.toBeUndefined();
			expect(retrievedPost!.id).toEqual(post.id);

			const retrievedComment = await DataStore.query(Comment, comment.id);
			expect(retrievedComment).not.toBeUndefined();
			expect(retrievedComment!.id).toEqual(comment.id);

			await DataStore.delete(comment);

			const retrievedNOTDeletedPost = await DataStore.query(Post, post.id);
			expect(retrievedNOTDeletedPost).not.toBeUndefined();

			const retrievedDeletedComment = await DataStore.query(
				Comment,
				comment.id
			);
			expect(retrievedDeletedComment).toBeUndefined();
		});

		(isSQLiteAdapter() ? test.skip : test)(
			'deleting disconnected hasOne',
			async () => {
				const hasOneParent = await DataStore.save(new HasOneParent({}));

				await DataStore.delete(hasOneParent);

				expect(
					await DataStore.query(HasOneParent, hasOneParent.id)
				).toBeUndefined();
			}
		);

		(isSQLiteAdapter() ? test.skip : test)(
			'deleting connected hasOne',
			async () => {
				const hasOneChild = await DataStore.save(new HasOneChild({}));
				const hasOneParent = await DataStore.save(
					new HasOneParent({ child: hasOneChild })
				);

				await DataStore.delete(hasOneParent);

				expect(
					await DataStore.query(HasOneParent, hasOneParent.id)
				).toBeUndefined();

				expect(
					await DataStore.query(HasOneChild, hasOneChild.id)
				).toBeUndefined();
			}
		);
	});

	describe('Related models', () => {
		const schema = testSchema();
		let classes = initSchema(schema);

		const buildModelMeta = name => ({
			builder: classes[name] as PersistentModelConstructor<any>,
			schema: schema.models[name],
			pkField: extractPrimaryKeyFieldNames(schema.models[name]),
		});

		const allFKFields = meta => {
			const fields = new Set<string>();
			const relationships = ModelRelationship.allFrom(meta).filter(
				r => r.type === 'BELONGS_TO'
			);
			for (const relationship of relationships) {
				for (const field of relationship.localJoinFields) {
					fields.add(field);
				}
			}
			return fields;
		};

		const randomInitializer = constructor => {
			const meta = buildModelMeta(constructor.name);
			const initializer = {};
			const fkFields = allFKFields(meta);
			for (const [field, def] of Object.entries(meta.schema.fields)) {
				if (fkFields.has(field)) continue;
				switch (def.type) {
					case 'ID':
						initializer[field] = ulid();
						break;
					case 'String':
						initializer[field] = `some random content ${ulid()}`;
						break;
					case 'Int':
						initializer[field] =
							new Date().getTime() * 100 + Math.floor(Math.random() * 100);
						break;
					default:
						break;
				}
			}
			return initializer;
		};

		/**
		 * Picks a field on a model for us to use in nested predicates tests.
		 * @param constructor
		 */
		const pickField = constructor => {
			const meta = buildModelMeta(constructor.name);
			/**
			 * Sampling of fields present on the models.
			 * We'll just use the first one we find on a model.
			 */
			const fieldNamesToSelectFrom = [
				'content',
				'name',
				'title',
				'firstName',
				'lastName',
				'description',
			];

			for (const [field, def] of Object.entries(meta.schema.fields)) {
				if (fieldNamesToSelectFrom.includes(field)) {
					return field;
				}
			}

			return undefined;
		};

		beforeEach(async () => {
			DataStore.configure({ storageAdapter });
			classes = initSchema(schema);
			await DataStore.start();
		});

		afterEach(async () => {
			await DataStore.clear();
		});

		let modelNamesToTest = Object.keys(schema.models);
		if (isSQLiteAdapter()) {
			modelNamesToTest = modelNamesToTest.filter(n => n.startsWith('Legacy'));
		} else {
			// Our manyToMany example requires both side of the relationship to be
			// populated, so we need a different testing pattern.
			// also notably, this is "extra" test work. MTM is just two hasMany's.
			modelNamesToTest = modelNamesToTest.filter(n => !n.startsWith('Mtm'));
		}

		test('SANITY TEST - basic model', async () => {
			const whatever = new classes.BasicModel({
				id: 'asdfadfasdf',
				body: 'some absurdly awesome content',
			});

			const saved = await DataStore.save(whatever);

			expect(saved.id).toEqual('asdfadfasdf');
			expect(saved.body).toEqual('some absurdly awesome content');
		});

		if (!isSQLiteAdapter()) {
			test('SANITY TEST - composite PK parent model', async () => {
				const whatever = new classes.CompositePKParent({
					customId: 'asdfadfasdf',
					content: 'some absurdly awesome content',
				});

				const saved = await DataStore.save(whatever);

				expect(saved.customId).toEqual('asdfadfasdf');
				expect(saved.content).toEqual('some absurdly awesome content');
			});
		}

		for (const modelName of modelNamesToTest) {
			const meta = buildModelMeta(modelName);
			for (const field of Object.keys(meta.schema.fields)) {
				const R = ModelRelationship.from(meta, field);
				if (R) {
					const testname = `${R.localConstructor.name}.${field} -> ${R.remoteModelConstructor.name} (${R.type})`;
					switch (R.type) {
						case 'HAS_ONE':
						case 'BELONGS_TO':
							test(`can lazy load ${testname}`, async () => {
								// Create the "remote" instance first, because the "local" one will point to it.
								const remoteInit = new R.remoteModelConstructor(
									randomInitializer(R.remoteModelConstructor)
								);
								const remote = await DataStore.save(remoteInit);

								const localInit = new R.localConstructor({
									...randomInitializer(R.localConstructor),
									[field]: remote,
								});
								const local = await DataStore.save(localInit);

								const fetched = await DataStore.query(
									R.localConstructor,
									extractPrimaryKeysAndValues(local, R.localPKFields)
								);
								const lazyLoaded = await fetched[field];

								expect(lazyLoaded).toEqual(remote);
							});
							test(`lazy load does load aimlessly ${testname}`, async () => {
								/**
								 * Basically, we want to ensure lazy loading never regresses and starts
								 * loading related instances that are not actually related by FK.
								 */

								// Create the "remote" instance first, because the "local" one will point to it.
								const remoteInit = new R.remoteModelConstructor(
									randomInitializer(R.remoteModelConstructor)
								);
								const remote = await DataStore.save(remoteInit);

								const localInit = new R.localConstructor({
									...randomInitializer(R.localConstructor),

									// HERE'S THE DIFFERENCE! we're not tying the model instances together.
									/* [field]: remote,*/
								});
								const local = await DataStore.save(localInit);

								const fetched = await DataStore.query(
									R.localConstructor,
									extractPrimaryKeysAndValues(local, R.localPKFields)
								);
								const lazyLoaded = await fetched[field];

								// HERE'S THE DIFFERENCE IN ASSERTION.
								expect(lazyLoaded).toBeUndefined();
							});
							test(`can query ${testname}`, async () => {
								const remoteInit = new R.remoteModelConstructor(
									randomInitializer(R.remoteModelConstructor)
								);
								const remote = await DataStore.save(remoteInit);

								const localInit = new R.localConstructor({
									...randomInitializer(R.localConstructor),
									[field]: remote,
								});
								const local = await DataStore.save(localInit);

								// just pick a rando field on remote model to query against.
								// they should all be randomized and unique.
								const remoteField = pickField(R.remoteModelConstructor);
								expect(remoteField).toBeDefined();

								const fetched = await DataStore.query(
									R.localConstructor,
									local =>
										local[field][remoteField!].eq(remoteInit[remoteField!])
								);

								expect(fetched.length).toBe(1);
								expect(fetched[0]).toEqual(local);
							});
							test(`finds empty sets when target related instance field misatches ${testname}`, async () => {
								const remoteInit = new R.remoteModelConstructor(
									randomInitializer(R.remoteModelConstructor)
								);
								const remote = await DataStore.save(remoteInit);

								const localInit = new R.localConstructor({
									...randomInitializer(R.localConstructor),
									[field]: remote,
								});
								const local = await DataStore.save(localInit);

								// just pick a rando field on remote model to query against.
								// they should all be randomized and unique.
								const remoteField = pickField(R.remoteModelConstructor);
								expect(remoteField).toBeDefined();

								const fetched = await DataStore.query(
									R.localConstructor,
									local =>
										// HERE'S THE DIFFERENCE!
										local[field][remoteField!].eq(
											remoteInit[remoteField! + ' MISMATCHED!']
										)
								);

								// HERE'S THE DIFFERENT ASSERTION. expecting no results.
								expect(fetched.length).toBe(0);
							});
							test(`finds empty sets when target instance isn't related ${testname}`, async () => {
								const remoteInit = new R.remoteModelConstructor(
									randomInitializer(R.remoteModelConstructor)
								);
								const remote = await DataStore.save(remoteInit);

								const localInit = new R.localConstructor({
									...randomInitializer(R.localConstructor),

									// HERE'S THE DIFFERENCE!
									// [field]: remote,
								});
								const local = await DataStore.save(localInit);

								// just pick a rando field on remote model to query against.
								// they should all be randomized and unique.
								const remoteField = pickField(R.remoteModelConstructor);
								expect(remoteField).toBeDefined();

								const fetched = await DataStore.query(
									R.localConstructor,
									local =>
										// HERE'S THE DIFFERENCE!
										local[field][remoteField!].eq(remoteInit[remoteField!])
								);

								// HERE'S THE DIFFERENT ASSERTION. expecting no results.
								expect(fetched.length).toBe(0);
							});
							break;
						case 'HAS_MANY':
							test(`can lazy load ${testname}`, async () => {
								const local = await DataStore.save(
									new R.localConstructor(randomInitializer(R.localConstructor))
								);

								const FK = {};
								for (
									let fieldIndex = 0;
									fieldIndex < R.remoteJoinFields.length;
									fieldIndex++
								) {
									FK[R.remoteJoinFields[fieldIndex]] =
										local[R.localJoinFields[fieldIndex]];
								}

								const remotes = [1, 2, 3] as any[];
								for (const [index, value] of remotes.entries()) {
									remotes[index] = await DataStore.save(
										new R.remoteModelConstructor({
											...randomInitializer(R.remoteModelConstructor),
											...FK,
										})
									);
								}

								const fetched = await DataStore.query(
									R.localConstructor,
									extractPrimaryKeysAndValues(local, R.localPKFields)
								);
								const lazyLoaded = await fetched[field].toArray();

								expect(lazyLoaded).toEqual(remotes);
							});
							test(`lazy load does not load aimlessly ${testname}`, async () => {
								/**
								 * Basically, we want to ensure lazy loading never regresses and starts
								 * loading related instances that are not actually related by FK.
								 */
								const local = await DataStore.save(
									new R.localConstructor(randomInitializer(R.localConstructor))
								);

								const remotes = [1, 2, 3] as any[];
								for (const [index, value] of remotes.entries()) {
									remotes[index] = await DataStore.save(
										new R.remoteModelConstructor({
											...randomInitializer(R.remoteModelConstructor),

											// HERE'S THE DIFFERENCE! we're not tying the model instances together.
											// ...FK,
										})
									);
								}

								const fetched = await DataStore.query(
									R.localConstructor,
									extractPrimaryKeysAndValues(local, R.localPKFields)
								);
								const lazyLoaded = await fetched[field].toArray();

								// HERE'S THE DIFFERENCE IN ASSERTION.
								expect(lazyLoaded).toEqual([]);
							});
							test(`can query ${testname}`, async () => {
								const local = await DataStore.save(
									new R.localConstructor({
										...randomInitializer(R.localConstructor),
									})
								);

								const FK = {};
								for (
									let fieldIndex = 0;
									fieldIndex < R.remoteJoinFields.length;
									fieldIndex++
								) {
									FK[R.remoteJoinFields[fieldIndex]] =
										local[R.localJoinFields[fieldIndex]];
								}

								const remotes = [1, 2, 3] as any[];
								for (const [index, value] of remotes.entries()) {
									remotes[index] = await DataStore.save(
										new R.remoteModelConstructor({
											...randomInitializer(R.remoteModelConstructor),
											...FK,
										})
									);
								}

								// just pick a rando field on remote model to query against.
								// they should all be randomized and unique.
								const remoteField = pickField(R.remoteModelConstructor);
								expect(remoteField).toBeDefined();

								// any one of the children should be able to serve as the target
								// of a nested predicate.
								for (const remote of remotes) {
									const fetched = await DataStore.query(
										R.localConstructor,
										local => local[field][remoteField!].eq(remote[remoteField!])
									);
									expect(fetched.length).toBe(1);
									expect(fetched[0]).toEqual(local);
								}
							});
							test(`finds empty sets when target related instance field misatches ${testname}`, async () => {
								const local = await DataStore.save(
									new R.localConstructor({
										...randomInitializer(R.localConstructor),
									})
								);

								const FK = {};
								for (
									let fieldIndex = 0;
									fieldIndex < R.remoteJoinFields.length;
									fieldIndex++
								) {
									FK[R.remoteJoinFields[fieldIndex]] =
										local[R.localJoinFields[fieldIndex]];
								}

								const remotes = [1, 2, 3] as any[];
								for (const [index, value] of remotes.entries()) {
									remotes[index] = await DataStore.save(
										new R.remoteModelConstructor({
											...randomInitializer(R.remoteModelConstructor),
											...FK,
										})
									);
								}

								// just pick a rando field on remote model to query against.
								// they should all be randomized and unique.
								const remoteField = pickField(R.remoteModelConstructor);
								expect(remoteField).toBeDefined();

								// any one of the children should be able to serve as the target
								// of a nested predicate.
								for (const remote of remotes) {
									const fetched = await DataStore.query(
										R.localConstructor,
										local =>
											// HERE'S THE DIFFERENCE!
											local[field][remoteField!].eq(
												remote[remoteField! + ' MISMATCHED!']
											)
									);

									// DIFFERENCE IN ASSERTION
									expect(fetched.length).toBe(0);
								}
							});
							test(`finds empty sets when target instance isn't related ${testname}`, async () => {
								const local = await DataStore.save(
									new R.localConstructor({
										...randomInitializer(R.localConstructor),
									})
								);

								const remotes = [1, 2, 3] as any[];
								for (const [index, value] of remotes.entries()) {
									remotes[index] = await DataStore.save(
										new R.remoteModelConstructor({
											...randomInitializer(R.remoteModelConstructor),

											// HERE'S THE DIFFERENCE
											// ...FK,
										})
									);
								}

								// just pick a rando field on remote model to query against.
								// they should all be randomized and unique.
								const remoteField = pickField(R.remoteModelConstructor);
								expect(remoteField).toBeDefined();

								// any one of the children should be able to serve as the target
								// of a nested predicate.
								for (const remote of remotes) {
									const fetched = await DataStore.query(
										R.localConstructor,
										local =>
											// HERE'S THE DIFFERENCE!
											local[field][remoteField!].eq(remote[remoteField!])
									);

									// DIFFERENCE IN ASSERTION
									expect(fetched.length).toBe(0);
								}
							});
							break;
						default:
							throw new Error(`Invalid relationship: ${R.type}`);
					}
				}
			}
		}
	});

	/**
	 * Given the way `manyToMany` works, these tests are *mostly* superfluous.
	 * `manyToMany` is just a helper to create `belongsTo`/`hasMany` models. So,
	 * these don't dive as deep or expansively as other relationship tests.
	 *
	 * However, in addition to being abundantly cautious, these tests will help
	 * clamp on deduping behavior. E.g., in an NxM relationship "bag", if we
	 * query one left side by a property that matches many records on the other
	 * side, we expect the returned instances to be unique.
	 */
	describe('many-to-many', () => {
		let MtmLeft: PersistentModelConstructor<MtmLeft>;
		let MtmRight: PersistentModelConstructor<MtmRight>;
		let MtmJoin: PersistentModelConstructor<MtmJoin>;

		beforeEach(async () => {
			const classes = initSchema(testSchema());
			({ MtmLeft, MtmRight, MtmJoin } = classes as {
				MtmLeft: PersistentModelConstructor<MtmLeft>;
				MtmRight: PersistentModelConstructor<MtmRight>;
				MtmJoin: PersistentModelConstructor<MtmJoin>;
			});
		});

		afterEach(async () => {
			await DataStore.clear();
		});

		/**
		 * Bag of `MtmLeft`, `MtmRight`, and `MtmJoin` Model instances.
		 *
		 * Just a convenience for passing bags of models around the test util
		 * methods herein.
		 */
		type MtmBag = {
			left: MtmLeft[];
			right: MtmRight[];
			join: MtmJoin[];
		};

		/**
		 * Uses a pair of left/right names to create left/right children,
		 * and associates them all together. Be careful how many items you pass
		 * in here -- you'll get `left * right` join table records.
		 *
		 * Returns an object containing all created records as
		 *
		 * ```ts
		 * {
		 * 	left: MtmLeft[],
		 * 	right: MtmRight[],
		 * 	join: MtmJoin[]
		 * }
		 * ```
		 *
		 * @param leftOnes A list of content values to use on the side.
		 * @param rightOnes A list of content values to use on the right side.
		 */
		const saveManyToManys = async (
			leftOnes: string[],
			rightOnes: string[]
		): Promise<MtmBag> => {
			const left = [] as MtmLeft[];
			const right = [] as MtmRight[];
			const join = [] as MtmJoin[];

			for (const content of leftOnes) {
				left.push(await DataStore.save(new MtmLeft({ content })));
			}

			for (const content of rightOnes) {
				right.push(await DataStore.save(new MtmRight({ content })));
			}

			for (const mtmLeft of left) {
				for (const mtmRight of right) {
					join.push(await DataStore.save(new MtmJoin({ mtmLeft, mtmRight })));
				}
			}

			return { left, right, join };
		};

		/**
		 * Given an existing instance, re-fetches the item from DataStore
		 * using the item's constructor and `id`. Throws an Error if the
		 * item doesn't exist.
		 *
		 * @param item The item to re-fetch.
		 */
		const refetch = async <T extends PersistentModel>(item: T) => {
			const fetched = await DataStore.query(
				item.constructor as PersistentModelConstructor<T>,
				item.id
			);

			if (!fetched) {
				throw new Error(
					`Instance of ${item.constructor.name} (${item?.id}) doesn't exist in DataStore!`
				);
			} else {
				return fetched;
			}
		};

		/**
		 * Given a set of related MTM records, queries DataStore for each item
		 * on the left and right and ensures the expected related members
		 * are traversable from each with lazy loading.
		 *
		 * @param expected The expected collection of records.
		 * @param actual The actual/retrieved collection of records.
		 */
		const expectMatchingMtmsInDataStore = async (expected: MtmBag) => {
			for (const leftRecord of expected.left) {
				const fetched = await refetch(leftRecord);
				const fetchedJoins = await fetched.rightOnes.toArray();
				const fetchedRight: MtmRight[] = [];
				for (const join of fetchedJoins) {
					fetchedRight.push(await join.mtmRight);
				}
				expect(new Set(fetchedRight)).toEqual(new Set(expected.right));
			}

			for (const rightRecord of expected.right) {
				const fetched = await refetch(rightRecord);
				const fetchedJoins = await fetched.leftOnes.toArray();
				const fetchedLeft: MtmLeft[] = [];
				for (const join of fetchedJoins) {
					fetchedLeft.push(await join.mtmLeft);
				}
				expect(new Set(fetchedLeft)).toEqual(new Set(expected.left));
			}
		};

		/**
		 * Each of the following tests will create TWO groups of Left/Right M:M "bags".
		 *
		 * All of the left-right items in a bag are interrelated / cross-joined.
		 *
		 * TWO bags are created to ensure lazy loading and querying does not get confused
		 * in any way and mix relationships up. E.g., a test without "decoy" data would
		 * cause a highly broken LL implementation that selects ALL from a related table
		 * to show as passing.
		 */

		test('sets can be established and traversed, cardinality 1x1', async () => {
			const expectedGroupA = await saveManyToManys(
				['left content A'],
				['right content A']
			);
			const expectedGroupB = await saveManyToManys(
				['left content B'],
				['right content B']
			);

			await expectMatchingMtmsInDataStore(expectedGroupA);
			await expectMatchingMtmsInDataStore(expectedGroupB);
		});

		test('sets can be established and traversed, cardinality 3x3', async () => {
			const expectedGroupA = await saveManyToManys(
				['left content A 1', 'left content A 2', 'left content A 3'],
				['right content A 1', 'right content A 2', 'right content A 3']
			);
			const expectedGroupB = await saveManyToManys(
				['left content B 1', 'left content B 2', 'left content B 3'],
				['right content B 1', 'right content B 2', 'right content B 3']
			);

			await expectMatchingMtmsInDataStore(expectedGroupA);
			await expectMatchingMtmsInDataStore(expectedGroupB);
		});

		test('sets can be queried by nested predicate, cardinality 1x1', async () => {
			const expectedGroupA = await saveManyToManys(
				['left content A'],
				['right content A']
			);
			const expectedGroupB = await saveManyToManys(
				['left content B'],
				['right content B']
			);

			const fetchedRightOnesA = await DataStore.query(MtmRight, r =>
				r.leftOnes.mtmLeft.content.eq('left content A')
			);
			expect(fetchedRightOnesA.map(r => r.content)).toEqual([
				'right content A',
			]);

			const fetchedRightOnesB = await DataStore.query(MtmRight, r =>
				r.leftOnes.mtmLeft.content.eq('left content B')
			);
			expect(fetchedRightOnesB.map(r => r.content)).toEqual([
				'right content B',
			]);
		});

		test('sets can be queried by nested predicate, cardinality 3x3', async () => {
			const expectedNamesARight = [
				'right content A 1',
				'right content A 2',
				'right content A 3',
			];
			const expectedNamesBRight = [
				'right content B 1',
				'right content B 2',
				'right content B 3',
			];

			const expectedGroupA = await saveManyToManys(
				['left content A 1', 'left content A 2', 'left content A 3'],
				expectedNamesARight
			);
			const expectedGroupB = await saveManyToManys(
				['left content B 1', 'left content B 2', 'left content B 3'],
				expectedNamesBRight
			);

			const fetchedRightOnesA = await DataStore.query(MtmRight, r =>
				r.leftOnes.mtmLeft.content.contains('left content A')
			);
			expect(fetchedRightOnesA.map(r => r.content)).toEqual(
				expectedNamesARight
			);

			const fetchedRightOnesB = await DataStore.query(MtmRight, r =>
				r.leftOnes.mtmLeft.content.contains('left content B')
			);
			expect(fetchedRightOnesB.map(r => r.content)).toEqual(
				expectedNamesBRight
			);
		});
	});
}
