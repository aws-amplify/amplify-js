import {
	ModelInit,
	MutableModel,
	Schema,
	InternalSchema,
	CompositeIdentifier,
	CustomIdentifier,
	__modelMeta__,
} from '../src/types';

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

/**
 * Checks an object for adherence to expected values from a set of matchers.
 * Returns a list of erroneous key-value pairs.
 * @param data the object to validate.
 * @param matchers the matcher functions/values/regexes to test the object with
 */
export function errorsFrom(data, matchers) {
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
				`Property '${property}' value "${value}" does not match "${matcher}"`
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

	constructor(init: ModelInit<Post>);

	static copyOf(
		src: Post,
		mutator: (draft: MutableModel<Post>) => void | Post
	): Post;
}

export declare class Comment {
	public readonly id: string;
	public readonly content: string;
	public readonly post: Post;

	constructor(init: ModelInit<Comment>);

	static copyOf(
		src: Comment,
		mutator: (draft: MutableModel<Comment>) => void | Comment
	): Comment;
}

export declare class User {
	public readonly id: string;
	public readonly name: string;
	public readonly profile?: Profile;
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
							associatedWith: 'postId',
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
							targetName: 'postId',
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
							associatedWith: 'id',
							targetName: 'profileID',
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
