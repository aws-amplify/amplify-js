import {
	InternalSchema,
	ModelAttributeAuthAllow,
	ModelAttributeAuthProperty,
	ModelAttributeAuthProvider,
	ModelOperation,
} from '../src/types';
import { NAMESPACES } from '../src/util';
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/auth';

describe('Auth Strategies', () => {
	describe('multiAuthStrategy', () => {
		const rules = {
			function: {
				provider: ModelAttributeAuthProvider.FUNCTION,
				allow: ModelAttributeAuthAllow.CUSTOM,
				operations: ['create', 'update', 'delete', 'read'],
			},
			owner: {
				provider: ModelAttributeAuthProvider.USER_POOLS,
				ownerField: 'owner',
				allow: ModelAttributeAuthAllow.OWNER,
				identityClaim: 'cognito:username',
				operations: ['create', 'update', 'delete', 'read'],
			},
			ownerOIDC: {
				provider: ModelAttributeAuthProvider.OIDC,
				ownerField: 'owner',
				allow: ModelAttributeAuthAllow.OWNER,
				identityClaim: 'sub',
				operations: ['create', 'update', 'delete', 'read'],
			},
			group: {
				groupClaim: 'cognito:groups',
				provider: ModelAttributeAuthProvider.USER_POOLS,
				allow: ModelAttributeAuthAllow.GROUPS,
				groups: ['Admin'],
				operations: ['create', 'update', 'delete', 'read'],
			},
			groupOIDC: {
				groupClaim: 'customGroups',
				provider: ModelAttributeAuthProvider.OIDC,
				allow: ModelAttributeAuthAllow.GROUPS,
				customGroups: ['Admin'],
				operations: ['create', 'update', 'delete', 'read'],
			},
			privateUserPoolsExplicit: {
				provider: ModelAttributeAuthProvider.USER_POOLS,
				allow: ModelAttributeAuthAllow.PRIVATE,
				operations: ['create', 'update', 'delete', 'read'],
			},
			privateUserPoolsImplicit: {
				allow: ModelAttributeAuthAllow.PRIVATE,
				operations: ['create', 'update', 'delete', 'read'],
			},
			privateIAM: {
				provider: ModelAttributeAuthProvider.IAM,
				allow: ModelAttributeAuthAllow.PRIVATE,
				operations: ['create', 'update', 'delete', 'read'],
			},
			publicIAM: {
				provider: ModelAttributeAuthProvider.IAM,
				allow: ModelAttributeAuthAllow.PUBLIC,
				operations: ['create', 'update', 'delete', 'read'],
			},
			publicAPIKeyExplicit: {
				provider: ModelAttributeAuthProvider.API_KEY,
				allow: ModelAttributeAuthAllow.PUBLIC,
				operations: ['create', 'update', 'delete', 'read'],
			},
			publicAPIKeyImplicit: {
				allow: ModelAttributeAuthAllow.PUBLIC,
				operations: ['create', 'update', 'delete', 'read'],
			},
		};

		test('function', async () => {
			const authRules = [rules.function];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AWS_LAMBDA'],
			});

			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: ['AWS_LAMBDA'],
			});
		});

		test('owner', async () => {
			const authRules = [rules.owner];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS'],
			});

			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});
		});

		test('owner OIDC', async () => {
			const authRules = [rules.ownerOIDC];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['OPENID_CONNECT'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});
		});

		test('group', async () => {
			const authRules = [rules.group];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});
		});

		test('group OIDC', async () => {
			const authRules = [rules.groupOIDC];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['OPENID_CONNECT'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});
		});

		test('private User Pools', async () => {
			let authRules: any = [rules.privateUserPoolsExplicit];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});

			// private with no provider implies that the provider is AMAZON_COGNITO_USER_POOLS
			authRules = [rules.privateUserPoolsImplicit];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});
		});

		test('private IAM', async () => {
			const authRules = [rules.privateIAM];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AWS_IAM'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});
		});

		test('public IAM', async () => {
			const authRules = [rules.publicIAM];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AWS_IAM'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: ['AWS_IAM'],
			});
		});

		test('API key', async () => {
			let authRules: any = [rules.publicAPIKeyExplicit];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['API_KEY'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: ['API_KEY'],
			});

			// public with no provider implies that the provider is API_KEY
			authRules = [rules.publicAPIKeyImplicit];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['API_KEY'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: ['API_KEY'],
			});
		});

		test('owner/group', async () => {
			const authRules = [rules.owner, rules.group];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});
		});

		test('owner/OIDC', async () => {
			let authRules = [rules.owner, rules.ownerOIDC];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS', 'OPENID_CONNECT'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});

			// Test again with rules in reverse order
			authRules = [rules.ownerOIDC, rules.owner];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS', 'OPENID_CONNECT'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});
		});

		test('owner/IAM private', async () => {
			const authRules = [rules.owner, rules.privateIAM];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS', 'AWS_IAM'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});
		});

		test('owner/IAM public', async () => {
			const authRules = [rules.owner, rules.publicIAM];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS', 'AWS_IAM'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: ['AWS_IAM'],
			});
		});

		test('owner/API key', async () => {
			const authRules = [rules.owner, rules.publicAPIKeyExplicit];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS', 'API_KEY'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: ['API_KEY'],
			});
		});

		test('private User Pools/private IAM', async () => {
			let authRules = [rules.privateUserPoolsExplicit, rules.privateIAM];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS', 'AWS_IAM'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});

			// Test again with rules in reverse order
			authRules = [rules.privateIAM, rules.privateUserPoolsExplicit];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS', 'AWS_IAM'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: [],
			});
		});

		test('owner/private IAM/API key', async () => {
			const authRules = [
				rules.owner,
				rules.privateIAM,
				rules.publicAPIKeyExplicit,
			];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS', 'AWS_IAM', 'API_KEY'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: ['API_KEY'],
			});
		});

		test('owner/public IAM/API key', async () => {
			const authRules = [
				rules.owner,
				rules.publicIAM,
				rules.publicAPIKeyExplicit,
			];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS', 'AWS_IAM', 'API_KEY'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: ['AWS_IAM', 'API_KEY'],
			});
		});

		test('function/owner/public IAM/API key', async () => {
			const authRules = [
				rules.function,
				rules.owner,
				rules.publicIAM,
				rules.publicAPIKeyExplicit,
			];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: [
					'AWS_LAMBDA',
					'AMAZON_COGNITO_USER_POOLS',
					'AWS_IAM',
					'API_KEY',
				],
			});

			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: ['AWS_LAMBDA', 'AWS_IAM', 'API_KEY'],
			});
		});

		test('duplicates', async () => {
			const authRules = [
				rules.owner,
				rules.owner,
				rules.privateIAM,
				rules.privateIAM,
				rules.publicAPIKeyExplicit,
				rules.publicAPIKeyExplicit,
				rules.publicAPIKeyExplicit,
			];
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: true,
				result: ['AMAZON_COGNITO_USER_POOLS', 'AWS_IAM', 'API_KEY'],
			});
			await testMultiAuthStrategy({
				authRules,
				hasAuthenticatedUser: false,
				result: ['API_KEY'],
			});
		});
	});

	describe('defaultAuthStrategy', () => {
		test('default', () => {
			const defaultAuthStrategy =
				require('../src/authModeStrategies/defaultAuthStrategy').defaultAuthStrategy;
			const schema = getAuthSchema();
			expect(
				defaultAuthStrategy({
					schema,
					modelName: 'Post',
					operation: ModelOperation.READ,
				})
			).toEqual([]);
		});
	});
});

