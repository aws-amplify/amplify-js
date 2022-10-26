import { NonModelTypeConstructor, PersistentModelConstructor } from '../src';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { default as AsyncStorageAdapterType } from '../src/storage/adapter/AsyncStorageAdapter';
import { DATASTORE, USER } from '../src/util';
import {
	Author as AuthorType,
	Blog as BlogType,
	BlogOwner as BlogOwnerType,
	Comment as CommentType,
	Nested as NestedType,
	Post as PostType,
	PostAuthorJoin as PostAuthorJoinType,
	PostMetadata as PostMetadataType,
	Person as PersonType,
} from './model';
import { newSchema } from './schema';
import { SortDirection } from '../src/types';

let AsyncStorageAdapter: typeof AsyncStorageAdapterType;

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;

let Author: PersistentModelConstructor<InstanceType<typeof AuthorType>>;
let Blog: PersistentModelConstructor<InstanceType<typeof BlogType>>;
let BlogOwner: PersistentModelConstructor<InstanceType<typeof BlogOwnerType>>;
let Comment: PersistentModelConstructor<InstanceType<typeof CommentType>>;
let Nested: NonModelTypeConstructor<InstanceType<typeof NestedType>>;
let Post: PersistentModelConstructor<InstanceType<typeof PostType>>;
let Person: PersistentModelConstructor<InstanceType<typeof PersonType>>;
let PostAuthorJoin: PersistentModelConstructor<
	InstanceType<typeof PostAuthorJoinType>
>;
let PostMetadata: NonModelTypeConstructor<
	InstanceType<typeof PostMetadataType>
>;

const inmemoryMap = new Map<string, string>();

/**
 * Renders more complete out of band traces.
 */
process.on('unhandledRejection', reason => {
	console.log(reason); // log the reason including the stack trace
});

// ! We have to mock the same storage interface the AsyncStorageDatabase depends on
// ! as a singleton so that new instances all share the same underlying data structure.
jest.mock('../src/storage/adapter/InMemoryStore', () => {
	class InMemoryStore {
		getAllKeys = async () => {
			return Array.from(inmemoryMap.keys());
		};
		multiGet = async (keys: string[]) => {
			return keys.reduce(
				(res, k) => (res.push([k, inmemoryMap.get(k)!]), res),
				[] as [string, string][]
			);
		};
		multiRemove = async (keys: string[]) => {
			return keys.forEach(k => inmemoryMap.delete(k));
		};
		setItem = async (key: string, value: string) => {
			return inmemoryMap.set(key, value);
		};
		removeItem = async (key: string) => {
			return inmemoryMap.delete(key);
		};
		getItem = async (key: string) => {
			return inmemoryMap.get(key);
		};
	}

	return {
		createInMemoryStore() {
			return new InMemoryStore();
		},
		InMemoryStore,
	};
});

jest.mock(
	'../src/storage/adapter/getDefaultAdapter/index',
	() => () => AsyncStorageAdapter
);

/**
 * Sets up the schema for the tests
 *
 * @param beforeSetUp Executed after reseting modules but before re-requiring the schema initialization
 */
function setUpSchema(beforeSetUp?: Function) {
	// Somehow or another, `resetModules()` causes DataStore to "forget"
	// that the constructors in scope are valid model Constructors. I'm
	// leaving the deep-dive on this aside for now, beause there's good coverage
	// for through `AsyncStorageAdapter.test`. Some of tests appear fairly redundant
	// and less comprehensive.
	// jest.resetModules();

	if (typeof beforeSetUp === 'function') {
		beforeSetUp();
	}

	({
		default: AsyncStorageAdapter,
	} = require('../src/storage/adapter/AsyncStorageAdapter'));

	({ initSchema, DataStore } = require('../src/datastore/datastore'));

	({
		Author,
		Blog,
		BlogOwner,
		Comment,
		Nested,
		Post,
		Person,
		PostAuthorJoin,
		PostMetadata,
	} = <
		{
			Author: typeof Author;
			Blog: typeof Blog;
			BlogOwner: typeof BlogOwner;
			Comment: typeof Comment;
			Nested: typeof Nested;
			Post: typeof Post;
			Person: typeof Person;
			PostAuthorJoin: typeof PostAuthorJoin;
			PostMetadata: typeof PostMetadata;
		}
	>initSchema(newSchema));
}

