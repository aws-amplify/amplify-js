import { ulid } from 'ulid';

import {
	DataStore as DataStoreType,
	PersistentModelConstructor,
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
} from './helpers';

export { pause };

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
}) {
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
			DataStore.configure({ storageAdapter });

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
			const results = await DataStore.query(Model, m => m.field1.ne(undefined));
			expect(results.length).toEqual(3);
		});

		it('should match fields of any non-empty value for `("ne", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.ne(null));
			expect(results.length).toEqual(3);
		});

		it('should NOT match fields of any non-empty value for `("eq", undefined)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.eq(undefined));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("eq", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.eq(null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("gt", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.gt(null));
			expect(results.length).toEqual(0);
		});

		it('should NOT  match fields of any non-empty value for `("ge", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.ge(null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("lt", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.lt(null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("le", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.le(null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("gt", undefined)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.gt(undefined));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("ge", undefined)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.ge(undefined));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("lt", undefined)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.lt(undefined));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("le", undefined)`', async () => {
			const results = await DataStore.query(Model, m => m.field1.le(undefined));
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
			DataStore.configure({ storageAdapter });

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
			expect(user.profileID).toEqual(profile.id);
			expect(await user.profile).toEqual(profile);
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
			expect(user.profileID).toEqual(profile.id);
			expect(await user.profile).toEqual(profile);
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

		/**
		 * TODO: AFAIK, nested saves like this were always undefined behavior. The spec draft
		 * seems to suggest now that scenario should actually throw an Error.
		 *
		 * Update and un-skip this test once we have solid guidance.
		 */
		it.skip('should produce a mutation for a nested BELONGS_TO insert', async () => {
			const comment = await DataStore.save(
				new Comment({
					content: 'newly created comment',
					post: new Post({
						title: 'newly created post',
					}),
				})
			);

			const mutations = await getMutations(adapter);

			// one for the new comment, one for the new post
			expect(mutations.length).toBe(2);
			expectMutation(mutations[0], { title: 'newly created post' });
			expectMutation(mutations[1], {
				content: 'newly created comment',
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

	describe('Related models', () => {
		const schema = testSchema();
		let classes: Record<string, PersistentModelConstructor<any>> = initSchema(
			schema
		);

		const buildModelMeta = name => ({
			builder: classes[name],
			schema: schema.models[name],
			pkField: extractPrimaryKeyFieldNames(schema.models[name]),
		});

		const randomInitializer = constructor => {
			const meta = buildModelMeta(constructor.name);
			const initializer = {};
			for (const [field, def] of Object.entries(meta.schema.fields)) {
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
					// if (def.isArray === false && depth > 0 && (def.type as any).model) {
					// 	initializer[field] = randomInstanceOf(
					// 		(def.type as any).model,
					// 		depth - 1
					// 	);
					// } else {
					// 	// not supported yet.
					// }
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

		if (expect.getState().testPath.includes('SQLiteAdapter')) {
			console.warn(
				'SQLiteAdapter does not support CPK yet! Skipping related LazyLoading + Predidicate tests!'
			);
			return;
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

		test('SANITY TEST - composite PK parent model', async () => {
			const whatever = new classes.CompositePKParent({
				customId: 'asdfadfasdf',
				content: 'some absurdly awesome content',
			});

			const saved = await DataStore.save(whatever);

			expect(saved.customId).toEqual('asdfadfasdf');
			expect(saved.content).toEqual('some absurdly awesome content');
		});

		for (const modelName of Object.keys(schema.models)) {
			const meta = buildModelMeta(modelName);
			for (const field of Object.keys(meta.schema.fields)) {
				const R = ModelRelationship.from(meta, field);
				if (R) {
					const testname = `${R.localConstructor.name}.${field} -> ${R.remoteModelConstructor.name} (${R.relationship})`;
					switch (R.relationship) {
						case 'BELONGS_TO':
						case 'HAS_ONE':
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

								const remotes = [1, 2, 3];
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

								const remotes = [1, 2, 3];
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

								const remotes = [1, 2, 3];
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

								const remotes = [1, 2, 3];
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

								const remotes = [1, 2, 3];
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
							throw new Error(`Invalid relationship: ${R.relationship}`);
					}
				}
			}
		}
	});
}
