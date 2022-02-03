import {
	AuthModeStrategy,
	InternalSchema,
	LimitTimerRaceResolvedValues,
	SchemaModel,
	SchemaNamespace,
} from '../src/types';
import { generateSelectionSet, getModelAuthModes } from '../src/sync/utils';
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { DeferredCallbackResolver } from '../src/util';

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

	describe('DeferredCallbackResolver utility class', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		test('happy path - limit wins', async () => {
			expect.assertions(5);
			const limitTimerRaceCallback = jest.fn();

			// casting to any -> in order to access private members
			const limitTimerRace: any = new DeferredCallbackResolver({
				maxInterval: 500,
				callback: limitTimerRaceCallback,
			});

			const spyOnRace = jest.spyOn(limitTimerRace, 'racePromises');

			expect(limitTimerRace.raceInFlight).toBe(false);

			limitTimerRace.start();

			expect(spyOnRace).toBeCalledTimes(1);
			limitTimerRace.resolve();

			const winner = await spyOnRace.mock.results[0].value;
			expect(winner).toEqual(LimitTimerRaceResolvedValues.LIMIT);

			expect(limitTimerRace.raceInFlight).toBe(false);
			expect(limitTimerRaceCallback).toBeCalledTimes(1);

			limitTimerRace.clear();
		});

		test('happy path - timer wins', async () => {
			expect.assertions(5);
			const limitTimerRaceCallback = jest.fn();

			// casting to any -> in order to access private members
			const limitTimerRace: any = new DeferredCallbackResolver({
				maxInterval: 500,
				callback: limitTimerRaceCallback,
			});

			const spyOnRace = jest.spyOn(limitTimerRace, 'racePromises');

			expect(limitTimerRace.raceInFlight).toBe(false);

			limitTimerRace.start();

			expect(spyOnRace).toBeCalledTimes(1);

			const winner = await spyOnRace.mock.results[0].value;
			expect(winner).toEqual(LimitTimerRaceResolvedValues.TIMER);

			expect(limitTimerRace.raceInFlight).toBe(false);
			expect(limitTimerRaceCallback).toBeCalledTimes(1);

			limitTimerRace.clear();
		});

		test('throws default error', async () => {
			expect.assertions(4);
			const limitTimerRaceCallback = jest.fn();

			// casting to any -> in order to access private members
			const limitTimerRace: any = new DeferredCallbackResolver({
				maxInterval: 500,
				callback: limitTimerRaceCallback,
			});

			const spyOnRace = jest.spyOn(limitTimerRace, 'racePromises');
			const spyOnErrorHandler = jest.spyOn(limitTimerRace, 'errorHandler');
			const spyOnTimer = jest.spyOn(limitTimerRace, 'startTimer');
			// force the Promise to reject
			spyOnTimer.mockImplementation(() => {
				throw new Error('customErrorMsg');
			});

			expect(limitTimerRace.raceInFlight).toBe(false);

			limitTimerRace.start();

			expect(spyOnRace).toBeCalledTimes(1);

			expect(spyOnErrorHandler).toThrowError('DeferredCallbackResolver error');

			expect(limitTimerRaceCallback).toBeCalledTimes(0);

			limitTimerRace.clear();
		});

		test('accepts custom error handler and throws custom error', async () => {
			expect.assertions(4);
			const limitTimerRaceCallback = jest.fn();
			const customErrorMsg =
				'something went wrong with the DeferredCallbackResolver';
			const limitTimerRaceErrorHandler = jest.fn(err => {
				throw new Error(customErrorMsg);
			});

			// casting to any -> in order to access private members
			const limitTimerRace: any = new DeferredCallbackResolver({
				maxInterval: 500,
				callback: limitTimerRaceCallback,
				errorHandler: limitTimerRaceErrorHandler,
			});

			const spyOnRace = jest.spyOn(limitTimerRace, 'racePromises');
			const spyOnErrorHandler = jest.spyOn(limitTimerRace, 'errorHandler');
			const spyOnTimer = jest.spyOn(limitTimerRace, 'startTimer');
			// force the 'racePromises' to fail
			spyOnTimer.mockImplementation(() => {
				throw new Error('timer error');
			});

			expect(limitTimerRace.raceInFlight).toBe(false);

			limitTimerRace.start();

			expect(spyOnRace).toBeCalledTimes(1);

			expect(spyOnErrorHandler).toThrowError(customErrorMsg);

			expect(limitTimerRaceCallback).toBeCalledTimes(0);

			limitTimerRace.clear();
		});
	});
});
