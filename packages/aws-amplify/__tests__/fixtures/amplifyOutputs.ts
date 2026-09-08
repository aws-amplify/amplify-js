// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */

export const amplifyOutputsFixture = {
	auth: {
		user_pool_id: 'eu-north-1_Ab12CdEfG',
		aws_region: 'eu-north-1',
		user_pool_client_id: '1a2b3c4d5e6f7g8h9i0jklmnop',
		identity_pool_id: 'eu-north-1:aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
		mfa_methods: [],
		standard_required_attributes: ['email'],
		username_attributes: ['email'],
		user_verification_types: ['email'],
		groups: [
			{ admin: { precedence: 0 } },
			{ contributor: { precedence: 1 } },
			{ user: { precedence: 2 } },
		],
		mfa_configuration: 'NONE',
		password_policy: {
			min_length: 8,
			require_lowercase: true,
			require_numbers: true,
			require_symbols: true,
			require_uppercase: true,
		},
		unauthenticated_identities_enabled: true,
	},
	data: {
		url: 'https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.eu-north-1.amazonaws.com/graphql',
		aws_region: 'eu-north-1',
		api_key: 'da2-fakeapikey1234567890abcdef',
		default_authorization_type: 'AMAZON_COGNITO_USER_POOLS',
		authorization_types: ['API_KEY', 'AWS_IAM'],
		model_introspection: {
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
						content: {
							name: 'content',
							isArray: false,
							type: 'String',
							isRequired: true,
							attributes: [],
						},
					},
					syncable: true,
					pluralName: 'Todos',
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
	},
	storage: {
		aws_region: 'eu-north-1',
		bucket_name: 'my-test-app-storage-bucket-abcdef123456',
		buckets: [
			{
				name: 'amplify_storage_bucket',
				bucket_name: 'my-test-app-storage-bucket-abcdef123456',
				aws_region: 'eu-north-1',
				paths: {
					'public/*': {
						guest: ['get', 'list', 'write'],
					},
					'restricted/*': {
						groupsuser: ['get', 'list'],
						groupscontributor: ['get', 'list', 'write'],
						groupsadmin: ['get', 'list', 'write', 'delete'],
					},
				},
			},
		],
	},
	version: '1.4',
};
