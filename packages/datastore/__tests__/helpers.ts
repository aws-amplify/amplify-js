import Observable from 'zen-observable-ts';
import { ModelInit, Schema, InternalSchema, __modelMeta__ } from '../src/types';
import {
	AsyncCollection,
	MutableModel,
	DataStore as DS,
	CompositeIdentifier,
	CustomIdentifier,
	ManagedIdentifier,
	PersistentModel,
	OptionallyManagedIdentifier,
	PersistentModelConstructor,
} from '../src';

import {
	initSchema as _initSchema,
	DataStore as DataStoreInstance,
} from '../src/datastore/datastore';

type initSchemaType = typeof _initSchema;
type DataStoreType = typeof DataStoreInstance;

/**
 * Convenience function to wait for a number of ms.
 *
 * Intended as a cheap way to wait for async operations to settle.
 *
 * @param ms number of ms to pause for
 */
export async function pause(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Case insensitive regex that matches GUID's and UUID's.
 * It does NOT permit whitespace on either end of the string. The caller must `trim()` first as-needed.
 */
export const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Tests a mutation for expected values. If values are present on the mutation
 * that are not expected, throws an error. Expected values can be listed as a
 * literal value, a regular expression, or a function (v => bool).
 *
 * `id` is automatically tested and expected to be a UUID unless an alternative
 *  matcher is provided.
 *
 * @param mutation A mutation record to check
 * @param values An object for specific values to test. Format of key: value | regex | v => bool
 */
export function expectMutation(mutation, values) {
	const data = JSON.parse(mutation.data);
	const matchers = {
		id: UUID_REGEX,
		...values,
	};
	const errors = [
		...errorsFrom(data, matchers),
		...extraFieldsFrom(data, matchers).map(f => `Unexpected field: ${f}`),
	];
	if (errors.length > 0) {
		throw new Error(
			`Bad mutation: ${JSON.stringify(data, null, 2)}\n${errors.join('\n')}`
		);
	}
}

export function expectType<T>(_param: T): _param is T {
	return true;
}

export function dummyInstance<T extends PersistentModel>(): T {
	return <T>{};
}

/**
 * Checks an object for adherence to expected values from a set of matchers.
 * Returns a list of erroneous key-value pairs.
 * @param data the object to validate.
 * @param matchers the matcher functions/values/regexes to test the object with
 */
export function errorsFrom<T extends Object>(
	data: T,
	matchers: Record<string, any>
) {
	return Object.entries(matchers).reduce((errors, [property, matcher]) => {
		const value = data[property];
		if (
			!(
				(typeof matcher === 'function' && matcher(value)) ||
				(matcher instanceof RegExp && matcher.test(value)) ||
				(typeof matcher === 'object' &&
					JSON.stringify(value) === JSON.stringify(matcher)) ||
				value === matcher
			)
		) {
			errors.push(
				`Property '${property}' value "${value}" does not match "${matcher}"` as never
			);
		}
		return errors;
	}, []);
}

/**
 * Checks to see if a given object contains any extra, unexpected properties.
 * If any are present, it returns the list of unexpectd fields.
 *
 * @param data the object that MIGHT contain extra fields.
 * @param template the authorative template object.
 */
export function extraFieldsFrom(data, template) {
	const fields = Object.keys(data);
	const expectedFields = new Set(Object.keys(template));
	return fields.filter(name => !expectedFields.has(name));
}

/**
 * Left-pads or truncates a string to a desired width.
 *
 * The defaults of `{ width: 2, fillter: '0' }` are intended for padding date
 * and time components, but could also be used for log line fields.
 *
 * For example:
 *
 * ```
 * padLeft("123", 4, '0') === '0123'
 * padLeft("123", 2, '0') === '23'
 * ```
 *
 * @param str String to pad.
 * @param width Width the final string will be.
 * @param filler The string to pad with.
 * @returns A left-padded or truncated string.
 */
export function padLeft(str, width: number = 2, filler = '0') {
	const pad = [...new Array(width)].map(entry => filler).join('');
	const buffer = pad + String(str);
	return buffer.substring(buffer.length - width, buffer.length);
}

/**
 * Right-pads or truncates a string to a desired width.
 *
 * Intended for padding fields in log lines.
 *
 * For example:
 *
 * ```
 * padRight("abcd", 3, ' ') === 'abc'
 * padRight("ab",   3, ' ') === 'ab '
 * ```
 *
 * @param str String to pad.
 * @param width Width the final string will be.
 * @param filler The string to pad with.
 * @returns A right-padded or truncated string.
 */
export function padRight(str, width: number, filler = ' ') {
	const pad = [...new Array(width)].map(entry => filler).join('');
	const buffer = String(str) + pad;
	return buffer.substring(0, width);
}

/**
 * Time format to use in debug logging for consistency and readability.
 *
 * Format:
 *
 * ```
 * HH:MM:SS.μμμ
 * ```
 *
 * Examples:
 *
 * ```
 * 12:34:45.678
 * 01:02:03.004
 * ```
 */
export function logDate() {
	const d = new Date();
	return [
		padLeft(d.getHours()),
		':',
		padLeft(d.getMinutes()),
		':',
		padLeft(d.getSeconds()),
		'.',
		padLeft(d.getMilliseconds(), 3),
	].join('');
}

/**
 * Private.
 *
 * Interval used by `warpTime`. Lives in this scope so that `unwarpTime` can
 * find it during cleanup.
 */
let warpTimeTick;

/**
 * Injects fake `setInterval`, `setTimeout`, and other time-related functions
 * to allow us to make "time" happen faster during testing. Time will happen
 * faster according to a given `multiplier`.
 *
 * Time warping is accomplished with a combination of jest's `useFakeTimers`
 * and invoking `jest.advanceTimersByTime()` using a *real* interval created
 * prior to injecting the fakes.
 *
 * Once time warping is on, you can advance time in your tests *beyond* what
 * time warping already does by calling any of jest's time manipulation
 * functions: https://archive.jestjs.io/docs/en/24.x/timer-mocks
 *
 * **IMPORTANT:** Remember to return back to normal at the end of your test
 * by calling `unwarpTime()`, Doctor.
 *
 * > *Tinkering with time can weaken the very fabric of the universe.*
 *
 * Be careful.
 *
 * @param multiplier How much faster than regular time should we run?
 */
export function warpTime(multiplier = 20) {
	warpTimeTick = setInterval(() => {
		jest.advanceTimersByTime(25 * multiplier);
	}, 25);
	jest.useFakeTimers();
}

/**
 * Stops warping time and returns time-related functions to their builtin
 * implementations.
 */
export function unwarpTime() {
	jest.useRealTimers();
	clearInterval(warpTimeTick);
}

/**
 * Tricks DataStore into performing sync operation by:
 *
 * 1. setting a fake AppSync endpoint (localhost)
 * 1. starting DataStore
 * 1. telling the mutations processor that it's "ready"
 * 1. setting model sync'd status to `false` across the board.
 *
 * Remember to `unconfigureSync()` after the tests are done.
 *
 * ```
 * beforeEach(async () => {
 *  ({ DataStore } = getDataStore());
 * 	await configureSync(DataStore);
 * });
 *
 * afterEach(async () => {
 * 	await unconfigureSync(DataStore);
 * });
 * ```
 *
 * @param DataStore The DataStore instance to operate against.
 * @param isReady Whether to pretend DataStore mutatinos processor is
 * ready, where readiness tells DataStore to attempt to push mutations
 * at the AppSync endpoint.
 */
export async function configureSync(DataStore, isReady = () => false) {
	(DataStore as any).amplifyConfig.aws_appsync_graphqlEndpoint =
		'https://0.0.0.0/does/not/exist/graphql';

	// WARNING: When DataStore starts, it immediately start the sync
	// engine, which won't have our isReady mock in place yet. This
	// should trigger a *single*
	await DataStore.start();

	const syncEngine = (DataStore as any).sync;

	// my jest spy-fu wasn't up to snuff here. but, this succesfully
	// prevents the mutation process from clearing the mutation queue, which
	// allows us to observe the state of mutations.
	(syncEngine as any).mutationsProcessor.isReady = isReady;
	DataStore.sync.getModelSyncedStatus = (model: any) => false;
}

/**
 * Removes the appsync endpoint, so that if the instance is restarted, it will
 * not try to talk to AppSync or spin up the sync engine.
 *
 * @param DataStore The DataStore instance to operate against.
 */
export async function unconfigureSync(DataStore) {
	(DataStore as any).amplifyConfig.aws_appsync_graphqlEndpoint = undefined;
}

/**
 * Configures sync and instructs DataStore to operate as though all models
 * are synced from AppSync.
 */
export async function pretendModelsAreSynced(DataStore: any) {
	await configureSync(DataStore);
	DataStore.sync.getModelSyncedStatus = (model: any) => true;
}

/**
 * Executes a given test script at warp speed against a fresh DataStore
 * instance `cycle` times, clearing between cycles.
 *
 * The intended use is for tests that intentionally try to leak background
 * work between test contexts, as was possible prior the introduction of
 * `BackgroundProcessManager`'s and clean `stop()` methods on DataStore
 * and its processors.
 *
 * @see warpTime
 *
 * @param script A test script to execute.
 * @param cycles The number of cyclcles to run.
 * @param focusedLogging Whether to timestamp and filter all error, warn, and
 * debug logging and include additional logging around each test cycle.
 */
export async function expectIsolation(
	script: (ctx: {
		DataStore: any;
		Post: PersistentModelConstructor<Post>;
		cycle: number;
	}) => Promise<any>,
	cycles = 5,
	focusedLogging = false
) {
	try {
		warpTime();

		if (focusedLogging) {
			(console as any)._warn = console.warn;
			console.warn = (...args) => {
				if (!args[0].match(/ensure credentials|User is unauthorized/)) {
					(console as any)._warn(logDate(), ...args);
				}
			};

			(console as any)._error = console.error;
			console.error = (...args) => {
				if (!args[0].match(/AuthError/)) {
					(console as any)._error(logDate(), ...args);
				}
			};

			(console as any)._debug = console.debug;
			console.debug = (...args) => {
				(console as any)._debug(logDate(), ...args);
			};
		}

		const log = line => {
			if (focusedLogging) {
				console.debug(line);
			}
		};

		log(`STARTING:      "${expect.getState().currentTestName}"`);

		for (let cycle = 1; cycle <= cycles; cycle++) {
			// basic initialization
			const { DataStore, Post } = getDataStore();

			// act
			try {
				log(
					`start cycle:   "${expect.getState().currentTestName}" cycle ${cycle}`
				);
				await script({ DataStore, Post, cycle });
				log(
					`end cycle:     "${expect.getState().currentTestName}" cycle ${cycle}`
				);
			} finally {
				// clean up
				log(
					`before clear: "${expect.getState().currentTestName}" cycle ${cycle}`
				);
				await DataStore.clear();
				log(
					`after clear:  "${expect.getState().currentTestName}" cycle ${cycle}`
				);
			}

			// expect no errors
			// TODO: upgrade jest and assert no pending timers!
		}
		log(`ENDING:        "${expect.getState().currentTestName}"`);
	} finally {
		if (focusedLogging) {
			console.warn = (console as any)._warn;
			console.error = (console as any)._error;
			console.debug = (console as any)._debug;
		}
		unwarpTime();
	}
}

/**
 * Re-requries DataStore, initializes the test schema.
 *
 * @returns The DataStore instance and models from `testSchema`.
 */
export function getDataStore() {
	const {
		initSchema,
		DataStore,
	}: {
		initSchema: initSchemaType;
		DataStore: DataStoreType;
	} = require('../src/datastore/datastore');

	const classes = initSchema(testSchema());
	const {
		Post,
		Comment,
		User,
		Profile,
		PostComposite,
		PostCustomPK,
		PostCustomPKSort,
		PostCustomPKComposite,
	} = classes as {
		Post: PersistentModelConstructor<Post>;
		Comment: PersistentModelConstructor<Comment>;
		User: PersistentModelConstructor<User>;
		Profile: PersistentModelConstructor<Profile>;
		PostComposite: PersistentModelConstructor<PostComposite>;
		PostCustomPK: PersistentModelConstructor<PostCustomPK>;
		PostCustomPKSort: PersistentModelConstructor<PostCustomPKSort>;
		PostCustomPKComposite: PersistentModelConstructor<PostCustomPKComposite>;
	};

	return {
		DataStore,
		Post,
		Comment,
		User,
		Profile,
		PostComposite,
		PostCustomPK,
		PostCustomPKSort,
		PostCustomPKComposite,
	};
}

// #region schemas
export const DataStore: typeof DS = (() => {
	class clazz {}

	const proxy = new Proxy(clazz, {
		get: (_, prop) => {
			const p = prop as keyof typeof DS;

			switch (p) {
				case 'query':
				case 'save':
				case 'delete':
					return () => new Proxy({}, {});
				case 'observe':
				case 'observeQuery':
					return () => Observable.of();
			}
		},
	}) as unknown as typeof DS;

	return proxy;
})();

export declare class Model {
	public readonly id: string;
	public readonly field1: string;
	public readonly optionalField1?: string;
	public readonly dateCreated: string;
	public readonly emails?: string[];
	public readonly ips?: (string | null)[];
	public readonly metadata?: Metadata;
	public readonly createdAt?: string;
	public readonly updatedAt?: string;

	constructor(init: ModelInit<Model>);

	static copyOf(
		src: Model,
		mutator: (draft: MutableModel<Model>) => void | Model
	): Model;
}
export declare class Metadata {
	readonly author: string;
	readonly tags?: string[];
	readonly rewards: string[];
	readonly penNames: string[];
	readonly nominations?: string[];
	readonly misc?: (string | null)[];
	constructor(init: Metadata);
}

export declare class Post {
	public readonly id: string;
	public readonly title: string;
	public readonly comments: AsyncCollection<Comment>;

	constructor(init: ModelInit<Post>);

	static copyOf(
		src: Post,
		mutator: (draft: MutableModel<Post>) => void | Post
	): Post;
}

export declare class Comment {
	public readonly id: string;
	public readonly content: string;
	public readonly post: Promise<Post>;
	public readonly postId?: string;

	constructor(init: ModelInit<Comment>);

	static copyOf(
		src: Comment,
		mutator: (draft: MutableModel<Comment>) => void | Comment
	): Comment;
}

export declare class User {
	public readonly id: string;
	public readonly name: string;
	public readonly profile: Promise<Profile | undefined>;
	public readonly profileID?: string;

	constructor(init: ModelInit<User>);

	static copyOf(
		src: User,
		mutator: (draft: MutableModel<User>) => void | User
	): User;
}
export declare class Profile {
	public readonly id: string;
	public readonly firstName: string;
	public readonly lastName: string;

	constructor(init: ModelInit<Profile>);

	static copyOf(
		src: Profile,
		mutator: (draft: MutableModel<Profile>) => void | Profile
	): Profile;
}

export declare class PostComposite {
	public readonly id: string;
	public readonly title: string;
	public readonly description: string;
	public readonly created: string;
	public readonly sort: number;

	constructor(init: ModelInit<PostComposite>);

	static copyOf(
		src: PostComposite,
		mutator: (draft: MutableModel<PostComposite>) => void | PostComposite
	): PostComposite;
}

export declare class PostCustomPK {
	readonly [__modelMeta__]: {
		identifier: CustomIdentifier<PostCustomPK, 'postId'>;
	};
	public readonly postId: string;
	public readonly title: string;
	public readonly description?: string;
	public readonly dateCreated: string;
	public readonly optionalField1?: string;
	public readonly emails?: string[];
	public readonly createdAt?: string;
	public readonly updatedAt?: string;

	constructor(init: ModelInit<PostCustomPK>);

	static copyOf(
		src: PostCustomPK,
		mutator: (draft: MutableModel<PostCustomPK>) => void | PostCustomPK
	): PostCustomPK;
}

export declare class PostCustomPKSort {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<PostCustomPKSort, ['id', 'postId']>;
	};
	public readonly id: number | string;
	public readonly postId: string;
	public readonly title: string;
	public readonly description?: string;

	constructor(init: ModelInit<PostCustomPKSort>);

	static copyOf(
		src: PostCustomPKSort,
		mutator: (draft: MutableModel<PostCustomPKSort>) => void | PostCustomPKSort
	): PostCustomPKSort;
}

