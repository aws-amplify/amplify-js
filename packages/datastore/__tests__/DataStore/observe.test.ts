import 'fake-indexeddb/auto';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../../src/datastore/datastore';
import { PersistentModel, PersistentModelConstructor } from '../../src/types';
import {
	Comment,
	Model,
	getDataStore,
	unconfigureSync,
	warpTime,
	unwarpTime,
	pause,
	Post,
	testSchema,
} from '../helpers';

let initSchema: typeof initSchemaType;

let { DataStore } = getDataStore() as {
	DataStore: typeof DataStoreType;
};

/**
 * Does nothing intentionally, we care only about type checking
 */
const expectType: <T>(param: T) => void = () => {};

/**
 * Renders more complete out of band traces.
 */
process.on('unhandledRejection', reason => {
	console.log(reason); // log the reason including the stack trace
});

describe('DataStore observe, unmocked, with fake-indexeddb', () => {
	let Comment: PersistentModelConstructor<Comment>;
	let Model: PersistentModelConstructor<Model>;
	let Post: PersistentModelConstructor<Post>;

	beforeEach(async () => {
		({ initSchema, DataStore } = require('../../src/datastore/datastore'));
		const classes = initSchema(testSchema());
		({ Comment, Model, Post } = classes as {
			Comment: PersistentModelConstructor<Comment>;
			Model: PersistentModelConstructor<Model>;
			Post: PersistentModelConstructor<Post>;
		});
		warpTime();
	});

	afterEach(async () => {
		await DataStore.clear();
		await unconfigureSync(DataStore);
		unwarpTime();
	});

	test('clear without starting', async () => {
		await DataStore.save(
			new Model({
				field1: 'Smurfs',
				optionalField1: 'More Smurfs',
				dateCreated: new Date().toISOString(),
			})
		);
		expect(await DataStore.query(Model)).toHaveLength(1);
		await DataStore.stop();
		await DataStore.clear();
		expect(await DataStore.query(Model)).toHaveLength(0);
	});

	test('subscribe to all models', done => {
		try {
			const sub = DataStore.observe().subscribe(
				({ element, opType, model }) => {
					expectType<PersistentModelConstructor<PersistentModel>>(model);
					expectType<PersistentModel>(element);
					expect(opType).toEqual('INSERT');
					expect(element.field1).toEqual('Smurfs');
					expect(element.optionalField1).toEqual('More Smurfs');
					sub.unsubscribe();
					done();
				}
			);
			DataStore.save(
				new Model({
					field1: 'Smurfs',
					optionalField1: 'More Smurfs',
					dateCreated: new Date().toISOString(),
				})
			);
		} catch (error) {
			done(error);
		}
	});

	test('subscribe to model instance', async () => {
		expect.assertions(4);
		const original = await DataStore.save(
			new Model({
				field1: 'somevalue',
				optionalField1: 'This one should be returned',
				dateCreated: new Date().toISOString(),
			})
		);

		const sub = DataStore.observe(original).subscribe(
			({ element, opType, model }) => {
				expectType<PersistentModelConstructor<Model>>(model);
				expectType<Model>(element);
				expect(opType).toEqual('UPDATE');
				expect(element.id).toEqual(original.id);
				expect(element.field1).toEqual('new field 1 value');
				// We expect all fields, including ones that haven't been updated, to be returned:
				expect(element.optionalField1).toEqual('This one should be returned');
				sub.unsubscribe();
			}
		);

		// decoy
		await DataStore.save(
			new Model({
				field1: "this one shouldn't get through",
				dateCreated: new Date().toISOString(),
			})
		);

		await DataStore.save(
			Model.copyOf(original, m => (m.field1 = 'new field 1 value'))
		);
	});

	test('subscribe to Model', async () => {
		expect.assertions(4);
		const original = await DataStore.save(
			new Model({
				field1: 'somevalue',
				optionalField1: 'additional value',
				dateCreated: new Date().toISOString(),
			})
		);

		const sub = DataStore.observe(Model).subscribe(
			({ element, opType, model }) => {
				expectType<PersistentModelConstructor<Model>>(model);
				expectType<Model>(element);
				expect(opType).toEqual('UPDATE');
				expect(element.id).toEqual(original.id);
				expect(element.field1).toEqual('new field 1 value');
				expect(element.optionalField1).toEqual('additional value');
				sub.unsubscribe();
			}
		);

		// decoy
		await DataStore.save(
			new Post({
				title: "This one's a decoy! (kzazulhk)",
			})
		);

		await DataStore.save(
			Model.copyOf(original, m => (m.field1 = 'new field 1 value'))
		);
	});

	test('subscribe with criteria', async () => {
		expect.assertions(3);
		const original = await DataStore.save(
			new Model({
				field1: 'somevalue',
				dateCreated: new Date().toISOString(),
			})
		);

		const sub = DataStore.observe(Model, m =>
			m.field1.contains('new field 1')
		).subscribe(({ element, opType, model }) => {
			expectType<PersistentModelConstructor<Model>>(model);
			expectType<Model>(element);
			expect(opType).toEqual('UPDATE');
			expect(element.id).toEqual(original.id);
			expect(element.field1).toEqual('new field 1 value');
			sub.unsubscribe();
		});

		// decoy
		await DataStore.save(
			new Model({
				field1: "This one's a decoy! (sfqpjzja)",
				dateCreated: new Date().toISOString(),
			})
		);

		await DataStore.save(
			Model.copyOf(original, m => (m.field1 = 'new field 1 value'))
		);
	});

	test('subscribe with criteria on deletes', async () => {
		expect.assertions(3);
		const original = await DataStore.save(
			new Model({
				field1: 'somevalue',
				dateCreated: new Date().toISOString(),
			})
		);

		const sub = DataStore.observe(Model, m =>
			m.field1.contains('value')
		).subscribe(({ element, opType, model }) => {
			expectType<PersistentModelConstructor<Model>>(model);
			expectType<Model>(element);
			expect(opType).toEqual('DELETE');
			expect(element.id).toEqual(original.id);
			expect(element.field1).toEqual('somevalue');
			sub.unsubscribe();
		});

		// decoy
		await DataStore.save(
			new Model({
				field1: "This one's a decoy! (xgxbubyd)",
				dateCreated: new Date().toISOString(),
			})
		);

		await DataStore.delete(original);
	});

	test('subscribe with belongsTo criteria', async () => {
		expect.assertions(1);
		const targetPost = await DataStore.save(
			new Post({
				title: 'this is my post. hooray!',
			})
		);

		const nonTargetPost = await DataStore.save(
			new Post({
				title: 'this is NOT my post. boo!',
			})
		);

		const sub = DataStore.observe(Comment, comment =>
			comment.post.title.eq(targetPost.title)
		).subscribe(({ element: comment, opType, model }) => {
			expect(comment.content).toEqual('good comment');
			sub.unsubscribe();
		});

		await DataStore.save(
			new Comment({
				content: 'bad comment',
				post: nonTargetPost,
			})
		);

		await DataStore.save(
			new Comment({
				content: 'good comment',
				post: targetPost,
			})
		);

		await pause(0);
	});

	test('subscribe with hasMany criteria', async () => {
		expect.assertions(1);

		// want to set up a few posts and a few "non-target" comments
		// to ensure we can observe post based on a single comment that's
		// somewhat "buried" alongside other comments.

		const targetPost = await DataStore.save(
			new Post({
				title: 'this is my post. hooray!',
			})
		);

		const nonTargetPost = await DataStore.save(
			new Post({
				title: 'this is NOT my post. boo!',
			})
		);

		await DataStore.save(
			new Comment({ content: 'bad comment', post: nonTargetPost })
		);
		await DataStore.save(
			new Comment({ content: 'pre good comment', post: targetPost })
		);

		const targetComment = await DataStore.save(
			new Comment({
				content: 'good comment',
				post: targetPost,
			})
		);

		await DataStore.save(
			new Comment({ content: 'post good comment', post: targetPost })
		);

		const sub = DataStore.observe(Post, post =>
			post.comments.content.eq(targetComment.content)
		).subscribe(async ({ element: post, opType, model }) => {
			expect(post.title).toEqual('expected update');
			sub.unsubscribe();
		});

		// should not see this one come through the subscription.
		await DataStore.save(
			Post.copyOf(nonTargetPost, p => (p.title = 'decoy update'))
		);

		// this is the update we expect to see come through, as it has
		// 'good comment' in its `comments` field.
		await DataStore.save(
			Post.copyOf(targetPost, p => (p.title = 'expected update'))
		);

		await pause(0);
	});
});
