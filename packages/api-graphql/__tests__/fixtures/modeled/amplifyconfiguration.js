/**
 * Generated from `./schema.ts` by samsara
 *
 * 1. cognito config omitted
 * 1.
 */
const amplifyConfig = {
	aws_appsync_graphqlEndpoint: 'https://0.0.0.0/modeled/graphql',
	aws_appsync_region: 'us-west-1',
	aws_appsync_authenticationType: 'API_KEY',
	aws_appsync_apiKey: 'some-api-key',
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
			ThingWithCustomerOwnerField: {
				name: 'ThingWithCustomerOwnerField',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					customField: {
						name: 'customField',
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
				pluralName: 'ThingWithCustomerOwnerFields',
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
					{
						type: 'auth',
						properties: {
							rules: [
								{
									provider: 'userPools',
									ownerField: 'customField',
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
			ThingWithOwnerFieldSpecifiedInModel: {
				name: 'ThingWithOwnerFieldSpecifiedInModel',
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
					owner: {
						name: 'owner',
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
				pluralName: 'ThingWithOwnerFieldSpecifiedInModels',
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
					{
						type: 'auth',
						properties: {
							rules: [
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
			ThingWithAPIKeyAuth: {
				name: 'ThingWithAPIKeyAuth',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
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
				pluralName: 'ThingWithAPIKeyAuths',
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
					{
						type: 'auth',
						properties: {
							rules: [
								{
									allow: 'public',
									provider: 'apiKey',
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
			ThingWithoutExplicitAuth: {
				name: 'ThingWithoutExplicitAuth',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
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
				pluralName: 'ThingWithoutExplicitAuths',
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
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
		},
		enums: {},
		nonModels: {},
	},
};
export default amplifyConfig;