export declare class PostCustomPKComposite {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<PostCustomPKComposite, ['id', 'postId']>;
	};
	public readonly id: string;
	public readonly postId: string;
	public readonly title: string;
	public readonly description?: string;
	public readonly sort: number;

	constructor(init: ModelInit<PostCustomPKComposite>);

	static copyOf(
		src: PostCustomPKComposite,
		mutator: (
			draft: MutableModel<PostCustomPKComposite>
		) => void | PostCustomPKComposite
	): PostCustomPKComposite;
}

export declare class BasicModel {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<BasicModel, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly body: string;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<BasicModel>);
	static copyOf(
		source: BasicModel,
		mutator: (
			draft: MutableModel<BasicModel>
		) => MutableModel<BasicModel> | void
	): BasicModel;
}

export declare class HasOneParent {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<HasOneParent, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly child: Promise<HasOneChild | undefined>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	readonly hasOneParentChildId?: string | null;
	constructor(init: ModelInit<HasOneParent>);
	static copyOf(
		source: HasOneParent,
		mutator: (
			draft: MutableModel<HasOneParent>
		) => MutableModel<HasOneParent> | void
	): HasOneParent;
}

export declare class HasOneChild {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<HasOneChild, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly content?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<HasOneChild>);
	static copyOf(
		source: HasOneChild,
		mutator: (
			draft: MutableModel<HasOneChild>
		) => MutableModel<HasOneChild> | void
	): HasOneChild;
}

