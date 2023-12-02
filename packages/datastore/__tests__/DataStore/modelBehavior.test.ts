import 'fake-indexeddb/auto';
import { Predicates } from '../../src/predicates';
import { SortDirection } from '../../src/types';
import { getDataStore, warpTime, unwarpTime, pause } from '../helpers';

/**
 * Renders more complete out of band traces.
 */
process.on('unhandledRejection', reason => {
	console.log(reason); // log the reason including the stack trace
});

describe('Model behavior', () => {
	beforeEach(() => {
		warpTime();
	});

	afterEach(() => {
		unwarpTime();
	});

	test('newly instantiated models do not lazy load belongsTo', async () => {
		const { DataStore, DefaultPKChild, DefaultPKParent } = getDataStore();

		const parent = await DataStore.save(
			new DefaultPKParent({
				content: 'this is a decoy!',
			})
		);

		const comment = await DataStore.save(
			new DefaultPKChild({
				id: "not such a random id, but it's ok",
				content: 'here is some content',
				parent,
			})
		);

		const detachedComment = new DefaultPKChild({
			id: "not such a random id, but it's ok",
			content: 'here is some content',
			defaultPKParentChildrenId: parent.id,
		});

		expect(detachedComment.defaultPKParentChildrenId).toEqual(
			comment.defaultPKParentChildrenId
		);
		expect(await detachedComment.parent).toBeUndefined();

		await DataStore.clear();
	});

	test('newly instantiated models do not lazy load hasMany', async () => {
		const { DataStore, DefaultPKChild, DefaultPKParent } = getDataStore();

		const parent = await DataStore.save(
			new DefaultPKParent({
				content: 'this is a decoy!',
			})
		);

		const comment = await DataStore.save(
			new DefaultPKChild({
				id: "not such a random id, but it's ok",
				content: 'here is some content',
				parent,
			})
		);

		const detachedParent = new DefaultPKParent({
			id: parent.id,
			content: parent.content,
		});

		expect(detachedParent.id).toEqual(parent.id);

		expect(await detachedParent.children.toArray()).toEqual([]);

		await DataStore.clear();
	});

	test('newly instantiated models do not lazy load hasOne', async () => {
		const { DataStore, HasOneChild, HasOneParent } = getDataStore();

		const child = await DataStore.save(new HasOneChild({}));
		const parent = await DataStore.save(
			new HasOneParent({
				child,
			})
		);

		const disconnectedParent = new HasOneParent({
			id: parent.id,
			hasOneParentChildId: child.id,
		});

		expect(disconnectedParent.id).toEqual(parent.id);
		expect(disconnectedParent.hasOneParentChildId).toEqual(child.id);
		expect(await disconnectedParent.child).toBeUndefined();

		await DataStore.clear();
	});

	[null, undefined].forEach(value => {
		test(`model field can be set to ${value} to remove connection hasOne parent`, async () => {
			const { DataStore, HasOneChild, HasOneParent } = getDataStore();

			const child = await DataStore.save(
				new HasOneChild({ content: 'child content' })
			);
			const parent = await DataStore.save(
				new HasOneParent({
					child,
				})
			);

			const parentWithoutChild = HasOneParent.copyOf(parent, draft => {
				draft.child = value;
			});

			expect(parentWithoutChild.hasOneParentChildId).toBeNull();
			expect(
				(await DataStore.save(parentWithoutChild)).hasOneParentChildId
			).toBeNull();
			expect(
				(await DataStore.query(HasOneParent, parent.id))!.hasOneParentChildId
			).toBeNull();

			await DataStore.clear();
		});

		test(`model field can be set to ${value} to remove connection on child hasMany`, async () => {
			const { DataStore, CompositePKParent, CompositePKChild } = getDataStore();

			const parent = await DataStore.save(
				new CompositePKParent({
					customId: 'customId',
					content: 'content',
				})
			);

			const child = await DataStore.save(
				new CompositePKChild({ childId: 'childId', content: 'content', parent })
			);

			const childWithoutParent = CompositePKChild.copyOf(child, draft => {
				draft.parent = value;
			});

			expect(await childWithoutParent.parent).toBeUndefined();
			expect(
				await DataStore.save(childWithoutParent).then(c => c.parent)
			).toBeUndefined();
			expect(
				await DataStore.query(CompositePKChild, {
					childId: child.childId,
					content: child.content,
				}).then(c => c!.parent)
			).toBeUndefined();
			expect(
				await DataStore.query(CompositePKParent, {
					customId: parent.customId,
					content: parent.content,
				}).then(c => c!.children.toArray())
			).toEqual([]);

			await DataStore.clear();
		});
	});

	test('removes no-longer-matching items from the snapshot when using an eq() predicate on boolean field', done => {
		(async () => {
			const { DataStore, ModelWithBoolean } = getDataStore();
			try {
				// the number of records we expect in each snapshot
				const expecteds = [5, 4];

				// initial data set, 5 records that will match our predicate.
				for (let i = 0; i < 5; i++) {
					await DataStore.save(
						new ModelWithBoolean({
							boolField: true,
						})
					);
				}

				const sub = DataStore.observeQuery(ModelWithBoolean, m =>
					m.boolField.eq(true)
				).subscribe(async ({ items, isSynced }) => {
					// we don't actually expect 0 records in our snapshots after our list runs out.
					// we just want to make TS happy.
					const expected = expecteds.shift() || 0;
					expect(items.length).toBe(expected);

					for (let i = 0; i < expected; i++) {
						expect(items[i].boolField).toEqual(true);
					}

					if (expecteds.length === 0) {
						sub.unsubscribe();
						await DataStore.clear();
						done();
					}
				});

				// update an item to no longer match our criteria.
				// we want to see a snapshot come through WITHOUT this item.
				const itemToUpdate = (await DataStore.query(ModelWithBoolean)).pop()!;
				await DataStore.save(
					ModelWithBoolean.copyOf(itemToUpdate, m => {
						m.boolField = false;
					})
				);

				// advance time to trigger another snapshot.
				await pause(2000);
				await DataStore.clear();
			} catch (error) {
				await DataStore.clear();

				done(error);
			}
		})();
	});

	test('removes no-longer-matching items from the snapshot when using an ne() predicate on boolean field', done => {
		(async () => {
			const { DataStore, ModelWithBoolean } = getDataStore();
			try {
				// the number of records we expect in each snapshot
				const expecteds = [5, 4];

				// initial data set, 5 records that will match our predicate.
				for (let i = 0; i < 5; i++) {
					await DataStore.save(
						new ModelWithBoolean({
							boolField: true,
						})
					);
				}

				const sub = DataStore.observeQuery(ModelWithBoolean, m =>
					m.boolField.ne(false)
				).subscribe(({ items, isSynced }) => {
					// we don't actually expect 0 records in our snapshots after our list runs out.
					// we just want to make TS happy.
					const expected = expecteds.shift() || 0;
					expect(items.length).toBe(expected);

					for (let i = 0; i < expected; i++) {
						expect(items[i].boolField).toEqual(true);
					}

					if (expecteds.length === 0) {
						sub.unsubscribe();
						done();
					}
				});

				// update an item to no longer match our criteria.
				// we want to see a snapshot come through WITHOUT this item.
				const itemToUpdate = (await DataStore.query(ModelWithBoolean)).pop()!;
				await DataStore.save(
					ModelWithBoolean.copyOf(itemToUpdate, m => {
						m.boolField = false;
					})
				);

				// advance time to trigger another snapshot.
				await pause(2000);
				await DataStore.clear();
			} catch (error) {
				await DataStore.clear();

				done(error);
			}
		})();
	});

	// ref: https://github.com/aws-amplify/amplify-js/issues/11101
	test('returns fresh snapshot when sorting by descending', async () => {
		const { DataStore, Post } = getDataStore();

		const expectedTitles = ['create', 'update', 'update2'];

		const newPost = await DataStore.save(
			new Post({
				title: 'create',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
		);

		const sub = DataStore.observeQuery(Post, Predicates.ALL, {
			sort: s => s.updatedAt(SortDirection.DESCENDING),
		}).subscribe(async ({ items }) => {
			if (items.length === 0) {
				return;
			}

			const [item] = items;
			const expected = expectedTitles.shift();

			expect(item!.title).toEqual(expected);

			if (expectedTitles.length === 0) {
				sub.unsubscribe();
				await DataStore.clear();
			}
		});

		await DataStore.save(
			Post.copyOf(newPost, updated => {
				updated.title = 'update';
				updated.updatedAt = new Date().toISOString();
			})
		);

		// observeQuery snapshots are debounced by 2s
		await pause(2000);

		await DataStore.save(
			Post.copyOf(newPost, updated => {
				updated.title = 'update2';
				updated.updatedAt = new Date().toISOString();
			})
		);
	});
});