async function testMultiAuthStrategy({
	authRules,
	hasAuthenticatedUser,
	result,
}: {
	authRules: ModelAttributeAuthProperty[];
	hasAuthenticatedUser: boolean;
	result: any;
}) {
	mockCurrentUser({ hasAuthenticatedUser });

	const multiAuthStrategy =
		require('../src/authModeStrategies/multiAuthStrategy').multiAuthStrategy;

	const schema = getAuthSchema(authRules);

	const authModes = await multiAuthStrategy({
		schema,
		modelName: 'Post',
		// multiAuthStrategy does not currently use the `operation` param
		// but it still technically a required attribute in TS, since customers
		// won't actually be calling the function directly in their app.
		operation: ModelOperation.READ,
	});

	expect(authModes).toEqual(result);
	jest.resetModules();
	jest.resetAllMocks();
}

function getAuthSchema(
	authRules: ModelAttributeAuthProperty[] = []
): InternalSchema {
	const baseSchema: InternalSchema = {
		namespaces: {
			[NAMESPACES.USER]: {
				name: NAMESPACES.USER,
				models: {
					Post: {
						syncable: true,
						name: 'Post',
						pluralName: 'Posts',
						attributes: [{ type: 'model', properties: {} }],
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
					},
				},
				enums: {},
				nonModels: {},
			},
		},
		version: 'a77c7728256031f4909aab05bfcaf798',
	};

	return {
		...baseSchema,
		namespaces: {
			...baseSchema.namespaces,
			[NAMESPACES.USER]: {
				...baseSchema.namespaces[NAMESPACES.USER],
				models: {
					...baseSchema.namespaces[NAMESPACES.USER].models,
					Post: {
						...baseSchema.namespaces[NAMESPACES.USER].models.Post,
						attributes: [
							...baseSchema.namespaces[NAMESPACES.USER].models.Post.attributes,
							{
								type: 'auth',
								properties: {
									rules: authRules,
								},
							},
						],
					},
				},
			},
		},
	};
}

function mockCurrentUser({
	hasAuthenticatedUser,
}: {
	hasAuthenticatedUser: boolean;
}) {
	jest.mock('@aws-amplify/auth', () => ({
		currentAuthenticatedUser: () => {
			return new Promise((res, rej) => {
				if (hasAuthenticatedUser) {
					res(hasAuthenticatedUser);
				} else {
					rej(hasAuthenticatedUser);
				}
			});
		},
		GRAPHQL_AUTH_MODE,
	}));
}
