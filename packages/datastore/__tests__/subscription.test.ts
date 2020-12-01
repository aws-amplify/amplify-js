import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import {
	SubscriptionProcessor,
	USER_CREDENTIALS,
} from '../src/sync/processors/subscription';
import { SchemaModel } from '../src/types';

describe('sync engine subscription module', () => {
	test('owner authorization', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
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
		const tokenPayload = {
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
				tokenPayload
			)
		).toEqual(authInfo);
	});
	test('owner authorization with only read operation', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'userPools',
								ownerField: 'owner',
								allow: 'owner',
								identityClaim: 'cognito:username',
								operations: ['read'],
							},
						],
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
		const tokenPayload = {
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
				tokenPayload
			)
		).toEqual(authInfo);
	});
	test('owner authorization without read operation', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'userPools',
								ownerField: 'owner',
								allow: 'owner',
								identityClaim: 'cognito:username',
								operations: ['create', 'update', 'delete'],
							},
						],
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
		const tokenPayload = {
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
				tokenPayload
			)
		).toEqual(authInfo);
	});
	test('owner authorization with public subscription', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{
					type: 'model',
					properties: {
						subscriptions: {
							level: 'public',
						},
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
		const tokenPayload = {
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
				tokenPayload
			)
		).toEqual(authInfo);
	});
	test('groups authorization', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'userPools',
								ownerField: 'owner',
								allow: 'groups',
								groups: ['mygroup'],
								identityClaim: 'cognito:username',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
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
		const tokenPayload = {
			sub: 'xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx',
			'cognito:groups': ['mygroup'],
			email_verified: true,
			iss: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_XXXXXXXXX',
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
				tokenPayload
			)
		).toEqual(authInfo);
	});
	test('groups authorization with groupClaim (array as string)', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'userPools',
								ownerField: 'owner',
								allow: 'groups',
								groups: ['mygroup'],
								groupClaim: 'custom:groups',
								identityClaim: 'cognito:username',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
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
		const tokenPayload = {
			sub: 'xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx',
			'custom:groups': '["mygroup"]',
			email_verified: true,
			iss: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_XXXXXXXXX',
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
				tokenPayload
			)
		).toEqual(authInfo);
	});
	test('groups authorization with groupClaim (string)', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'userPools',
								ownerField: 'owner',
								allow: 'groups',
								groups: ['mygroup'],
								groupClaim: 'custom:group',
								identityClaim: 'cognito:username',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
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
		const tokenPayload = {
			sub: 'xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx',
			'custom:group': '"mygroup"',
			email_verified: true,
			iss: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_XXXXXXXXX',
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
				tokenPayload
			)
		).toEqual(authInfo);
	});
	test('groups authorization with groupClaim (plain string)', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'userPools',
								ownerField: 'owner',
								allow: 'groups',
								groups: ['mygroup'],
								groupClaim: 'custom:group',
								identityClaim: 'cognito:username',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
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
		const tokenPayload = {
			sub: 'xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx',
			'custom:group': 'mygroup',
			email_verified: true,
			iss: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_XXXXXXXXX',
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
				tokenPayload
			)
		).toEqual(authInfo);
	});
	test('public iam authorization for unauth user', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'iam',
								allow: 'public',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
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
		const authInfo = {
			authMode: 'AWS_IAM',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.unauth,
				GRAPHQL_AUTH_MODE.AWS_IAM
			)
		).toEqual(authInfo);
	});
	test('private iam authorization for unauth user', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'iam',
								allow: 'private',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
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
		const authInfo = {
			authMode: 'AWS_IAM',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.unauth,
				GRAPHQL_AUTH_MODE.AWS_IAM
			)
		).toEqual(null);
	});
	test('private iam authorization for auth user', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'iam',
								allow: 'private',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
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
		const authInfo = {
			authMode: 'AWS_IAM',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.auth,
				GRAPHQL_AUTH_MODE.AWS_IAM
			)
		).toEqual(authInfo);
	});
	test('public apiKey authorization without credentials', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'apiKey',
								allow: 'public',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
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
		const authInfo = {
			authMode: 'API_KEY',
			isOwner: false,
		};

		expect(
			// @ts-ignore
			SubscriptionProcessor.prototype.getAuthorizationInfo(
				model,
				USER_CREDENTIALS.none,
				GRAPHQL_AUTH_MODE.API_KEY
			)
		).toEqual(authInfo);
	});
	test('OIDC owner authorization', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'oidc',
								ownerField: 'sub',
								allow: 'owner',
								identityClaim: 'sub',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
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
				undefined,
				oidcTokenPayload
			)
		).toEqual(authInfo);
	});
	test('User Pools & OIDC owner authorization with Cognito token', () => {
		const model: SchemaModel = {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{ type: 'model', properties: {} },
				{
					type: 'auth',
					properties: {
						rules: [
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
						],
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
		const tokenPayload = {
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
				tokenPayload
			)
		).toEqual(authInfo);
	});
});
