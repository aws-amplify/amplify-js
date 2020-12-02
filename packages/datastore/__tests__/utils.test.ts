import { SchemaModel, SchemaNamespace } from '../src/types';
import { generateSelectionSet } from '../src/sync/utils';

describe('DataStore - utils', () => {
	describe('generateSelectionSet', () => {
		test('implicit owner', () => {
			const namespace: SchemaNamespace = {
				name: 'user',
				models: {
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
						},
						syncable: true,
						pluralName: 'Posts',
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
					},
				},
				enums: {},
				nonModels: {},
				relationships: {
					Post: {
						indexes: [],
						relationTypes: [],
					},
				},
			};
			const modelDefinition: SchemaModel = {
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
				},
				syncable: true,
				pluralName: 'Posts',
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
			};

			const selectionSet = `id
title
owner
_version
_lastChangedAt
_deleted`;

			expect(generateSelectionSet(namespace, modelDefinition)).toEqual(
				selectionSet
			);
		});
		test('explicit owner', () => {
			const namespace: SchemaNamespace = {
				name: 'user',
				models: {
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
							owner: {
								name: 'owner',
								isArray: false,
								type: 'String',
								isRequired: false,
								attributes: [],
							},
						},
						syncable: true,
						pluralName: 'Posts',
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
					},
				},
				enums: {},
				nonModels: {},
				relationships: {
					Post: {
						indexes: [],
						relationTypes: [],
					},
				},
			};
			const modelDefinition: SchemaModel = {
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
					owner: {
						name: 'owner',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Posts',
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
			};

			const selectionSet = `id
title
owner
_version
_lastChangedAt
_deleted`;

			expect(generateSelectionSet(namespace, modelDefinition)).toEqual(
				selectionSet
			);
		});
		test('explicit custom owner', () => {
			const namespace: SchemaNamespace = {
				name: 'user',
				models: {
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
							customOwner: {
								name: 'customOwner',
								isArray: false,
								type: 'String',
								isRequired: false,
								attributes: [],
							},
						},
						syncable: true,
						pluralName: 'Posts',
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
											provider: 'userPools',
											ownerField: 'customOwner',
											allow: 'owner',
											identityClaim: 'cognito:username',
											operations: ['create', 'update', 'delete', 'read'],
										},
									],
								},
							},
						],
					},
				},
				enums: {},
				nonModels: {},
				relationships: {
					Post: {
						indexes: [],
						relationTypes: [],
					},
				},
			};
			const modelDefinition: SchemaModel = {
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
					customOwner: {
						name: 'customOwner',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Posts',
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
									provider: 'userPools',
									ownerField: 'customOwner',
									allow: 'owner',
									identityClaim: 'cognito:username',
									operations: ['create', 'update', 'delete', 'read'],
								},
							],
						},
					},
				],
			};

			const selectionSet = `id
title
customOwner
_version
_lastChangedAt
_deleted`;

			expect(generateSelectionSet(namespace, modelDefinition)).toEqual(
				selectionSet
			);
		});
	});
});