export declare class DefaultPKParent {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<DefaultPKParent, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly content?: string | null;
	readonly children: AsyncCollection<DefaultPKChild>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<DefaultPKParent>);
	static copyOf(
		source: DefaultPKParent,
		mutator: (
			draft: MutableModel<DefaultPKParent>
		) => MutableModel<DefaultPKParent> | void
	): DefaultPKParent;
}

export declare class DefaultPKChild {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<DefaultPKChild, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly content?: string | null;
	readonly parent: Promise<DefaultPKParent | undefined>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	readonly defaultPKParentChildrenId?: string | null;
	constructor(init: ModelInit<DefaultPKChild>);
	static copyOf(
		source: DefaultPKChild,
		mutator: (
			draft: MutableModel<DefaultPKChild>
		) => MutableModel<DefaultPKChild> | void
	): DefaultPKChild;
}

/**
 * This is it.
 */
export declare class CompositePKParent {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<CompositePKParent, ['customId', 'content']>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly customId: string;
	readonly content: string;
	readonly children: AsyncCollection<CompositePKChild>;
	readonly implicitChildren: AsyncCollection<ImplicitChild>;
	readonly strangeChildren: AsyncCollection<StrangeExplicitChild>;
	readonly childrenSansBelongsTo: AsyncCollection<ChildSansBelongsTo>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<CompositePKParent>);
	static copyOf(
		source: CompositePKParent,
		mutator: (
			draft: MutableModel<CompositePKParent>
		) => MutableModel<CompositePKParent> | void
	): CompositePKParent;
}

