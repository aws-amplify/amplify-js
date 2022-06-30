import Amplify from 'aws-amplify';
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import { CONTROL_MSG as PUBSUB_CONTROL_MSG } from '@aws-amplify/pubsub';
import Observable from 'zen-observable-ts';
import {
	SubscriptionProcessor,
	USER_CREDENTIALS,
} from '../src/sync/processors/subscription';
import {
	internalTestSchema,
	Model as ModelType,
	smallTestSchema,
} from './helpers';
import {
	SchemaModel,
	InternalSchema,
	PersistentModelConstructor,
} from '../src/types';

let mockObservable = new Observable(() => {});

// mock graphql to return a mockable observable
jest.mock('@aws-amplify/api', () => {
	return {
		...jest.requireActual('@aws-amplify/api'),
		graphql: jest.fn(() => mockObservable),
	};
});

describe('sync engine subscription module', () => {
	test('owner authorization', () => {
		const authRules = [
			{
				provider: 'userPools',
				ownerField: 'owner',
				allow: 'owner',
				identityClaim: 'cognito:username',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const authInfo = {
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			isOwner: true,
			ownerField: 'owner',
			ownerValue: 'user1',
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				accessTokenPayload,
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
			)
		).toEqual(authInfo);
	});
	test('owner authorization with only read operation', () => {
		const authRules = [
			{
				provider: 'userPools',
				ownerField: 'owner',
				allow: 'owner',
				identityClaim: 'cognito:username',
				operations: ['read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const authInfo = {
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			isOwner: true,
			ownerField: 'owner',
			ownerValue: 'user1',
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				accessTokenPayload,
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
			)
		).toEqual(authInfo);
	});
	test('owner authorization without read operation', () => {
		const authRules = [
			{
				provider: 'userPools',
				ownerField: 'owner',
				allow: 'owner',
				identityClaim: 'cognito:username',
				operations: ['create', 'update', 'delete'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const authInfo = {
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			isOwner: false,
			ownerField: 'owner',
			ownerValue: 'user1',
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				accessTokenPayload,
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
			)
		).toEqual(authInfo);
	});
	test('owner authorization with public subscription', () => {
		const authRules = [
			{
				provider: 'userPools',
				ownerField: 'owner',
				allow: 'owner',
				identityClaim: 'cognito:username',
				operations: ['create', 'update', 'delete'],
			},
		];

		const modelProperties = {
			subscriptions: {
				level: 'public',
			},
		};

		const model = generateModelWithAuth(authRules, modelProperties);

		const authInfo = {
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			isOwner: false,
			ownerField: 'owner',
			ownerValue: 'user1',
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				accessTokenPayload,
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
			)
		).toEqual(authInfo);
	});
	test('owner authorization with custom owner (explicit)', () => {
		const authRules = [
			{
				provider: 'userPools',
				ownerField: 'customOwner',
				allow: 'owner',
				identityClaim: 'cognito:username',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		// add custom owner field
		model.fields.customOwner = {
			name: 'customOwner',
			isArray: false,
			type: 'String',
			isRequired: false,
			attributes: [],
		};

		const authInfo = {
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			isOwner: true,
			ownerField: 'customOwner',
			ownerValue: 'user1',
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				accessTokenPayload,
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
			)
		).toEqual(authInfo);
	});
	test('owner authorization with auth different than default auth mode', () => {
		const authRules = [
			{
				provider: 'iam',
				allow: 'private',
				operations: ['create', 'update', 'delete', 'read'],
			},
			{
				provider: 'userPools',
				ownerField: 'owner',
				allow: 'owner',
				identityClaim: 'cognito:username',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const authInfo = {
			authMode: 'AWS_IAM',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS, // default auth mode
				accessTokenPayload,
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AWS_IAM
			)
		).toEqual(authInfo);
	});
	test('groups authorization', () => {
		const authRules = [
			{
				provider: 'userPools',
				ownerField: 'owner',
				allow: 'groups',
				groups: ['mygroup'],
				identityClaim: 'cognito:username',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const authInfo = {
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				accessTokenPayload,
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
			)
		).toEqual(authInfo);
	});
	test('groups authorization with groupClaim (array as string)', () => {
		const authRules = [
			{
				provider: 'userPools',
				ownerField: 'owner',
				allow: 'groups',
				groups: ['mygroup'],
				groupClaim: 'custom:groups',
				identityClaim: 'cognito:username',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const tokenPayload = {
			...accessTokenPayload,
			'custom:groups': '["mygroup"]',
		};
		const authInfo = {
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				tokenPayload,
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
			)
		).toEqual(authInfo);
	});
	test('groups authorization with groupClaim (string)', () => {
		const authRules = [
			{
				provider: 'userPools',
				ownerField: 'owner',
				allow: 'groups',
				groups: ['mygroup'],
				groupClaim: 'custom:group',
				identityClaim: 'cognito:username',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const tokenPayload = {
			...accessTokenPayload,
			'custom:group': '"mygroup"',
		};
		const authInfo = {
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				tokenPayload,
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
			)
		).toEqual(authInfo);
	});
	test('groups authorization with groupClaim (plain string)', () => {
		const authRules = [
			{
				provider: 'userPools',
				ownerField: 'owner',
				allow: 'groups',
				groups: ['mygroup'],
				groupClaim: 'custom:group',
				identityClaim: 'cognito:username',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const tokenPayload = {
			...accessTokenPayload,
			'custom:group': 'mygroup',
		};
		const authInfo = {
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				tokenPayload,
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
			)
		).toEqual(authInfo);
	});
	test('public iam authorization for unauth user', () => {
		const authRules = [
			{
				provider: 'iam',
				allow: 'public',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const authInfo = {
			authMode: 'AWS_IAM',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.unauth,
				GRAPHQL_AUTH_MODE.AWS_IAM,
				undefined, // No Cognito token
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AWS_IAM
			)
		).toEqual(authInfo);
	});
	test('private iam authorization for unauth user', () => {
		const authRules = [
			{
				provider: 'iam',
				allow: 'private',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const authInfo = {
			authMode: 'AWS_IAM',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.unauth,
				GRAPHQL_AUTH_MODE.AWS_IAM,
				undefined, // No Cognito token
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AWS_IAM
			)
		).toEqual(null);
	});
	test('private iam authorization for auth user', () => {
		const authRules = [
			{
				provider: 'iam',
				allow: 'private',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const authInfo = {
			authMode: 'AWS_IAM',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AWS_IAM,
				undefined, // No Cognito token
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AWS_IAM
			)
		).toEqual(authInfo);
	});
	test('public apiKey authorization without credentials', () => {
		const authRules = [
			{
				provider: 'apiKey',
				allow: 'public',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const authInfo = {
			authMode: 'API_KEY',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.none,
				GRAPHQL_AUTH_MODE.API_KEY,
				undefined, // No Cognito token
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.API_KEY
			)
		).toEqual(authInfo);
	});
	test('OIDC owner authorization', () => {
		const authRules = [
			{
				provider: 'oidc',
				ownerField: 'sub',
				allow: 'owner',
				identityClaim: 'sub',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const oidcTokenPayload = {
			sub: 'user1',
			email_verified: true,
			phone_number_verified: false,
			aud: '6l99pm4b729dn8c7bj7d3t1lnc',
			event_id: 'b4c25daa-0c03-4617-aab8-e5c74403536b',
			token_use: 'id',
			auth_time: 1578541322,
			phone_number: '+12068220398',
			exp: 1578544922,
			iat: 1578541322,
			email: 'user1@user.com',
		};
		const authInfo = {
			authMode: 'OPENID_CONNECT',
			isOwner: true,
			ownerField: 'sub',
			ownerValue: 'user1',
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.OPENID_CONNECT,
				undefined, // No Cognito token
				oidcTokenPayload,
				GRAPHQL_AUTH_MODE.OPENID_CONNECT
			)
		).toEqual(authInfo);
	});
	test('User Pools & OIDC owner authorization with Cognito token', () => {
		const authRules = [
			{
				provider: 'oidc',
				ownerField: 'owner',
				allow: 'owner',
				identityClaim: 'sub',
				operations: ['create', 'update', 'delete', 'read'],
			},
			{
				provider: 'userPools',
				ownerField: 'owner',
				allow: 'owner',
				identityClaim: 'cognito:username',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const authInfo = {
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			isOwner: true,
			ownerField: 'owner',
			ownerValue: 'user1',
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				accessTokenPayload,
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
			)
		).toEqual(authInfo);
	});

	test('Function default auth mode', () => {
		const authRules = [
			{
				provider: 'custom',
				allow: 'function',
				operations: ['create', 'update', 'delete', 'read'],
			},
		];
		const model = generateModelWithAuth(authRules);

		const authInfo = {
			authMode: 'AWS_LAMBDA',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.none,
				GRAPHQL_AUTH_MODE.AWS_LAMBDA,
				undefined, // No Cognito token
				undefined, // No OIDC token
				GRAPHQL_AUTH_MODE.AWS_LAMBDA
			)
		).toEqual(authInfo);
	});
});

describe('error handler', () => {
	let Model: PersistentModelConstructor<ModelType>;

	let subscriptionProcessor: SubscriptionProcessor;
	const errorHandler = jest.fn();
	beforeEach(async () => {
		errorHandler.mockClear();
		subscriptionProcessor = await instantiateSubscriptionProcessor({
			errorHandler,
		});
	});

	test('error handler once after all retires have failed', done => {
		Amplify.Logger.LOG_LEVEL = 'DEBUG';
		const debugLog = jest.spyOn(console, 'log');
		const message = PUBSUB_CONTROL_MSG.REALTIME_SUBSCRIPTION_INIT_ERROR;
		mockObservable = new Observable(observer => {
			observer.error({
				error: {
					errors: [
						{
							message,
						},
					],
				},
			});
		});

		const subscription = subscriptionProcessor.start();
		subscription[0].subscribe({
			error: data => {
				console.log(data);
				console.log(errorHandler.mock.calls);

				// call once each for Create, Update, and Delete
				expect(errorHandler).toHaveBeenCalledTimes(3);
				['Create', 'Update', 'Delete'].forEach(operation => {
					expect(errorHandler).toHaveBeenCalledWith(
						expect.objectContaining({
							process: 'subscribe',
							errorType: 'Unknown',
							message,
							model: 'Model',
							operation,
						})
					);
					// expect logger.debug to be called 6 times for auth mode (2 for each operation)
					// can't use toHaveBeenCalledTimes because it is called elsewhere unrelated to the test
					expect(debugLog).toHaveBeenCalledWith(
						expect.stringMatching(
							new RegExp(
								`[DEBUG].*${operation} subscription failed with authMode: API_KEY`
							)
						)
					);
					expect(debugLog).toHaveBeenCalledWith(
						expect.stringMatching(
							new RegExp(
								`[DEBUG].*${operation} subscription failed with authMode: AMAZON_COGNITO_USER_POOLS`
							)
						)
					);
				});

				done();
			},
		});
	}, 500);

	async function instantiateSubscriptionProcessor({
		errorHandler = () => null,
	}) {
		let schema: InternalSchema = internalTestSchema();

		const { initSchema, DataStore } = require('../src/datastore/datastore');
		const classes = initSchema(smallTestSchema());

		({ Model } = classes as {
			Model: PersistentModelConstructor<ModelType>;
		});

		const userClasses = {
			Model,
		};

		await DataStore.start();
		({ schema } = (DataStore as any).storage.storage);
		const syncPredicates = new WeakMap();

		const subscriptionProcessor = new SubscriptionProcessor(
			schema,
			syncPredicates,
			{
				aws_project_region: 'us-west-2',
				aws_appsync_graphqlEndpoint:
					'https://xxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-west-2.amazonaws.com/graphql',
				aws_appsync_region: 'us-west-2',
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: 'da2-xxxxxxxxxxxxxxxxxxxxxx',
			},
			() => [
				GRAPHQL_AUTH_MODE.API_KEY,
				GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
			],
			errorHandler
		);

		return subscriptionProcessor;
	}
});

const accessTokenPayload = {
	sub: 'xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx',
	'cognito:groups': ['mygroup'],
	email_verified: true,
	iss: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_XXXXXXXX',
	phone_number_verified: false,
	'cognito:username': 'user1',
	aud: '6l99pm4b729dn8c7bj7d3t1lnc',
	event_id: 'b4c25daa-0c03-4617-aab8-e5c74403536b',
	token_use: 'id',
	auth_time: 1578541322,
	phone_number: '+12068220398',
	exp: 1578544922,
	iat: 1578541322,
	email: 'user1@user.com',
};

export function generateModelWithAuth(
	authRules,
	modelProperties = {}
): SchemaModel {
	return {
		syncable: true,
		name: 'Post',
		pluralName: 'Posts',
		attributes: [
			{ type: 'model', properties: modelProperties },
			{
				type: 'auth',
				properties: {
					rules: [...authRules],
				},
			},
		],
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
	};
}
