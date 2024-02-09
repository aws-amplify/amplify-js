import { Amplify } from '../../src/singleton';
import { Hub, AMPLIFY_SYMBOL } from '../../src/Hub';
import { AuthClass as Auth } from '../../src/singleton/Auth';
import { decodeJWT } from '../../src/singleton/Auth/utils';
import { CredentialsAndIdentityId } from '../../src/singleton/Auth/types';
import { TextEncoder, TextDecoder } from 'util';
import { fetchAuthSession, ResourcesConfig } from '../../src';
Object.assign(global, { TextDecoder, TextEncoder });

jest.mock('../../src/Hub', () => ({
	...jest.requireActual('../../src/Hub'),
	Hub: {
		dispatch: jest.fn(),
	},
}));

const mockHubDispatch = Hub.dispatch as jest.Mock;

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
	? A
	: never;

const MOCK_AUTH_CONFIG = {
	Auth: {
		Cognito: {
			identityPoolId: 'us-east-1:bbbbb',
		},
	},
};

type ModelIntrospection = NonNullable<
	NonNullable<ResourcesConfig['API']>['GraphQL']
>['modelIntrospection'];

const modelIntrospection: ModelIntrospection = {
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
			pluralName: 'Todos',
			attributes: [
				{
					type: 'model',
					properties: {},
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
};

describe('Amplify.configure() and Amplify.getConfig()', () => {
	const mockLegacyConfig = {
		aws_project_region: 'us-west-2',
		aws_cognito_identity_pool_id: 'aws_cognito_identity_pool_id',
		aws_cognito_region: 'aws_cognito_region',
		aws_user_pools_id: 'aws_user_pools_id',
		aws_user_pools_web_client_id: 'aws_user_pools_web_client_id',
		oauth: {},
		aws_cognito_username_attributes: [],
		aws_cognito_social_providers: [],
		aws_cognito_signup_attributes: [],
		aws_cognito_mfa_configuration: 'OFF',
		aws_cognito_mfa_types: ['SMS'],
		aws_cognito_password_protection_settings: {
			passwordPolicyMinLength: 8,
			passwordPolicyCharacters: [],
		},
		aws_cognito_verification_mechanisms: ['PHONE_NUMBER'],
		aws_appsync_graphqlEndpoint: 'https://some.domain.com/graphql',
		aws_appsync_region: 'us-west-1',
		aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
		aws_appsync_apiKey: 'some-key',
		modelIntrospection,
	};
	const expectedResourceConfig: ResourcesConfig = {
		Auth: {
			Cognito: {
				allowGuestAccess: true,
				identityPoolId: 'aws_cognito_identity_pool_id',
				userPoolClientId: 'aws_user_pools_web_client_id',
				userPoolId: 'aws_user_pools_id',
				loginWith: { email: false, phone: false, username: true },
				mfa: { smsEnabled: true, status: 'off', totpEnabled: false },
				passwordFormat: {
					minLength: 8,
					requireLowercase: false,
					requireNumbers: false,
					requireSpecialCharacters: false,
					requireUppercase: false,
				},
				userAttributes: { phone_number: { required: true } },
			},
		},
		API: {
			GraphQL: {
				apiKey: 'some-key',
				defaultAuthMode: 'userPool',
				endpoint: 'https://some.domain.com/graphql',
				region: 'us-west-1',
				modelIntrospection,
			},
		},
	};

	afterEach(() => {
		mockHubDispatch.mockClear();
	});

	it('should take the legacy CLI shaped config object for configuring and return it from getConfig()', () => {
		Amplify.configure(mockLegacyConfig);
		const result = Amplify.getConfig();

		expect(result).toEqual(expectedResourceConfig);
	});

	it('dispatches hub event with parsed ResourceConfig from the legacy config', () => {
		Amplify.configure(mockLegacyConfig);

		expect(mockHubDispatch).toHaveBeenCalledWith(
			'core',
			{
				event: 'configure',
				data: expectedResourceConfig,
			},
			'Configure',
			AMPLIFY_SYMBOL
		);
	});

	it('should take the v6 shaped config object for configuring and return it from getConfig()', () => {
		Amplify.configure(MOCK_AUTH_CONFIG);
		const result = Amplify.getConfig();

		expect(result).toEqual(MOCK_AUTH_CONFIG);
	});

	it('should replace Cognito configuration set and get config', () => {
		const config1: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				Cognito: {
					userPoolId: 'us-east-1:aaaaaaa',
					userPoolClientId: 'aaaaaaaaaaaa',
				},
			},
		};

		Amplify.configure(config1);
		Amplify.configure(MOCK_AUTH_CONFIG);

		const result = Amplify.getConfig();

		expect(result).toEqual(MOCK_AUTH_CONFIG);
	});

	it('should return memoized, immutable resource configuration objects', () => {
		Amplify.configure(MOCK_AUTH_CONFIG);

		const config = Amplify.getConfig();
		const config2 = Amplify.getConfig();

		const mutateConfig = () => {
			(config as any).Auth = MOCK_AUTH_CONFIG.Auth;
		};

		// Config should be cached
		expect(config).toEqual(MOCK_AUTH_CONFIG);
		expect(config2).toBe(config);

		// Config should be immutable
		expect(mutateConfig).toThrow(TypeError);

		// Config should be re-generated if it changes
		Amplify.configure({
			Auth: {
				Cognito: {
					identityPoolId: 'us-east-1:bbbbb',
				},
			},
			API: {
				GraphQL: {
					apiKey: 'some-key',
					defaultAuthMode: 'userPool',
					endpoint: 'https://some.domain.com/graphql',
					region: 'us-west-1',
					modelIntrospection: modelIntrospection as any,
				},
			},
		});

		const config3 = Amplify.getConfig();

		expect(config3).toEqual({
			...MOCK_AUTH_CONFIG,
			API: {
				GraphQL: {
					apiKey: 'some-key',
					defaultAuthMode: 'userPool',
					endpoint: 'https://some.domain.com/graphql',
					region: 'us-west-1',
					modelIntrospection,
				},
			},
		});
		expect(config3).not.toBe(config);
		expect(config3).not.toBe(config2);
	});
});