export declare class CompositePKChild {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<CompositePKChild, ['childId', 'content']>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly childId: string;
	readonly content: string;
	readonly parent: Promise<CompositePKParent | undefined>;
	readonly parentId?: string | null;
	readonly parentTitle?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<CompositePKChild>);
	static copyOf(
		source: CompositePKChild,
		mutator: (
			draft: MutableModel<CompositePKChild>
		) => MutableModel<CompositePKChild> | void
	): CompositePKChild;
}

export declare class ImplicitChild {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<ImplicitChild, ['childId', 'content']>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly childId: string;
	readonly content: string;
	readonly parent: Promise<CompositePKParent>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	readonly compositePKParentImplicitChildrenCustomId?: string | null;
	readonly compositePKParentImplicitChildrenContent?: string | null;
	constructor(init: ModelInit<ImplicitChild>);
	static copyOf(
		source: ImplicitChild,
		mutator: (
			draft: MutableModel<ImplicitChild>
		) => MutableModel<ImplicitChild> | void
	): ImplicitChild;
}

export declare class StrangeExplicitChild {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<
			StrangeExplicitChild,
			['strangeId', 'content']
		>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly strangeId: string;
	readonly content: string;
	readonly parent: Promise<CompositePKParent>;
	readonly strangeParentId?: string | null;
	readonly strangeParentTitle?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<StrangeExplicitChild>);
	static copyOf(
		source: StrangeExplicitChild,
		mutator: (
			draft: MutableModel<StrangeExplicitChild>
		) => MutableModel<StrangeExplicitChild> | void
	): StrangeExplicitChild;
}

export declare class ChildSansBelongsTo {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<ChildSansBelongsTo, ['childId', 'content']>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly childId: string;
	readonly content: string;
	readonly compositePKParentChildrenSansBelongsToCustomId: string;
	readonly compositePKParentChildrenSansBelongsToContent?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<ChildSansBelongsTo>);
	static copyOf(
		source: ChildSansBelongsTo,
		mutator: (
			draft: MutableModel<ChildSansBelongsTo>
		) => MutableModel<ChildSansBelongsTo> | void
	): ChildSansBelongsTo;
}

