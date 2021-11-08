import {
	AuthModeStrategy,
	InternalSchema,
	SchemaModel,
	SchemaNamespace,
} from '../src/types';
import { generateSelectionSet, getModelAuthModes } from '../src/sync/utils';
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { SubscriptionBuffer } from '../src/util';

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

	describe('getModel', () => {
		test('handles an array of auth modes', async () => {
			const authModeStrategy: AuthModeStrategy = () => [
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
			];

			const authModes = await getModelAuthModes({
				authModeStrategy,
				defaultAuthMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				modelName: 'Post',
				schema: {} as InternalSchema, // schema is only passed directly to the authModeStrategy
			});

			const expectedAuthModes = {
				CREATE: ['AMAZON_COGNITO_USER_POOLS'],
				READ: ['AMAZON_COGNITO_USER_POOLS'],
				UPDATE: ['AMAZON_COGNITO_USER_POOLS'],
				DELETE: ['AMAZON_COGNITO_USER_POOLS'],
			};

			expect(authModes).toEqual(expectedAuthModes);
		});

		test('handles a string auth mode', async () => {
			const authModeStrategy: AuthModeStrategy = () =>
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS;

			const authModes = await getModelAuthModes({
				authModeStrategy,
				defaultAuthMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				modelName: 'Post',
				schema: {} as InternalSchema,
			});

			const expectedAuthModes = {
				CREATE: ['AMAZON_COGNITO_USER_POOLS'],
				READ: ['AMAZON_COGNITO_USER_POOLS'],
				UPDATE: ['AMAZON_COGNITO_USER_POOLS'],
				DELETE: ['AMAZON_COGNITO_USER_POOLS'],
			};

			expect(authModes).toEqual(expectedAuthModes);
		});

		test('falls back to default auth mode', async () => {
			const expectedAuthModes = {
				CREATE: ['AMAZON_COGNITO_USER_POOLS'],
				READ: ['AMAZON_COGNITO_USER_POOLS'],
				UPDATE: ['AMAZON_COGNITO_USER_POOLS'],
				DELETE: ['AMAZON_COGNITO_USER_POOLS'],
			};

			// using blocks in order to be able to re-use the same const-declared variables below
			{
				const authModeStrategy: AuthModeStrategy = () => null;

				const authModes = await getModelAuthModes({
					authModeStrategy,
					defaultAuthMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
					modelName: 'Post',
					schema: {} as InternalSchema,
				});

				expect(authModes).toEqual(expectedAuthModes);
			}

			{
				const authModeStrategy: AuthModeStrategy = () => undefined;

				const authModes = await getModelAuthModes({
					authModeStrategy,
					defaultAuthMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
					modelName: 'Post',
					schema: {} as InternalSchema,
				});

				expect(authModes).toEqual(expectedAuthModes);
			}

			{
				const authModeStrategy: AuthModeStrategy = () => [];

				const authModes = await getModelAuthModes({
					authModeStrategy,
					defaultAuthMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
					modelName: 'Post',
					schema: {} as InternalSchema,
				});

				expect(authModes).toEqual(expectedAuthModes);
			}
		});
	});

	describe('subscription buffer utility class', () => {
		test('happy path', async done => {
			const bufferCallback = () => {
				try {
					done();
				} catch (error) {
					done(error);
				}
			};
			const buffer = new SubscriptionBuffer({
				maxInterval: 2000,
				callback: bufferCallback,
			});

			expect(buffer.getIsRaceInFlight()).toBe(false);

			const proto = Object.getPrototypeOf(buffer);
			const spyOnRace = jest.spyOn(proto, 'racePromises');

			buffer.start();
			expect(buffer.getIsRaceInFlight()).toBe(true);
			expect(spyOnRace).toBeCalledTimes(1);
			buffer.resolveBasePromise();
			buffer.close();
		});

		test('handles errors gracefully', async done => {
			const bufferCallback = () => {
				try {
					done();
				} catch (error) {
					done(error);
				}
			};
			const bufferErrorHandler = jest.fn();
			const buffer = new SubscriptionBuffer({
				maxInterval: 2000,
				callback: bufferCallback,
				errorHandler: bufferErrorHandler,
			});
			const proto = Object.getPrototypeOf(buffer);
			const spyOnTimer = jest.spyOn(proto, 'startTimer');

			// force the Promise to reject
			spyOnTimer.mockImplementationOnce(() => {
				throw new Error();
			});

			buffer.start();
			expect(bufferErrorHandler).toHaveBeenCalledTimes(1);
		});
	});
});
