/* eslint-disable camelcase */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Behavioral contract tests for the `Amplify` singleton facade (formerly
 * `DefaultAmplify` in `initSingleton.ts`). Per repo convention these exercise
 * the REAL `@aws-amplify/core` singleton/global-context and real config
 * objects — only the `Hub` boundary is spied on. Nothing internal (getConfig,
 * providers, parsers) is mocked.
 */
import {
	CredentialsAndIdentityIdProvider,
	Hub,
	ResourcesConfig,
	TokenProvider,
	getGlobalContext,
} from '@aws-amplify/core';
import {
	AmplifyOutputs,
	clearGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { Amplify } from '../src';

const mockResourceConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolClientId: 'userPoolClientId',
			userPoolId: 'userPoolId',
		},
	},
	Storage: {
		S3: {
			bucket: 'bucket',
			region: 'us-west-2',
		},
	},
};

describe('Amplify facade (formerly DefaultAmplify)', () => {
	afterEach(() => {
		clearGlobalContext();
		jest.restoreAllMocks();
	});

	describe('Amplify.configure()', () => {
		it('publishes the branded config as the global context', () => {
			Amplify.configure(mockResourceConfig);

			const config = Amplify.getConfig();
			expect(config.Auth?.Cognito?.userPoolClientId).toBe('userPoolClientId');
			expect(config.Storage?.S3?.bucket).toBe('bucket');
			// getConfig() reads from the global context set by configure().
			expect(getGlobalContext().resourcesConfig).toBe(config);
		});

		it('dispatches a `configure` Hub event carrying the resource config', () => {
			const hubSpy = jest.spyOn(Hub, 'dispatch');

			Amplify.configure(mockResourceConfig);

			expect(hubSpy).toHaveBeenCalledWith(
				'core',
				expect.objectContaining({
					event: 'configure',
					data: expect.objectContaining({
						Auth: expect.objectContaining({
							Cognito: expect.objectContaining({
								userPoolClientId: 'userPoolClientId',
							}),
						}),
					}),
				}),
				'Configure',
				expect.anything(),
			);
		});

		it('takes the legacy CLI-shaped config object', () => {
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
			};

			Amplify.configure(mockLegacyConfig);

			const config = Amplify.getConfig();
			expect(config.Auth?.Cognito?.userPoolId).toBe('aws_user_pools_id');
			expect(config.Auth?.Cognito?.identityPoolId).toBe(
				'aws_cognito_identity_pool_id',
			);
			expect(config.Auth?.Cognito?.allowGuestAccess).toBe(true);
		});

		it('takes the AmplifyOutputs (Gen2) config format', () => {
			const amplifyOutputs: AmplifyOutputs = {
				version: '1',
				storage: {
					aws_region: 'us-east-1',
					bucket_name: 'my-bucket-name',
				},
				auth: {
					user_pool_id: 'us-east-1:',
					user_pool_client_id: 'xxxx',
					aws_region: 'us-east-1',
					identity_pool_id: 'test',
				},
				analytics: {
					amazon_pinpoint: {
						app_id: 'xxxxx',
						aws_region: 'us-east-1',
					},
				},
			};

			Amplify.configure(amplifyOutputs);

			const config = Amplify.getConfig();
			expect(config.Auth?.Cognito?.userPoolId).toBe('us-east-1:');
			expect(config.Auth?.Cognito?.identityPoolId).toBe('test');
			expect(config.Storage?.S3?.bucket).toBe('my-bucket-name');
			expect(config.Analytics?.Pinpoint?.appId).toBe('xxxxx');
		});

		it('passes through non-Auth library options', () => {
			Amplify.configure(mockResourceConfig, {
				Storage: { S3: { defaultAccessLevel: 'private' } },
			});

			expect(
				getGlobalContext().libraryOptions.Storage?.S3?.defaultAccessLevel,
			).toBe('private');
			expect(Amplify.getConfig().Auth?.Cognito?.userPoolClientId).toBe(
				'userPoolClientId',
			);
		});

		it('configures with default Cognito providers when Auth is present and no Auth options are supplied', () => {
			Amplify.configure(mockResourceConfig);

			const { Auth } = getGlobalContext().libraryOptions;
			expect(Auth?.tokenProvider).toBeDefined();
			expect(Auth?.credentialsProvider).toBeDefined();
		});

		it('passes through when libraryOptions.Auth is provided (no default providers)', () => {
			const mockTokenProvider: TokenProvider = {
				getTokens: jest.fn().mockResolvedValue(undefined),
			};
			const mockCredentialsProvider: CredentialsAndIdentityIdProvider = {
				getCredentialsAndIdentityId: jest.fn().mockResolvedValue(undefined),
				clearCredentialsAndIdentityId: jest.fn(),
			};

			Amplify.configure(mockResourceConfig, {
				Auth: {
					tokenProvider: mockTokenProvider,
					credentialsProvider: mockCredentialsProvider,
				},
			});

			const { Auth } = getGlobalContext().libraryOptions;
			expect(Auth?.tokenProvider).toBe(mockTokenProvider);
			expect(Auth?.credentialsProvider).toBe(mockCredentialsProvider);
		});

		it('configures with default providers when only resource config is passed (no Auth options)', () => {
			const resourceConfig = { Storage: mockResourceConfig.Storage };

			Amplify.configure(resourceConfig, {});

			const config = Amplify.getConfig();
			expect(config.Auth).toBeUndefined();
			expect(config.Storage?.S3?.bucket).toBe('bucket');
		});

		it('supports the ssr option', () => {
			Amplify.configure(mockResourceConfig, { ssr: true });

			expect(getGlobalContext().libraryOptions.ssr).toBe(true);
			expect(Amplify.getConfig().Auth?.Cognito?.userPoolClientId).toBe(
				'userPoolClientId',
			);
		});

		it('preserves previous library options on reconfigure when none are provided', () => {
			Amplify.configure(mockResourceConfig, { ssr: true });
			const previousAuth = getGlobalContext().libraryOptions.Auth;

			const updatedResourceConfig: ResourcesConfig = {
				Auth: {
					Cognito: {
						userPoolClientId: 'newClientId',
						userPoolId: 'newPoolId',
					},
				},
			};
			Amplify.configure(updatedResourceConfig);

			// resourcesConfig is updated ...
			expect(Amplify.getConfig().Auth?.Cognito?.userPoolClientId).toBe(
				'newClientId',
			);
			// ... but the previously-configured library options are preserved.
			expect(getGlobalContext().libraryOptions.ssr).toBe(true);
			expect(getGlobalContext().libraryOptions.Auth).toBe(previousAuth);
		});

		it('replaces library options on reconfigure when new options are provided', () => {
			Amplify.configure(mockResourceConfig, { ssr: true });

			Amplify.configure(mockResourceConfig, {
				Storage: { S3: { defaultAccessLevel: 'guest' } },
			});

			expect(getGlobalContext().libraryOptions.ssr).toBeUndefined();
			expect(
				getGlobalContext().libraryOptions.Storage?.S3?.defaultAccessLevel,
			).toBe('guest');
		});
	});

	describe('Amplify.getConfig()', () => {
		it('returns the resource config after configure', () => {
			Amplify.configure(mockResourceConfig);

			expect(Amplify.getConfig()).toEqual(
				expect.objectContaining({
					Auth: expect.objectContaining({
						Cognito: expect.objectContaining({
							userPoolClientId: 'userPoolClientId',
						}),
					}),
				}),
			);
		});

		it('throws if configure has not been called', () => {
			expect(() => Amplify.getConfig()).toThrow();
		});
	});

	describe('Amplify.fetchAuthSession()', () => {
		it('delegates to the global context', async () => {
			Amplify.configure(mockResourceConfig);

			const session = await Amplify.fetchAuthSession();
			expect(session).toBeDefined();
		});

		it('throws if configure has not been called', () => {
			expect(() => Amplify.fetchAuthSession()).toThrow();
		});
	});

	describe('Amplify.clearCredentials()', () => {
		it('delegates to the global context', async () => {
			Amplify.configure(mockResourceConfig);

			await expect(Amplify.clearCredentials()).resolves.toBeUndefined();
		});
	});

	describe('Amplify.getTokens()', () => {
		it('delegates to the global context', async () => {
			Amplify.configure(mockResourceConfig);

			const tokens = await Amplify.getTokens({});
			expect(tokens).toBeUndefined();
		});
	});
});
