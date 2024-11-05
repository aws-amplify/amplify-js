import sqlite3 from 'sqlite3';
sqlite3.verbose();
import {
	ModelInit,
	MutableModel,
	Schema,
	InternalSchema,
} from '@aws-amplify/datastore';

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
		mutator: (draft: MutableModel<Model>) => void | Model,
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
}

export declare class Comment {
	public readonly id: string;
	public readonly content: string;
	public readonly post: Post;
}

export declare class User {
	public readonly id: string;
	public readonly name: string;
	public readonly profileID: string;
}
export declare class Profile {
	public readonly id: string;
	public readonly firstName: string;
	public readonly lastName: string;
}

export declare class PostComposite {
	public readonly id: string;
	public readonly title: string;
	public readonly description: string;
	public readonly created: string;
	public readonly sort: number;
}

export declare class PostCustomPK {
	public readonly id: string;
	public readonly postId: number;
	public readonly title: string;
	public readonly description?: string;
}

export declare class PostCustomPKSort {
	public readonly id: string;
	public readonly postId: number;
	public readonly title: string;
	public readonly description?: string;
}
export declare class PostCustomPKComposite {
	public readonly id: string;
	public readonly postId: number;
	public readonly title: string;
	public readonly description?: string;
	public readonly sort: number;
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
						type: 'Int',
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
						type: 'Int',
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
						type: 'Int',
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
		codegenVersion: '3.2.0',
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
		codegenVersion: '3.2.0',
	};
}

/**
 * A lower-level SQLite wrapper to test SQLiteAdapter against.
 * It's intended to be fast, using an in-memory database.
 */
export class InnerSQLiteDatabase {
	private innerDB;
	public sqlog;

	constructor() {
		this.innerDB = new sqlite3.Database(':memory:');
		this.sqlog = [];
	}

	async executeSql(
		statement,
		params: any[] = [],
		callback: ((...args) => Promise<any>) | undefined = undefined,
		logger = undefined,
	) {
		this.sqlog.push(`${statement}; ${JSON.stringify(params)}`);
		if (statement.trim().toLowerCase().startsWith('select')) {
			return new Promise(async resolve => {
				const rows: any[] = [];
				const resultSet = {
					rows: {
						get length() {
							return rows.length;
						},
						raw: () => rows,
					},
				};

				await this.innerDB.each(
					statement,
					params,
					async (err, row) => {
						if (err) {
							console.error('SQLite ERROR', new Error(err));
							console.warn(statement, params);
						}
						rows.push(row);
					},
					() => {
						resolve([resultSet]);
					},
				);

				if (typeof callback === 'function') await callback(this, resultSet);
			});
		} else {
			return await this.innerDB.run(statement, params, err => {
				if (typeof callback === 'function') {
					callback(err);
				} else if (err) {
					console.error('calback', err);
					throw err;
				}
			});
		}
	}

	async transaction(fn) {
		return this.innerDB.serialize(await fn(this));
	}

	async readTransaction(fn) {
		return this.innerDB.serialize(await fn(this));
	}

	async close() {}
}
