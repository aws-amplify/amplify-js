import * as idb from 'idb';
import 'fake-indexeddb/auto';
import { DataStore } from '../src/index';
import {
	Post,
	Author,
	BlogOwner,
	Blog,
	Comment,
	PostAuthorJoin,
	PostMetadata,
	Nested,
} from './model';
import { USER } from '../src/util';
let db: idb.IDBPDatabase;

describe('Indexed db storage test', () => {
	let blog, blog2, blog3, owner, owner2;
	beforeAll(async () => {
		await DataStore.query(Post);
	});
	beforeEach(async () => {
		owner = new BlogOwner({ name: 'aaaa' });
		owner2 = new BlogOwner({ name: 'owner' });
		blog = new Blog({
			name: 'Avatar: Last Airbender',
			owner,
		});
		blog2 = new Blog({
			name: 'blog2',
			owner: owner2,
		});
		blog3 = new Blog({
			name: 'Avatar 101',
			owner: new BlogOwner({ name: 'owner 3' }),
		});
	});
	test('setup function', async () => {
		db = await idb.openDB('amplify-datastore', 1);

		const createdObjStores = db.objectStoreNames;
		const expectedStores = [
			`${USER}_Author`,
			`${USER}_Blog`,
			`${USER}_BlogOwner`,
			`${USER}_Comment`,
			`${USER}_Post`,
			`${USER}_PostAuthorJoin`,
		];

		expectedStores.map(item => {
			expect(createdObjStores).toContain(item);
		});
		expect(createdObjStores).not.toContain(`${USER}_blah`);

		// TODO: better way to get this
		const commentStore = (<any>db)._rawDatabase.rawObjectStores.get(
			`${USER}_Comment`
		);
		const postAuthorStore = (<any>db)._rawDatabase.rawObjectStores.get(
			`${USER}_PostAuthorJoin`
		);

		expect(commentStore.rawIndexes.has('commentPostId')).toBe(true); // checks 1:M
		expect(postAuthorStore.rawIndexes.has('postId')).toBe(true); // checks M:M
		expect(postAuthorStore.rawIndexes.has('authorId')).toBe(true); // checks M:M
	});

	test('save function 1:1 insert', async () => {
		await DataStore.save(blog);
		await DataStore.save(owner);

		const get1 = await db
			.transaction(`${USER}_Blog`, 'readonly')
			.objectStore(`${USER}_Blog`)
			.get(blog.id);

		expect([...Object.keys(blog).sort(), 'blogOwnerId']).toEqual(
			expect.arrayContaining(Object.keys(get1).sort())
		);

		expect(get1['blogOwnerId']).toBe(owner.id);

		const get2 = await db
			.transaction(`${USER}_BlogOwner`, 'readonly')
			.objectStore(`${USER}_BlogOwner`)
			.get(owner.id);

		expect([...Object.keys(owner)].sort()).toEqual(
			expect.arrayContaining(Object.keys(get2).sort())
		);

		await DataStore.save(blog2);
		const get3 = await db
			.transaction(`${USER}_Blog`, 'readonly')
			.objectStore(`${USER}_Blog`)
			.get(blog2.id);

		expect([...Object.keys(blog2).sort(), 'blogOwnerId']).toEqual(
			expect.arrayContaining(Object.keys(get3).sort())
		);
	});

	test('save stores non-model types along the item (including nested)', async () => {
		const p = new Post({
			title: 'Avatar',
			blog,
			metadata: new PostMetadata({
				rating: 3,
				tags: ['a', 'b', 'c'],
				nested: new Nested({
					aField: 'Some value',
				}),
			}),
		});

		await DataStore.save(p);

		const postFromDB = await db
			.transaction(`${USER}_Post`, 'readonly')
			.objectStore(`${USER}_Post`)
			.get(p.id);

		expect(postFromDB.metadata).toMatchObject({
			rating: 3,
			tags: ['a', 'b', 'c'],
			nested: new Nested({
				aField: 'Some value',
			}),
		});
	});

	test('save function 1:M insert', async () => {
		// test 1:M
		const p = new Post({
			title: 'Avatar',
			blog,
		});
		const c1 = new Comment({ content: 'comment 1', post: p });
		await DataStore.save(c1);
		const getComment = await db
			.transaction(`${USER}_Comment`, 'readonly')
			.objectStore(`${USER}_Comment`)
			.get(c1.id);

		expect([...Object.keys(c1), 'commentPostId'].sort()).toEqual(
			expect.arrayContaining(Object.keys(getComment).sort())
		);

		const checkIndex = await db
			.transaction(`${USER}_Comment`, 'readonly')
			.objectStore(`${USER}_Comment`)
			.index('commentPostId')
			.get(p.id);

		expect(checkIndex['commentPostId']).toEqual(p.id);
	});

	test('save function M:M insert', async () => {
		const post = new Post({
			title: 'Avatar',
			blog,
		});

		await DataStore.save(post);
		const getPost = await db
			.transaction(`${USER}_Post`, 'readonly')
			.objectStore(`${USER}_Post`)
			.get(post.id);

		expect(getPost.author).toBeUndefined();

		const a1 = new Author({ name: 'author1' });
		const a2 = new Author({ name: 'author2' });

		await DataStore.save(a1);
		await DataStore.save(a2);

		const getA1 = await db
			.transaction(`${USER}_Author`, 'readonly')
			.objectStore(`${USER}_Author`)
			.get(a1.id);
		expect(getA1.name).toEqual('author1');

		const getA2 = await db
			.transaction(`${USER}_Author`, 'readonly')
			.objectStore(`${USER}_Author`)
			.get(a2.id);
		expect(getA2.name).toEqual('author2');

		await DataStore.save(new PostAuthorJoin({ post, author: a1 }));

		await DataStore.save(new PostAuthorJoin({ post, author: a2 }));

		const p2 = new Post({ title: 'q', blog });
		await DataStore.save(new PostAuthorJoin({ post: p2, author: a2 }));

		const getAuthors = await db
			.transaction(`${USER}_PostAuthorJoin`)
			.objectStore(`${USER}_PostAuthorJoin`)
			.index('postId')
			.getAll(post.id);

		expect(getAuthors).toHaveLength(2);
	});

	test('save update', async () => {
		await DataStore.save(blog);
		await DataStore.save(owner);

		const get1 = await db
			.transaction(`${USER}_Blog`, 'readonly')
			.objectStore(`${USER}_Blog`)
			.get(blog.id);

		expect(get1['blogOwnerId']).toBe(owner.id);
		const updated = Blog.copyOf(blog, draft => {
			draft.name = 'Avatar: The Last Airbender';
		});

		await DataStore.save(updated);
		const get2 = await db
			.transaction(`${USER}_Blog`, 'readonly')
			.objectStore(`${USER}_Blog`)
			.get(blog.id);

		expect(get2.name).toEqual(updated.name);
	});

	test('query function 1:1', async () => {
		const res = await DataStore.save(blog);
		await DataStore.save(owner);
		const query = await DataStore.query(Blog, blog.id);

		expect(query).toEqual(res);

		await DataStore.save(blog3);
		const query1 = await DataStore.query(Blog);
		query1.forEach(item => {
			if (item.owner) {
				expect(item.owner).toHaveProperty('name');
			}
		});
	});

	test('query M:1 eager load', async () => {
		const p = new Post({
			title: 'Avatar',
			blog,
		});
		const c1 = new Comment({ content: 'comment 1', post: p });
		const c2 = new Comment({ content: 'comment 2', post: p });

		await DataStore.save(p);
		await DataStore.save(c1);
		await DataStore.save(c2);

		const q1 = await DataStore.query(Comment, c1.id);

		expect(q1.post.id).toEqual(p.id);
	});

	test('delete 1:1 function', async () => {
		await DataStore.save(blog);
		await DataStore.save(owner);

		await DataStore.delete(Blog, blog.id);
		await DataStore.delete(BlogOwner, owner.id);

		expect(await DataStore.query(BlogOwner, owner.id)).toBeUndefined();
		expect(await DataStore.query(Blog, blog.id)).toBeUndefined();

		await DataStore.save(owner);
		await DataStore.save(owner2);

		await DataStore.save(
			Blog.copyOf(blog, draft => {
				draft;
			})
		);
		await DataStore.save(blog2);
		await DataStore.save(blog3);

		await DataStore.delete(Blog, c => c.name('beginsWith', 'Avatar'));

		expect(await DataStore.query(Blog, blog.id)).toBeUndefined();
		expect(await DataStore.query(Blog, blog2.id)).toBeDefined();
		expect(await DataStore.query(Blog, blog3.id)).toBeUndefined();
	});

	test('delete M:1 function', async () => {
		const post = new Post({
			title: 'Avatar',
			blog,
		});
		const c1 = new Comment({ content: 'c1', post });
		const c2 = new Comment({ content: 'c2', post });

		await DataStore.save(post);

		await DataStore.save(c1);
		await DataStore.save(c2);

		await DataStore.delete(Comment, c1.id);

		expect(await DataStore.query(Comment, c1.id)).toBeUndefined;
		expect((await DataStore.query(Comment, c2.id)).id).toEqual(c2.id);
	});

	test('delete 1:M function', async () => {
		const post = new Post({
			title: 'Avatar 1',
			blog,
		});
		const post2 = new Post({
			title: 'Avatar 2',
			blog,
		});

		await DataStore.save(post);
		await DataStore.save(post2);

		const c1 = new Comment({ content: 'c1', post });
		const c2 = new Comment({ content: 'c2', post });
		const c3 = new Comment({ content: 'c3', post: post2 });

		await DataStore.save(c1);
		await DataStore.save(c2);
		await DataStore.save(c3);

		await DataStore.delete(Post, post.id);
		expect(await DataStore.query(Comment, c1.id)).toBeUndefined();
		expect(await DataStore.query(Comment, c2.id)).toBeUndefined();
		expect((await DataStore.query(Comment, c3.id)).id).toEqual(c3.id);
		expect(await DataStore.query(Post, post.id)).toBeUndefined();
	});

	test('delete M:M function', async () => {
		const a1 = new Author({ name: 'author1' });
		const a2 = new Author({ name: 'author2' });
		const a3 = new Author({ name: 'author3' });
		const blog = new Blog({ name: 'B1', owner: new BlogOwner({ name: 'O1' }) });

		const post = new Post({
			title: 'Avatar',
			blog,
		});
		const post2 = new Post({
			title: 'Avatar 2',
			blog,
		});
		await DataStore.save(post);
		await DataStore.save(post2);

		await DataStore.delete(Post, post.id);
		const res = await db
			.transaction('user_PostAuthorJoin', 'readwrite')
			.objectStore('user_PostAuthorJoin')
			.index('postId')
			.getAll(post.id);
		expect(res).toHaveLength(0);
		await DataStore.delete(Post, c => c);
		await DataStore.delete(Author, c => c);
	});

	test('delete cascade', async () => {
		const a1 = await DataStore.save(new Author({ name: 'author1' }));
		const a2 = await DataStore.save(new Author({ name: 'author2' }));
		const blog = new Blog({
			name: 'The Blog',
			owner,
		});
		const p1 = new Post({
			title: 'Post 1',
			blog,
		});
		const p2 = new Post({
			title: 'Post 2',
			blog,
		});
		const c1 = await DataStore.save(new Comment({ content: 'c1', post: p1 }));
		const c2 = await DataStore.save(new Comment({ content: 'c2', post: p1 }));
		await DataStore.save(p1);
		await DataStore.save(p2);
		await DataStore.save(blog);
		await DataStore.delete(BlogOwner, owner.id);
		expect(await DataStore.query(Blog, blog.id)).toBeUndefined();
		expect(await DataStore.query(BlogOwner, owner.id)).toBeUndefined();
		expect(await DataStore.query(Post, p1.id)).toBeUndefined();
		expect(await DataStore.query(Post, p2.id)).toBeUndefined();
		expect(await DataStore.query(Comment, c1.id)).toBeUndefined();
		expect(await DataStore.query(Comment, c2.id)).toBeUndefined();
		expect(await DataStore.query(Author, a1.id)).toEqual(a1);
		expect(await DataStore.query(Author, a2.id)).toEqual(a2);
		const refResult = await db
			.transaction(`${USER}_PostAuthorJoin`, 'readonly')
			.objectStore(`${USER}_PostAuthorJoin`)
			.index('postId')
			.getAll(p1.id);
		expect(refResult).toHaveLength(0);
	});

	test('delete non existent', async () => {
		const author = new Author({ name: 'author1' });

		const deleted = await DataStore.delete(author);

		expect(deleted).toStrictEqual(author);

		const fromDB = await db
			.transaction(`${USER}_Author`, 'readonly')
			.objectStore(`${USER}_Author`)
			.get(author.id);

		expect(fromDB).toBeUndefined();
	});
});
