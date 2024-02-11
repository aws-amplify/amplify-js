import { SchemaModel } from '@aws-amplify/core/internals/utils';

export const userSchemaModel: SchemaModel = {
	name: 'User',
	fields: {
		userId: {
			name: 'userId',
			isArray: false,
			type: 'ID',
			isRequired: true,
			attributes: [],
		},
		name: {
			name: 'name',
			isArray: false,
			type: 'String',
			isRequired: true,
			attributes: [],
		},
		createdTodos: {
			name: 'createdTodos',
			isArray: true,
			type: {
				model: 'Todo',
			},
			isRequired: false,
			attributes: [],
			isArrayNullable: true,
			association: {
				connectionType: 'HAS_MANY' as any,
				associatedWith: ['userCreatedTodosUserId'],
			},
		},
		assignedTodos: {
			name: 'assignedTodos',
			isArray: true,
			type: {
				model: 'Todo',
			},
			isRequired: false,
			attributes: [],
			isArrayNullable: true,
			association: {
				connectionType: 'HAS_MANY' as any,
				associatedWith: ['userAssignedTodosUserId'],
			},
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
			isRequired: true,
			attributes: [],
		},
		updatedAt: {
			name: 'updatedAt',
			isArray: false,
			type: 'AWSDateTime',
			isRequired: true,
			attributes: [],
		},
	},
	syncable: true,
	pluralName: 'Users',
	attributes: [
		{
			type: 'model',
			properties: {},
		},
		{
			type: 'key',
			properties: {
				fields: ['userId'],
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
					{
						allow: 'public',
						operations: ['read'],
					},
				],
			},
		},
	],
	primaryKeyInfo: {
		isCustomPrimaryKey: true,
		primaryKeyFieldName: 'userId',
		sortKeyFieldNames: [],
	},
};

export const productSchemaModel: SchemaModel = {
	name: 'Product',
	fields: {
		sku: {
			name: 'sku',
			isArray: false,
			type: 'String',
			isRequired: true,
			attributes: [],
		},
		factoryId: {
			name: 'factoryId',
			isArray: false,
			type: 'String',
			isRequired: true,
			attributes: [],
		},
		warehouseId: {
			name: 'warehouseId',
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
			isRequired: true,
			attributes: [],
		},
		updatedAt: {
			name: 'updatedAt',
			isArray: false,
			type: 'AWSDateTime',
			isRequired: true,
			attributes: [],
		},
	},
	syncable: true,
	pluralName: 'Products',
	attributes: [
		{
			type: 'model',
			properties: {},
		},
		{
			type: 'key',
			properties: {
				fields: ['sku', 'factoryId', 'warehouseId'],
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
					{
						allow: 'public',
						operations: ['read'],
					},
				],
			},
		},
	],
	primaryKeyInfo: {
		isCustomPrimaryKey: true,
		primaryKeyFieldName: 'sku',
		sortKeyFieldNames: ['factoryId', 'warehouseId'],
	},
};