describe('AsyncStorage tests', () => {
	const { InMemoryStore } = require('../src/storage/adapter/InMemoryStore');
	const AsyncStorage = new InMemoryStore();

	let blog: InstanceType<typeof Blog>,
		blog2: InstanceType<typeof Blog>,
		blog3: InstanceType<typeof Blog>,
		owner: InstanceType<typeof BlogOwner>,
		owner2: InstanceType<typeof BlogOwner>;

	beforeEach(async () => {
		setUpSchema();

		owner = await DataStore.save(
			new BlogOwner({
				name: 'Owner 1',
			})
		);
		owner2 = await DataStore.save(
			new BlogOwner({
				name: 'Owner 2',
			})
		);
		blog = await DataStore.save(
			new Blog({
				name: 'Avatar: Last Airbender',
				owner,
			})
		);
		blog2 = await DataStore.save(
			new Blog({
				name: 'blog2',
				owner: owner2,
			})
		);
		blog3 = await DataStore.save(
			new Blog({
				name: 'Avatar 101',
				owner: await DataStore.save(
					new BlogOwner({
						name: 'owner 3',
					})
				),
			})
		);

		await DataStore.start();
	});

	afterEach(async () => {
		await DataStore.clear();
	});

	test('setup function', async () => {
		const allKeys = await AsyncStorage.getAllKeys();
		expect(allKeys).not.toHaveLength(0); // At leaset the settings entry should be present
		expect(allKeys[0]).toMatch(
			new RegExp(
				`@AmplifyDatastore::${DATASTORE}_Setting::Data::\\w{26}::\\w{26}`
			)
		);
	});

	test('save function 1:1 insert', async () => {
		await DataStore.save(blog);

		await DataStore.save(owner);

		const get1 = JSON.parse(
			await AsyncStorage.getItem(
				getKeyForAsyncStorage(USER, Blog.name, blog.id)
			)
		);

		expect({
			...blog,
			blogOwnerId: owner.id,
		}).toMatchObject(get1);

		expect(get1['blogOwnerId']).toBe(owner.id);

		const get2 = JSON.parse(
			await AsyncStorage.getItem(
				getKeyForAsyncStorage(USER, BlogOwner.name, owner.id)
			)
		);

		expect(owner).toMatchObject(get2);

		await DataStore.save(blog2);

		const get3 = JSON.parse(
			await AsyncStorage.getItem(
				getKeyForAsyncStorage(USER, Blog.name, blog2.id)
			)
		);

		expect({
			...blog2,
			blogOwnerId: owner2.id,
		}).toMatchObject(get3);
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

		const postFromDB = JSON.parse(
			await AsyncStorage.getItem(getKeyForAsyncStorage(USER, Post.name, p.id))
		);

		expect(postFromDB.metadata).toMatchObject({
			rating: 3,
			tags: ['a', 'b', 'c'],
			nested: new Nested({
				aField: 'Some value',
			}),
		});
	});

	test('save update', async () => {
		await DataStore.save(blog);
		await DataStore.save(owner);

		const get1 = JSON.parse(
			await AsyncStorage.getItem(
				getKeyForAsyncStorage(USER, Blog.name, blog.id)
			)
		);

		expect(get1['blogOwnerId']).toBe(owner.id);
		const updated = Blog.copyOf(blog, draft => {
			draft.name = 'Avatar: The Last Airbender';
		});

		await DataStore.save(updated);
		const get2 = JSON.parse(
			await AsyncStorage.getItem(
				getKeyForAsyncStorage(USER, Blog.name, blog.id)
			)
		);

		expect(get2.name).toEqual(updated.name);
	});

	test('query function 1:1', async () => {
		const savedBlog = await DataStore.save(blog);
		await DataStore.save(owner);

		const retrievedBlog = await DataStore.query(Blog, blog.id);
		expect(retrievedBlog).toEqual(savedBlog);

		const allBlogs = await DataStore.query(Blog);

		await Promise.all(
			allBlogs.map(async item => {
				if (item.owner) {
					expect(await item.owner).toHaveProperty('name');
				}
			})
		);
	});

	test('query M:1 lazy load', async () => {
		const p = new Post({
			title: 'Avatar',
			blog,
		});

		const c1 = new Comment({
			content: 'comment 1',
			post: p,
		});

		const c2 = new Comment({
			content: 'comment 2',
			post: p,
		});

		await DataStore.save(p);
		await DataStore.save(c1);
		await DataStore.save(c2);
		const q1 = await DataStore.query(Comment, c1.id);
		const resolvedPost = await q1!.post;
		expect(resolvedPost!.id).toEqual(p.id);
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
			sort: s => s.firstName(SortDirection.DESCENDING),
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
			c => c.username.ne(undefined),
			{
				page: 0,
				limit: 20,
				sort: s =>
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
			Blog.copyOf(blog, draft => {
				draft;
			})
		);
		await DataStore.save(blog2);
		await DataStore.save(blog3);

		await DataStore.delete(Blog, c => c.name.beginsWith('Avatar'));

		expect(await DataStore.query(Blog, blog.id)).toBeUndefined();
		expect(await DataStore.query(Blog, blog2.id)).toBeDefined();
		expect(await DataStore.query(Blog, blog3.id)).toBeUndefined();
	});

	test('delete M:1 function', async () => {
		const post = new Post({
			title: 'Avatar',
			blog,
		});
		const c1 = new Comment({
			content: 'c1',
			post,
		});
		const c2 = new Comment({
			content: 'c2',
			post,
		});

		await DataStore.save(post);

		await DataStore.save(c1);
		await DataStore.save(c2);

		await DataStore.delete(Comment, c1.id);

		expect(await DataStore.query(Comment, c1.id)).toBeUndefined;
		expect((await DataStore.query(Comment, c2.id))!.id).toEqual(c2.id);
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

		const c1 = new Comment({
			content: 'c1',
			post,
		});
		const c2 = new Comment({
			content: 'c2',
			post,
		});
		const c3 = new Comment({
			content: 'c3',
			post: post2,
		});

		await DataStore.save(c1);
		await DataStore.save(c2);
		await DataStore.save(c3);

		await DataStore.delete(Post, post.id);
		expect(await DataStore.query(Comment, c1.id)).toBeUndefined();
		expect(await DataStore.query(Comment, c2.id)).toBeUndefined();
		expect((await DataStore.query(Comment, c3.id))!.id).toEqual(c3.id);
		expect(await DataStore.query(Post, post.id)).toBeUndefined();
	});

	test('delete M:M function', async () => {
		const a1 = await DataStore.save(
			new Author({
				name: 'author1',
			})
		);
		const a2 = await DataStore.save(
			new Author({
				name: 'author2',
			})
		);
		const a3 = await DataStore.save(
			new Author({
				name: 'author3',
			})
		);
		const blog = await DataStore.save(
			new Blog({
				name: 'B1',
				owner: await DataStore.save(
					new BlogOwner({
						name: 'O1',
					})
				),
			})
		);

		await DataStore.save(blog);

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

		const postAuthorJoins = await DataStore.query(PostAuthorJoin);

		expect(postAuthorJoins).toHaveLength(0);

		await DataStore.delete(Post, c => c);
		await DataStore.delete(Author, c => c);
	});

	test('delete non existent', async () => {
		const author = new Author({
			name: 'author1',
		});

		const deleted = await DataStore.delete(author);

		expect(deleted).toStrictEqual(author);

		const fromDB = await AsyncStorage.getItem(
			getKeyForAsyncStorage(USER, Author.name, author.id)
		);

		expect(fromDB).toBeUndefined();
	});

	describe('Internal AsyncStorage key schema changes', () => {
		test('Keys are migrated to the new format with ulid', async () => {
			setUpSchema(() => {
				/**
				 * This section makes sure that generated ulids are seeded so they always match the snapshot
				 */

				// Small seedable pseudo-random number generator, taken from https://stackoverflow.com/a/19303725/194974
				let seed = 1;
				function random() {
					const x = Math.sin(seed++) * 10000;
					return x - Math.floor(x);
				}

				const ulid = require('ulid');
				const simulatedSeed = 1589482924218;
				const oldMonotonicFactory = ulid.monotonicFactory;

				ulid.monotonicFactory = () => () => {
					return oldMonotonicFactory(random)(simulatedSeed);
				};
			});

			const oldData: [
				string,
				string[]
			] = require('./AsyncStorage.migration.data.json');

			inmemoryMap.clear();
			oldData.forEach(([k, v]) => inmemoryMap.set(k, v));

			await DataStore.query(Post);

			const newKeys = await AsyncStorage.getAllKeys();

			expect(newKeys).toMatchSnapshot();
		});
	});
});

function getKeyForAsyncStorage(
	namespaceName: string,
	modelName: string,
	id: string
) {
	const collectionInMemoryIndex: Map<string, Map<string, string>> = (<any>(
		AsyncStorageAdapter
	)).db._collectionInMemoryIndex;
	const storeName = `${namespaceName}_${modelName}`;
	const ulid = collectionInMemoryIndex.get(storeName)!.get(id);

	return `@AmplifyDatastore::${storeName}::Data::${ulid}::${id}`;
}
