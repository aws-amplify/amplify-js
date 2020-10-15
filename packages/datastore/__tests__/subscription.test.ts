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
				USER_CREDENTIALS.unauth
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
				USER_CREDENTIALS.unauth
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
				USER_CREDENTIALS.auth
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
				USER_CREDENTIALS.none
			)
		).toEqual(authInfo);
	});
});