export function testSchema(): Schema {
	return {
		enums: {},
		models: {
			Model: {
				name: 'Model',
				pluralName: 'Models',
				syncable: true,
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
					},
					field1: {
						name: 'field1',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
					optionalField1: {
						name: 'optionalField1',
						isArray: false,
						type: 'String',
						isRequired: false,
					},
					dateCreated: {
						name: 'dateCreated',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
					emails: {
						name: 'emails',
						isArray: true,
						type: 'AWSEmail',
						isRequired: true,
						attributes: [],
						isArrayNullable: true,
					},
					ips: {
						name: 'ips',
						isArray: true,
						type: 'AWSIPAddress',
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
					},
					metadata: {
						name: 'metadata',
						isArray: false,
						type: {
							nonModel: 'Metadata',
						},
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
			},
			Post: {
				name: 'Post',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					comments: {
						name: 'comments',
						isArray: true,
						type: {
							model: 'Comment',
						},
						isRequired: true,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['post'],
						},
					},
				},
				syncable: true,
				pluralName: 'Posts',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			Comment: {
				name: 'Comment',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					postId: {
						name: 'postId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					post: {
						name: 'post',
						isArray: false,
						type: {
							model: 'Post',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: ['postId'],
						},
					},
				},
				syncable: true,
				pluralName: 'Comments',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							name: 'byPost',
							fields: ['postId'],
						},
					},
				],
			},
			LocalModel: {
				name: 'LocalModel',
				pluralName: 'LocalModels',
				syncable: false,
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
					},
					field1: {
						name: 'field1',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
				},
			},
			User: {
				name: 'User',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					name: {
						name: 'name',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					profileID: {
						name: 'profileID',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					profile: {
						name: 'profile',
						isArray: false,
						type: {
							model: 'Profile',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'HAS_ONE',
							associatedWith: ['id'],
							targetNames: ['profileID'],
						},
					},
				},
				syncable: true,
				pluralName: 'Users',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			Profile: {
				name: 'Profile',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					firstName: {
						name: 'firstName',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					lastName: {
						name: 'lastName',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Profiles',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			PostComposite: {
				name: 'PostComposite',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					description: {
						name: 'description',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					created: {
						name: 'created',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					sort: {
						name: 'sort',
						isArray: false,
						type: 'Int',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'PostComposites',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							name: 'titleCreatedSort',
							fields: ['title', 'created', 'sort'],
						},
					},
				],
			},
			PostCustomPK: {
				name: 'PostCustomPK',
				fields: {
					postId: {
						name: 'postId',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					description: {
						name: 'description',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					emails: {
						name: 'emails',
						isArray: true,
						type: 'AWSEmail',
						isRequired: true,
						attributes: [],
						isArrayNullable: true,
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					dateCreated: {
						name: 'dateCreated',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'PostCustomPKS',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['postId'],
						},
					},
				],
			},
			PostCustomPKSort: {
				name: 'PostCustomPKSort',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					postId: {
						name: 'postId',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					description: {
						name: 'description',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'PostCustomPKSorts',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id', 'postId'],
						},
					},
				],
			},
			PostCustomPKComposite: {
				name: 'PostCustomPKComposite',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					postId: {
						name: 'postId',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					description: {
						name: 'description',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					sort: {
						name: 'sort',
						isArray: false,
						type: 'Int',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'PostCustomPKComposites',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id', 'postId', 'sort'],
						},
					},
				],
			},

			BasicModel: {
				name: 'BasicModel',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					body: {
						name: 'body',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'BasicModels',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			HasOneParent: {
				name: 'HasOneParent',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					child: {
						name: 'child',
						isArray: false,
						type: {
							model: 'HasOneChild',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'HAS_ONE',
							associatedWith: ['id'],
							targetNames: ['hasOneParentChildId'],
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					hasOneParentChildId: {
						name: 'hasOneParentChildId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'HasOneParents',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			HasOneChild: {
				name: 'HasOneChild',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'HasOneChildren',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			DefaultPKParent: {
				name: 'DefaultPKParent',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					children: {
						name: 'children',
						isArray: true,
						type: {
							model: 'DefaultPKChild',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['defaultPKParentChildrenId'],
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'DefaultPKParents',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			DefaultPKChild: {
				name: 'DefaultPKChild',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					parent: {
						name: 'parent',
						isArray: false,
						type: {
							model: 'DefaultPKParent',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: ['defaultPKParentChildrenId'],
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					defaultPKParentChildrenId: {
						name: 'defaultPKParentChildrenId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'DefaultPKChildren',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			CompositePKParent: {
				name: 'CompositePKParent',
				fields: {
					customId: {
						name: 'customId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					children: {
						name: 'children',
						isArray: true,
						type: {
							model: 'CompositePKChild',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['parent'],
						},
					},
					implicitChildren: {
						name: 'implicitChildren',
						isArray: true,
						type: {
							model: 'ImplicitChild',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: [
								'compositePKParentImplicitChildrenCustomId',
								'compositePKParentImplicitChildrenContent',
							],
						},
					},
					strangeChildren: {
						name: 'strangeChildren',
						isArray: true,
						type: {
							model: 'StrangeExplicitChild',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['parent'],
						},
					},
					childrenSansBelongsTo: {
						name: 'childrenSansBelongsTo',
						isArray: true,
						type: {
							model: 'ChildSansBelongsTo',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: [
								'compositePKParentChildrenSansBelongsToCustomId',
								'compositePKParentChildrenSansBelongsToContent',
							],
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'CompositePKParents',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['customId', 'content'],
						},
					},
				],
			},
			CompositePKChild: {
				name: 'CompositePKChild',
				fields: {
					childId: {
						name: 'childId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					parent: {
						name: 'parent',
						isArray: false,
						type: {
							model: 'CompositePKParent',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: ['parentId', 'parentTitle'],
						},
					},
					parentId: {
						name: 'parentId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					parentTitle: {
						name: 'parentTitle',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'CompositePKChildren',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['childId', 'content'],
						},
					},
					{
						type: 'key',
						properties: {
							name: 'byParent',
							fields: ['parentId', 'parentTitle'],
						},
					},
				],
			},
			ImplicitChild: {
				name: 'ImplicitChild',
				fields: {
					childId: {
						name: 'childId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					parent: {
						name: 'parent',
						isArray: false,
						type: {
							model: 'CompositePKParent',
						},
						isRequired: true,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: [
								'compositePKParentImplicitChildrenCustomId',
								'compositePKParentImplicitChildrenContent',
							],
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					compositePKParentImplicitChildrenCustomId: {
						name: 'compositePKParentImplicitChildrenCustomId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					compositePKParentImplicitChildrenContent: {
						name: 'compositePKParentImplicitChildrenContent',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'ImplicitChildren',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['childId', 'content'],
						},
					},
				],
			},
			StrangeExplicitChild: {
				name: 'StrangeExplicitChild',
				fields: {
					strangeId: {
						name: 'strangeId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					parent: {
						name: 'parent',
						isArray: false,
						type: {
							model: 'CompositePKParent',
						},
						isRequired: true,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: ['strangeParentId', 'strangeParentTitle'],
						},
					},
					strangeParentId: {
						name: 'strangeParentId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					strangeParentTitle: {
						name: 'strangeParentTitle',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'StrangeExplicitChildren',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['strangeId', 'content'],
						},
					},
					{
						type: 'key',
						properties: {
							name: 'byCompositePKParentX',
							fields: ['strangeParentId', 'strangeParentTitle'],
						},
					},
				],
			},
			ChildSansBelongsTo: {
				name: 'ChildSansBelongsTo',
				fields: {
					childId: {
						name: 'childId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					compositePKParentChildrenSansBelongsToCustomId: {
						name: 'compositePKParentChildrenSansBelongsToCustomId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					compositePKParentChildrenSansBelongsToContent: {
						name: 'compositePKParentChildrenSansBelongsToContent',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'ChildSansBelongsTos',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['childId', 'content'],
						},
					},
					{
						type: 'key',
						properties: {
							name: 'byParent',
							fields: [
								'compositePKParentChildrenSansBelongsToCustomId',
								'compositePKParentChildrenSansBelongsToContent',
							],
						},
					},
				],
			},
		},
		nonModels: {
			Metadata: {
				name: 'Metadata',
				fields: {
					author: {
						name: 'author',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					tags: {
						name: 'tags',
						isArray: true,
						type: 'String',
						isRequired: false,
						isArrayNullable: true,
						attributes: [],
					},
					rewards: {
						name: 'rewards',
						isArray: true,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					penNames: {
						name: 'penNames',
						isArray: true,
						type: 'String',
						isRequired: true,
						isArrayNullable: true,
						attributes: [],
					},
					nominations: {
						name: 'nominations',
						isArray: true,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					misc: {
						name: 'misc',
						isArray: true,
						type: 'String',
						isRequired: false,
						isArrayNullable: true,
						attributes: [],
					},
				},
			},
		},
		version: '1',
		pragma: '3.2.0',
	};
}

export function internalTestSchema(): InternalSchema {
	return {
		namespaces: {
			datastore: {
				name: 'datastore',
				relationships: {
					Setting: {
						indexes: [],
						relationTypes: [],
					},
				},
				enums: {},
				nonModels: {},
				models: {
					Setting: {
						name: 'Setting',
						pluralName: 'Settings',
						syncable: false,
						fields: {
							id: {
								name: 'id',
								type: 'ID',
								isRequired: true,
								isArray: false,
							},
							key: {
								name: 'key',
								type: 'String',
								isRequired: true,
								isArray: false,
							},
							value: {
								name: 'value',
								type: 'String',
								isRequired: true,
								isArray: false,
							},
						},
					},
				},
			},
			user: {
				name: 'user',
				enums: {},
				models: {
					Model: {
						name: 'Model',
						pluralName: 'Models',
						syncable: true,
						fields: {
							id: {
								name: 'id',
								isArray: false,
								type: 'ID',
								isRequired: true,
							},
							field1: {
								name: 'field1',
								isArray: false,
								type: 'String',
								isRequired: true,
							},
							optionalField1: {
								name: 'optionalField1',
								isArray: false,
								type: 'String',
								isRequired: false,
							},
							dateCreated: {
								name: 'dateCreated',
								isArray: false,
								type: 'AWSDateTime',
								isRequired: true,
								attributes: [],
							},
							emails: {
								name: 'emails',
								isArray: true,
								type: 'AWSEmail',
								isRequired: true,
								attributes: [],
								isArrayNullable: true,
							},
							ips: {
								name: 'ips',
								isArray: true,
								type: 'AWSIPAddress',
								isRequired: false,
								attributes: [],
								isArrayNullable: true,
							},
							metadata: {
								name: 'metadata',
								isArray: false,
								type: {
									nonModel: 'Metadata',
								},
								isRequired: false,
								attributes: [],
							},
						},
					},
					LocalModel: {
						name: 'LocalModel',
						pluralName: 'LocalModels',
						syncable: false,
						fields: {
							id: {
								name: 'id',
								isArray: false,
								type: 'ID',
								isRequired: true,
							},
							field1: {
								name: 'field1',
								isArray: false,
								type: 'String',
								isRequired: true,
							},
						},
					},
				},
				nonModels: {
					Metadata: {
						name: 'Metadata',
						fields: {
							author: {
								name: 'author',
								isArray: false,
								type: 'String',
								isRequired: true,
								attributes: [],
							},
							tags: {
								name: 'tags',
								isArray: true,
								type: 'String',
								isRequired: false,
								isArrayNullable: true,
								attributes: [],
							},
							rewards: {
								name: 'rewards',
								isArray: true,
								type: 'String',
								isRequired: true,
								attributes: [],
							},
							penNames: {
								name: 'penNames',
								isArray: true,
								type: 'String',
								isRequired: true,
								isArrayNullable: true,
								attributes: [],
							},
							nominations: {
								name: 'nominations',
								isArray: true,
								type: 'String',
								isRequired: false,
								attributes: [],
							},
							misc: {
								name: 'misc',
								isArray: true,
								type: 'String',
								isRequired: false,
								isArrayNullable: true,
								attributes: [],
							},
						},
					},
				},
				relationships: {
					Model: {
						indexes: [],
						relationTypes: [],
					},
					LocalModel: {
						indexes: [],
						relationTypes: [],
					},
				},
			},
			sync: {
				name: 'sync',
				relationships: {
					MutationEvent: {
						indexes: [],
						relationTypes: [],
					},
					ModelMetadata: {
						indexes: [],
						relationTypes: [],
					},
				},
				enums: {
					OperationType: {
						name: 'OperationType',
						values: ['CREATE', 'UPDATE', 'DELETE'],
					},
				},
				nonModels: {},
				models: {
					MutationEvent: {
						name: 'MutationEvent',
						pluralName: 'MutationEvents',
						syncable: false,
						fields: {
							id: {
								name: 'id',
								type: 'ID',
								isRequired: true,
								isArray: false,
							},
							model: {
								name: 'model',
								type: 'String',
								isRequired: true,
								isArray: false,
							},
							data: {
								name: 'data',
								type: 'String',
								isRequired: true,
								isArray: false,
							},
							modelId: {
								name: 'modelId',
								type: 'String',
								isRequired: true,
								isArray: false,
							},
							operation: {
								name: 'operation',
								type: {
									enum: 'Operationtype',
								},
								isArray: false,
								isRequired: true,
							},
							condition: {
								name: 'condition',
								type: 'String',
								isArray: false,
								isRequired: true,
							},
						},
					},
					ModelMetadata: {
						name: 'ModelMetadata',
						pluralName: 'ModelsMetadata',
						syncable: false,
						fields: {
							id: {
								name: 'id',
								type: 'ID',
								isRequired: true,
								isArray: false,
							},
							namespace: {
								name: 'namespace',
								type: 'String',
								isRequired: true,
								isArray: false,
							},
							model: {
								name: 'model',
								type: 'String',
								isRequired: true,
								isArray: false,
							},
							lastSync: {
								name: 'lastSync',
								type: 'Int',
								isRequired: false,
								isArray: false,
							},
							lastFullSync: {
								name: 'lastFullSync',
								type: 'Int',
								isRequired: false,
								isArray: false,
							},
							fullSyncInterval: {
								name: 'fullSyncInterval',
								type: 'Int',
								isRequired: true,
								isArray: false,
							},
						},
					},
				},
			},
		},
		version: '1',
		pragma: '3.2.0',
	};
}

export function smallTestSchema(): Schema {
	const schema = testSchema();
	return {
		...schema,
		models: {
			Model: schema.models.Model,
		},
	};
}

// #endregion schemas

//#region Types

//#region Legacy

export type LegacyCustomROMETA = {
	readOnlyFields: 'createdOn' | 'updatedOn';
};

export class LegacyCustomRO {
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(init: ModelInit<LegacyCustomRO, LegacyCustomROMETA>) {}
	static copyOf(
		source: LegacyCustomRO,
		mutator: (
			draft: MutableModel<LegacyCustomRO, LegacyCustomROMETA>
		) => MutableModel<LegacyCustomRO, LegacyCustomROMETA> | void
	): LegacyCustomRO {
		return <LegacyCustomRO>(<unknown>undefined);
	}
}

export type LegacyDefaultROMETA = {
	readOnlyFields: 'createdAt' | 'updatedAt';
};

export class LegacyDefaultRO {
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<LegacyDefaultRO, LegacyDefaultROMETA>) {}
	static copyOf(
		source: LegacyDefaultRO,
		mutator: (
			draft: MutableModel<LegacyDefaultRO, LegacyDefaultROMETA>
		) => MutableModel<LegacyDefaultRO, LegacyDefaultROMETA> | void
	): LegacyDefaultRO {
		return <LegacyDefaultRO>(<unknown>undefined);
	}
}

export class LegacyNoMetadata {
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<LegacyNoMetadata>) {}
	static copyOf(
		source: LegacyNoMetadata,
		mutator: (
			draft: MutableModel<LegacyNoMetadata>
		) => MutableModel<LegacyNoMetadata> | void
	): LegacyNoMetadata {
		return <LegacyNoMetadata>(<unknown>undefined);
	}
}

//#endregion

//#region Managed

export class ManagedCustomRO {
	readonly [__modelMeta__]: {
		identifier: ManagedIdentifier<ManagedCustomRO, 'id'>;
		readOnlyFields: 'createdOn' | 'updatedOn';
	};
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(init: ModelInit<ManagedCustomRO>) {}
	static copyOf(
		source: ManagedCustomRO,
		mutator: (
			draft: MutableModel<ManagedCustomRO>
		) => MutableModel<ManagedCustomRO> | void
	): ManagedCustomRO {
		return <ManagedCustomRO>(<unknown>undefined);
	}
}

export class ManagedDefaultRO {
	readonly [__modelMeta__]: {
		identifier: ManagedIdentifier<ManagedDefaultRO, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<ManagedDefaultRO>) {}
	static copyOf(
		source: ManagedDefaultRO,
		mutator: (
			draft: MutableModel<ManagedDefaultRO>
		) => MutableModel<ManagedDefaultRO> | void
	): ManagedDefaultRO {
		return <ManagedDefaultRO>(<unknown>undefined);
	}
}

//#endregion

//#region Optionally Managed

export class OptionallyManagedCustomRO {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<OptionallyManagedCustomRO, 'id'>;
		readOnlyFields: 'createdOn' | 'updatedOn';
	};
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(init: ModelInit<OptionallyManagedCustomRO>) {}
	static copyOf(
		source: OptionallyManagedCustomRO,
		mutator: (
			draft: MutableModel<OptionallyManagedCustomRO>
		) => MutableModel<OptionallyManagedCustomRO> | void
	): OptionallyManagedCustomRO {
		return <OptionallyManagedCustomRO>(<unknown>undefined);
	}
}

export class OptionallyManagedDefaultRO {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<OptionallyManagedDefaultRO, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<OptionallyManagedDefaultRO>) {}
	static copyOf(
		source: OptionallyManagedDefaultRO,
		mutator: (
			draft: MutableModel<OptionallyManagedDefaultRO>
		) => MutableModel<OptionallyManagedDefaultRO> | void
	): OptionallyManagedDefaultRO {
		return <OptionallyManagedDefaultRO>(<unknown>undefined);
	}
}

//#endregion

//#region Composite

export class CompositeCustomRO {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<CompositeCustomRO, ['tenant', 'dob']>;
		readOnlyFields: 'createdOn' | 'updatedOn';
	};
	readonly tenant: string;
	readonly dob: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(init: ModelInit<CompositeCustomRO>) {}
	static copyOf(
		source: CompositeCustomRO,
		mutator: (
			draft: MutableModel<CompositeCustomRO>
		) => MutableModel<CompositeCustomRO> | void
	): CompositeCustomRO {
		return <CompositeCustomRO>(<unknown>undefined);
	}
}

export class CompositeDefaultRO {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<CompositeDefaultRO, ['tenant', 'dob']>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly tenant: string;
	readonly dob: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<CompositeDefaultRO>) {}
	static copyOf(
		source: CompositeDefaultRO,
		mutator: (
			draft: MutableModel<CompositeDefaultRO>
		) => MutableModel<CompositeDefaultRO> | void
	): CompositeDefaultRO {
		return <CompositeDefaultRO>(<unknown>undefined);
	}
}

//#endregion

//#region Custom

export class CustomIdentifierCustomRO {
	readonly [__modelMeta__]: {
		identifier: CustomIdentifier<CustomIdentifierCustomRO, 'myId'>;
		readOnlyFields: 'createdOn' | 'updatedOn';
	};
	readonly myId: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn: string;
	readonly updatedOn: string;
	constructor(init: ModelInit<CustomIdentifierCustomRO>) {}
	static copyOf(
		source: CustomIdentifierCustomRO,
		mutator: (
			draft: MutableModel<CustomIdentifierCustomRO>
		) => MutableModel<CustomIdentifierCustomRO> | void
	): CustomIdentifierCustomRO {
		return <CustomIdentifierCustomRO>(<unknown>undefined);
	}
}

export class CustomIdentifierDefaultRO {
	readonly [__modelMeta__]: {
		identifier: CustomIdentifier<CustomIdentifierDefaultRO, 'myId'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly myId: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<CustomIdentifierDefaultRO>) {}
	static copyOf(
		source: CustomIdentifierDefaultRO,
		mutator: (
			draft: MutableModel<CustomIdentifierDefaultRO>
		) => MutableModel<CustomIdentifierDefaultRO> | void
	): CustomIdentifierDefaultRO {
		return <CustomIdentifierDefaultRO>(<unknown>undefined);
	}
}

export class CustomIdentifierNoRO {
	readonly [__modelMeta__]: {
		identifier: CustomIdentifier<CustomIdentifierNoRO, 'myId'>;
	};
	readonly myId: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<CustomIdentifierNoRO>) {}
	static copyOf(
		source: CustomIdentifierNoRO,
		mutator: (
			draft: MutableModel<CustomIdentifierNoRO>
		) => MutableModel<CustomIdentifierNoRO> | void
	): CustomIdentifierDefaultRO {
		return undefined!;
	}
}

//#endregion

//#endregion
