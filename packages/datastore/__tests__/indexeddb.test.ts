import Dexie from 'dexie';
import 'dexie-export-import';
import 'fake-indexeddb/auto';
import * as idb from 'idb';
import { AsyncCollection, DataStore, SortDirection } from '../src/index';
import { DATASTORE, SYNC, USER } from '../src/util';
import {
	Author,
	Album,
	Song,
	Blog,
	BlogOwner,
	Comment,
	Editor,
	Forum,
	ForumEditorJoin,
	Nested,
	Post,
	PostAuthorJoin,
	PostMetadata,
	Person,
	Project,
	Team,
} from './model';
let db: idb.IDBPDatabase;

const indexedDB = require('fake-indexeddb');
const IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

describe('Indexed db storage test', () => {
	let blog: InstanceType<typeof Blog>,
		blog2: InstanceType<typeof Blog>,
		blog3: InstanceType<typeof Blog>,
		owner: InstanceType<typeof BlogOwner>,
		owner2: InstanceType<typeof BlogOwner>;

	beforeAll(async () => {
		await DataStore.start();
		db = await idb.openDB('amplify-datastore', 2);
	});

	beforeEach(async () => {
		owner = new BlogOwner({ name: 'Owner 1' });
		owner2 = new BlogOwner({ name: 'Owner 2' });
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
		const createdObjStores = db.objectStoreNames;
		const expectedStores = [
			`${DATASTORE}_Setting`,
			`${SYNC}_ModelMetadata`,
			`${SYNC}_MutationEvent`,
			`${USER}_Album`,
			`${USER}_Author`,
			`${USER}_Blog`,
			`${USER}_BlogOwner`,
			`${USER}_Comment`,
			`${USER}_Editor`,
			`${USER}_Forum`,
			`${USER}_ForumEditorJoin`,
			`${USER}_Person`,
			`${USER}_Post`,
			`${USER}_PostAuthorJoin`,
			`${USER}_Project`,
			`${USER}_Song`,
			`${USER}_Team`,
		];

		expect(createdObjStores).toHaveLength(expectedStores.length);

		expect(expectedStores).toMatchObject(createdObjStores);

		expect(createdObjStores).not.toContain(`${USER}_blah`);

		// TODO: better way to get this
		const commentStore = (<any>db)._rawDatabase.rawObjectStores.get(
			`${USER}_Comment`
		);
		const postAuthorStore = (<any>db)._rawDatabase.rawObjectStores.get(
			`${USER}_PostAuthorJoin`
		);

		expect(commentStore.rawIndexes.has('byId')).toBe(true); // checks byIdIndex
		expect(postAuthorStore.rawIndexes.has('byId')).toBe(true); // checks byIdIndex
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
			.index('byId')
			.get(blog.id);

		expect(get1).toBeDefined();

		expect([...Object.keys(blog).sort(), 'blogOwnerId']).toEqual(
			expect.arrayContaining(Object.keys(get1).sort())
		);

		expect(get1['blogOwnerId']).toBe(owner.id);

		const get2 = await db
			.transaction(`${USER}_BlogOwner`, 'readonly')
			.objectStore(`${USER}_BlogOwner`)
			.index('byId')
			.get(owner.id);

		expect([...Object.keys(owner)].sort()).toEqual(
			expect.arrayContaining(Object.keys(get2).sort())
		);

		await DataStore.save(blog2);
		const get3 = await db
			.transaction(`${USER}_Blog`, 'readonly')
			.objectStore(`${USER}_Blog`)
			.index('byId')
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
			.index('byId')
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
			.index('byId')
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
			.index('byId')
			.get(post.id);

		expect(getPost.author).toBeUndefined();

		const a1 = new Author({ name: 'author1' });
		const a2 = new Author({ name: 'author2' });

		await DataStore.save(a1);
		await DataStore.save(a2);

		const getA1 = await db
			.transaction(`${USER}_Author`, 'readonly')
			.objectStore(`${USER}_Author`)
			.index('byId')
			.get(a1.id);
		expect(getA1.name).toEqual('author1');

		const getA2 = await db
			.transaction(`${USER}_Author`, 'readonly')
			.objectStore(`${USER}_Author`)
			.index('byId')
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
			.index('byId')
			.get(blog.id);

		expect(get1['blogOwnerId']).toBe(owner.id);
		const updated = Blog.copyOf(blog, (draft) => {
			draft.name = 'Avatar: The Last Airbender';
		});

		await DataStore.save(updated);
		const get2 = await db
			.transaction(`${USER}_Blog`, 'readonly')
			.objectStore(`${USER}_Blog`)
			.index('byId')
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
		query1.forEach(async (item) => {
			const itemOwner = await item.owner;
			if (itemOwner) {
				expect(itemOwner).toHaveProperty('name');
			}
		});
	});

	test('query M:1 lazy load', async () => {
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
		const q1Post = await q1!.post;
		expect(q1Post!.id).toEqual(p.id);
	});

	test('query lazily HAS_ONE/BELONGS_TO with explicit Field', async (done) => {
		const team1 = new Team({ name: 'team' });
		const savedTeam = await DataStore.save(team1);
		const project1 = new Project({
			name: 'Avatar: Last Airbender',
			teamID: team1.id,
			team: savedTeam,
		});

		await DataStore.save(project1);

		const q1 = (await DataStore.query(Project, project1.id))!;
		q1.team.then((value) => {
			expect(value!.id).toEqual(team1.id);
			done();
		});
	});

	test('query lazily HAS_MANY', async () => {
		const album1 = new Album({ name: "Lupe Fiasco's The Cool" });
		await DataStore.save(album1);
		const song1 = new Song({ name: 'Put you on Game', songID: album1.id });
		const song2 = new Song({ name: 'Streets on Fire', songID: album1.id });
		const song3 = new Song({ name: 'Superstar', songID: album1.id });

		const savedSong1 = await DataStore.save(song1);
		const savedSong2 = await DataStore.save(song2);
		const savedSong3 = await DataStore.save(song3);

		const q1 = await DataStore.query(Album, album1.id);

		const songs = await q1!.songs.toArray();
		expect(songs).toStrictEqual([savedSong1, savedSong2, savedSong3]);
	});

	test('query lazily MANY to MANY ', async () => {
		const f1 = new Forum({ title: 'forum1' });
		const f2 = new Forum({ title: 'forum2' });
		await DataStore.save(f1);
		await DataStore.save(f2);

		const e1 = new Editor({ name: 'editor1' });
		const e2 = new Editor({ name: 'editor2' });
		await DataStore.save(e1);
		await DataStore.save(e2);

		const f1e1 = await DataStore.save(
			new ForumEditorJoin({
				forum: f1 as any,
				editor: e1 as any,
			})
		);
		const f1e2 = await DataStore.save(
			new ForumEditorJoin({
				forum: f1 as any,
				editor: e2 as any,
			})
		);
		const f2e2 = await DataStore.save(
			new ForumEditorJoin({
				forum: f2 as any,
				editor: e2 as any,
			})
		);

		const q1 = (await DataStore.query(Forum, f1.id))!;
		const q2 = (await DataStore.query(Editor, e1.id))!;
		const q3 = (await DataStore.query(Editor, e2.id))!;
		const editors = await q1.editors.toArray();
		const forums = await q2.forums.toArray();
		const forums2 = await q3.forums.toArray();

		expect(editors).toStrictEqual([f1e1, f1e2]);
		expect(forums).toStrictEqual([f1e1]);
		expect(forums2).toStrictEqual([f1e2, f2e2]);
	});

	test('Memoization Test', async () => {
		expect.assertions(3);
		const team1 = new Team({ name: 'team' });
		const savedTeam = await DataStore.save(team1);
		const project1 = new Project({
			name: 'Avatar: Last Airbender',
			teamID: team1.id,
			team: savedTeam,
		});
		await DataStore.save(project1);

		const q1 = (await DataStore.query(Project, project1.id))!;
		const q2 = (await DataStore.query(Project, project1.id))!;

		// Ensure that model fields are actually promises
		if (
			typeof q1.team.then !== 'function' ||
			typeof q2.team.then !== 'function'
		) {
			throw new Error('Not a promise');
		}

		const team = await q1.team;
		const team2 = await q1.team;
		const team3 = await q2.team;

		// equality by reference proves memoization works
		expect(team).toBe(team2);

		// new instance of the same record will be equal by value
		expect(team).toEqual(team3);

		// but not by reference
		expect(team).not.toBe(team3);
	});

	test('Memoization Test AsyncCollection', async () => {
		const album1 = new Album({ name: "Lupe Fiasco's The Cool" });

		await DataStore.save(album1);
		await DataStore.save(
			new Song({ name: 'Put you on Game', songID: album1.id })
		);
		await DataStore.save(
			new Song({ name: 'Streets on Fire', songID: album1.id })
		);
		await DataStore.save(new Song({ name: 'Superstar', songID: album1.id }));

		const q1 = (await DataStore.query(Album, album1.id))!;
		const q2 = (await DataStore.query(Album, album1.id))!;

		const song = await q1.songs;
		const song2 = await q1.songs;
		const song3 = await q2.songs;

		// equality by reference proves memoization works
		expect(song).toStrictEqual(song2);

		// new instance of the same record will be equal by value
		expect(song).toEqual(song3);

		// but not by reference
		expect(song).not.toBe(song3);
	});

	test('Test lazy HAS_ONE/BELONGS_TO validation', async () => {
		const owner1 = new BlogOwner({ name: 'Blog' });
		expect(() => {
			new Project({
				name: 'Avatar: Last Airbender',
				teamID: owner1.id,
				team: owner1 as any,
			});
		}).toThrow('Value passed to Project.team is not an instance of Team');
	});

	test('Test lazy MANY to MANY validation', async () => {
		const f1 = new Forum({ title: 'forum1' });
		const f2 = new Forum({ title: 'forum2' });
		await DataStore.save(f1);
		await DataStore.save(f2);

		const e1 = new Editor({ name: 'editor1' });
		await DataStore.save(e1);

		expect(() => {
			new ForumEditorJoin({
				forum: f1 as any,
				editor: f2 as any,
			});
		}).toThrow(
			'Value passed to ForumEditorJoin.editor is not an instance of Editor'
		);
	});

	test('query with sort on a single field', async () => {
		const p1 = new Person({
			firstName: 'John',
			lastName: 'Snow',
		});

		const p2 = new Person({
			firstName: 'Clem',
			lastName: 'Fandango',
		});

		const p3 = new Person({
			firstName: 'Beezus',
			lastName: 'Fuffoon',
		});

		const p4 = new Person({
			firstName: 'Meow Meow',
			lastName: 'Fuzzyface',
		});

		await DataStore.save(p1);
		await DataStore.save(p2);
		await DataStore.save(p3);
		await DataStore.save(p4);

		const sortedPersons = await DataStore.query(Person, null, {
			page: 0,
			limit: 20,
			sort: (s) => s.firstName(SortDirection.DESCENDING),
		});

		expect(sortedPersons[0].firstName).toEqual('Meow Meow');
		expect(sortedPersons[1].firstName).toEqual('John');
		expect(sortedPersons[2].firstName).toEqual('Clem');
		expect(sortedPersons[3].firstName).toEqual('Beezus');
	});

	test('query with sort on multiple fields', async () => {
		const p1 = new Person({
			firstName: 'John',
			lastName: 'Snow',
			username: 'johnsnow',
		});
		const p2 = new Person({
			firstName: 'John',
			lastName: 'Umber',
			username: 'smalljohnumber',
		});

		const p3 = new Person({
			firstName: 'John',
			lastName: 'Umber',
			username: 'greatjohnumber',
		});

		await DataStore.save(p1);
		await DataStore.save(p2);
		await DataStore.save(p3);

		const sortedPersons = await DataStore.query(
			Person,
			(c) => c.username.ne(undefined),
			{
				page: 0,
				limit: 20,
				sort: (s) =>
					s
						.firstName(SortDirection.ASCENDING)
						.lastName(SortDirection.ASCENDING)
						.username(SortDirection.ASCENDING),
			}
		);

		expect(sortedPersons[0].username).toEqual('johnsnow');
		expect(sortedPersons[1].username).toEqual('greatjohnumber');
		expect(sortedPersons[2].username).toEqual('smalljohnumber');
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
			Blog.copyOf(blog, (draft) => {
				draft;
			})
		);
		await DataStore.save(blog2);
		await DataStore.save(blog3);

		await DataStore.delete(Blog, (c) => c.name('beginsWith', 'Avatar'));

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
		expect((await DataStore.query(Comment, c2.id))?.id).toEqual(c2.id);
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
		expect((await DataStore.query(Comment, c3.id))?.id).toEqual(c3.id);
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
		await DataStore.delete(Post, (c) => c);
		await DataStore.delete(Author, (c) => c);
	});

	// skipping in this PR. will re-enable as part of cascading deletes work
	test.skip('delete cascade', async () => {
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

describe('AsyncCollection toArray Test', () => {
	describe('Validating differing Parameters', () => {
		[
			{
				input: undefined,
				expected: [0, 1, 2, 3],
			},
			{
				input: {},
				expected: [0, 1, 2, 3],
			},
			{
				input: { max: 3 },
				expected: [0, 1, 2],
			},
		].forEach((Parameter) => {
			test(`Testing input of ${Parameter.input}`, async (done) => {
				const { input, expected } = Parameter;
				const album1 = new Album({
					name: "Lupe Fiasco's The Cool",
				});
				const song1 = new Song({
					name: 'Put you on Game',
					songID: album1.id,
				});
				const song2 = new Song({
					name: 'Streets on Fire',
					songID: album1.id,
				});
				const song3 = new Song({
					name: 'Superstar',
					songID: album1.id,
				});
				const song4 = new Song({
					name: 'The Coolest',
					songID: album1.id,
				});
				await DataStore.save(album1);
				const savedSong1 = await DataStore.save(song1);
				const savedSong2 = await DataStore.save(song2);
				const savedSong3 = await DataStore.save(song3);
				const savedSong4 = await DataStore.save(song4);
				const songsArray = [savedSong1, savedSong2, savedSong3, savedSong4];
				const q1 = await DataStore.query(Album, album1.id);
				const songs = await q1!.songs;
				const expectedValues: any[] = [];
				for (const num of expected) {
					expectedValues.push(songsArray[num]);
				}
				songs.toArray(input).then((value) => {
					expect(value).toStrictEqual(expectedValues);
					done();
				});
			});
		});
	});
});

describe('DB versions migration', () => {
	beforeEach(async () => {
		db.close();
		await DataStore.clear();
	});

	test('Migration from v1 to v2', async () => {
		const v1Data = require('./v1schema.data.json');

		const blob = new Blob([JSON.stringify(v1Data)], {
			type: 'application/json',
		});

		// Import V1
		(await Dexie.import(blob)).close();

		// Migrate to V2
		await DataStore.start();

		// Open V2
		db = await idb.openDB('amplify-datastore', 2);

		expect(db.objectStoreNames).toMatchObject(
			v1Data.data.tables.map(({ name }) => name)
		);

		for (const storeName of db.objectStoreNames) {
			expect(db.transaction(storeName).store.indexNames).toContain('byId');
		}

		const dexie = await new Dexie('amplify-datastore').open();
		const exportedBlob = await dexie.export();

		function readBlob(blob: Blob): Promise<string> {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onabort = (ev) => reject(new Error('file read aborted'));
				reader.onerror = (ev) => reject((ev.target as any).error);
				reader.onload = (ev) => resolve((ev.target as any).result);
				reader.readAsText(blob);
			});
		}

		const exportedJSON = await readBlob(exportedBlob);
		const exported = JSON.parse(exportedJSON);

		for (const { schema } of exported.data.tables) {
			expect(schema.split(',')).toContain('&id');
		}

		expect(exported).toMatchSnapshot('v2-schema');
	});
});
