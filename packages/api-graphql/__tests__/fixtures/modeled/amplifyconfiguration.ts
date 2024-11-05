/**
 * Generated from `./schema.ts` by amplify-backend generate config.
 *
 * Cognito fields etc. omitted.
 */
const amplifyConfig = {
	aws_project_region: 'us-east-2',
	aws_appsync_graphqlEndpoint: 'https://localhost/graphql',
	aws_appsync_region: 'us-west-1',
	aws_appsync_authenticationType: 'API_KEY',
	aws_appsync_apiKey: 'FAKE-KEY',
	modelIntrospection: {
		version: 1,
		models: {
			Todo: {
				name: 'Todo',
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
					description: {
						name: 'description',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					notes: {
						name: 'notes',
						isArray: true,
						type: {
							model: 'Note',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['todoNotesId'],
						},
					},
					meta: {
						name: 'meta',
						isArray: false,
						type: {
							model: 'TodoMetadata',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'HAS_ONE',
							associatedWith: ['id'],
							targetNames: ['todoMetaId'],
						},
					},
					status: {
						name: 'status',
						isArray: false,
						type: {
							enum: 'Status',
						},
						isRequired: false,
						attributes: [],
					},
					tags: {
						name: 'tags',
						isArray: true,
						type: 'String',
						isRequired: false,
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
					todoMetaId: {
						name: 'todoMetaId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Todos',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'auth',
						properties: {
							rules: [
								{
									allow: 'public',
									provider: 'apiKey',
									operations: ['create', 'update', 'delete', 'read'],
								},
								{
									provider: 'userPools',
									ownerField: 'owner',
									allow: 'owner',
									identityClaim: 'cognito:username',
									operations: ['create', 'update', 'delete', 'read'],
								},
							],
						},
					},
				],
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
			Note: {
				name: 'Note',
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
					todo: {
						name: 'todo',
						isArray: false,
						type: {
							model: 'Todo',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: ['todoNotesId'],
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
					todoNotesId: {
						name: 'todoNotesId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Notes',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'auth',
						properties: {
							rules: [
								{
									allow: 'public',
									provider: 'apiKey',
									operations: ['create', 'update', 'delete', 'read'],
								},
								{
									provider: 'userPools',
									ownerField: 'owner',
									allow: 'owner',
									identityClaim: 'cognito:username',
									operations: ['create', 'update', 'delete', 'read'],
								},
							],
						},
					},
				],
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
			TodoMetadata: {
				name: 'TodoMetadata',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					data: {
						name: 'data',
						isArray: false,
						type: 'AWSJSON',
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
				pluralName: 'TodoMetadata',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'auth',
						properties: {
							rules: [
								{
									allow: 'public',
									provider: 'apiKey',
									operations: ['create', 'update', 'delete', 'read'],
								},
								{
									provider: 'userPools',
									ownerField: 'owner',
									allow: 'owner',
									identityClaim: 'cognito:username',
									operations: ['create', 'update', 'delete', 'read'],
								},
							],
						},
					},
				],
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
		},
		enums: {
			Status: {
				name: 'Status',
				values: ['NOT_STARTED', 'STARTED', 'DONE', 'CANCELED'],
			},
		},
		nonModels: {},
		queries: {},
		mutations: {},
		subscriptions: {},
	},
};
export default amplifyConfig;