describe('Session tests', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});
	test('fetch empty session', async () => {
		expect.assertions(2);
		const config: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				Cognito: {
					userPoolId: 'us-east-1:aaaaaaa',
					identityPoolId: 'us-east-1:bbbbb',
					userPoolClientId: 'aaaaaaaaaaaa',
				},
			},
		};

		Amplify.configure(config);

		const session = await Amplify.Auth.fetchAuthSession();

		expect(session.tokens).toBe(undefined);
		expect(session.credentials).toBe(undefined);
	});

	test('fetchAuthSession with credentials provider only', async () => {
		const mockCredentials = {
			accessKeyId: 'accessKeyValue',
			secretAccessKey: 'secreatAccessKeyValue',
		};
		Amplify.configure(
			{},
			{
				Auth: {
					credentialsProvider: {
						getCredentialsAndIdentityId: async () => {
							return {
								credentials: mockCredentials,
							};
						},
						clearCredentialsAndIdentityId: () => {},
					},
				},
			}
		);

		const session = await fetchAuthSession();

		expect(session.credentials).toBe(mockCredentials);
	});

	test('fetch user after no credentials', async () => {
		expect.assertions(3);
		const config: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				Cognito: {
					userPoolId: 'us-east-1:aaaaaaa',
					identityPoolId: 'us-east-1:bbbbb',
					userPoolClientId: 'aaaaaaaaaaaa',
				},
			},
		};

		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
		const mockToken = decodeJWT(token);
		const spyTokenProvider = jest.fn(async () => {
			return {
				accessToken: mockToken,
			};
		});
		Amplify.configure(config, {
			Auth: {
				tokenProvider: {
					getTokens: spyTokenProvider,
				},
			},
		});

		const session = await Amplify.Auth.fetchAuthSession();
		expect(spyTokenProvider).toHaveBeenCalled();

		expect(session.tokens?.accessToken.payload).toEqual({
			exp: 1710293130,
			iat: 1516239022,
			name: 'John Doe',
			sub: '1234567890',
		});

		expect(session.userSub).toEqual('1234567890');
	});

	test('fetch session with token and credentials', async () => {
		expect.assertions(4);

		const config: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				Cognito: {
					userPoolId: 'us-east-1:aaaaaaa',
					identityPoolId: 'us-east-1:bbbbb',
					userPoolClientId: 'aaaaaaaaaaaa',
				},
			},
		};

		const credentialsSpy = jest.fn(
			async ({
				tokens,
				authConfig,
				identityId,
			}): Promise<CredentialsAndIdentityId> => {
				return {
					credentials: {
						accessKeyId: 'accessKeyIdValue',
						secretAccessKey: 'secretAccessKeyValue',
						sessionToken: 'sessionTokenValue',
						expiration: new Date(123),
					},
					identityId: 'identityIdValue',
				};
			}
		);
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
		const mockToken = decodeJWT(token);

		const spyTokenProvider = jest.fn(async () => {
			return {
				accessToken: mockToken,
			};
		});

		Amplify.configure(config, {
			Auth: {
				credentialsProvider: {
					getCredentialsAndIdentityId: credentialsSpy,
					clearCredentialsAndIdentityId: () => {},
				},
				tokenProvider: {
					getTokens: spyTokenProvider,
				},
			},
		});

		const session = await Amplify.Auth.fetchAuthSession();

		expect(session.tokens?.accessToken.payload).toEqual({
			exp: 1710293130,
			iat: 1516239022,
			name: 'John Doe',
			sub: '1234567890',
		});

		expect(session.identityId).toBe('identityIdValue');

		expect(session.credentials).toEqual({
			accessKeyId: 'accessKeyIdValue',
			secretAccessKey: 'secretAccessKeyValue',
			sessionToken: 'sessionTokenValue',
			expiration: new Date(123),
		});

		expect(credentialsSpy).toHaveBeenCalledWith({
			authConfig: {
				Cognito: {
					identityPoolId: 'us-east-1:bbbbb',
					userPoolId: 'us-east-1:aaaaaaa',
					userPoolClientId: 'aaaaaaaaaaaa',
				},
			},
			tokens: {
				accessToken: {
					payload: {
						exp: 1710293130,
						iat: 1516239022,
						name: 'John Doe',
						sub: '1234567890',
					},
					toString: expect.anything(),
				},
				idToken: undefined,
			},
			authenticated: true,
		});
	});

	test('fetch session without tokens and credentials', async () => {
		expect.assertions(4);

		const config: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				Cognito: {
					userPoolId: 'us-east-1:aaaaaaa',
					identityPoolId: 'us-east-1:bbbbb',
					userPoolClientId: 'aaaaaaaaaaaa',
					allowGuestAccess: true,
				},
			},
		};

		const credentialsSpy = jest.fn(
			async ({
				tokens,
				authConfig,
				identityId,
			}): Promise<CredentialsAndIdentityId> => {
				return {
					credentials: {
						accessKeyId: 'accessKeyIdValue',
						secretAccessKey: 'secretAccessKeyValue',
						sessionToken: 'sessionTokenValue',
						expiration: new Date(123),
					},
					identityId: 'identityIdValue',
				};
			}
		);

		const spyTokenProvider = jest.fn(async () => {
			return null;
		});

		Amplify.configure(config, {
			Auth: {
				credentialsProvider: {
					getCredentialsAndIdentityId: credentialsSpy,
					clearCredentialsAndIdentityId: () => {},
				},
				tokenProvider: {
					getTokens: spyTokenProvider,
				},
			},
		});

		const session = await Amplify.Auth.fetchAuthSession();

		expect(session.tokens).toBeUndefined();

		expect(session.identityId).toBe('identityIdValue');

		expect(session.credentials).toEqual({
			accessKeyId: 'accessKeyIdValue',
			secretAccessKey: 'secretAccessKeyValue',
			sessionToken: 'sessionTokenValue',
			expiration: new Date(123),
		});

		expect(credentialsSpy).toHaveBeenCalledWith({
			authConfig: {
				Cognito: {
					allowGuestAccess: true,
					identityPoolId: 'us-east-1:bbbbb',
					userPoolId: 'us-east-1:aaaaaaa',
					userPoolClientId: 'aaaaaaaaaaaa',
				},
			},
			authenticated: false,
			forceRefresh: undefined,
		});
	});

	test('refresh tokens with forceRefresh success', async () => {
		expect.assertions(1);
		const auth = new Auth();
		const tokenProvider = jest.fn(async () => {
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
			const mockToken = decodeJWT(token);
			return {
				accessToken: mockToken,
			};
		});

		auth.configure(
			{
				Cognito: {
					userPoolId: 'us-east-1:aaaaaaa',
					identityPoolId: 'us-east-1:bbbbb',
					userPoolClientId: 'aaaaaaaaaaaa',
				},
			},
			{
				tokenProvider: {
					getTokens: tokenProvider,
				},
			}
		);

		await auth.fetchAuthSession({ forceRefresh: true });
		expect(tokenProvider).toHaveBeenCalledWith({
			forceRefresh: true,
		});
	});

	test('refresh tokens with forceRefresh failed', async () => {
		expect.assertions(2);
		const auth = new Auth();
		const tokenProvider = jest.fn(() => {
			throw new Error('no no no');
		});

		auth.configure(
			{
				Cognito: {
					userPoolId: 'us-east-1:aaaaaaa',
					identityPoolId: 'us-east-1:bbbbb',
					userPoolClientId: 'aaaaaaaaaaaa',
				},
			},
			{
				tokenProvider: {
					getTokens: tokenProvider,
				},
			}
		);

		const action = async () =>
			await auth.fetchAuthSession({ forceRefresh: true });

		await expect(action()).rejects.toThrow('no no no');

		expect(tokenProvider).toHaveBeenCalled();
	});
});
