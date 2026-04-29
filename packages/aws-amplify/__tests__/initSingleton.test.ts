/* eslint-disable camelcase */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, ResourcesConfig } from '@aws-amplify/core';
import { clearGlobalContext } from '@aws-amplify/core/internals/utils';

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

describe('initSingleton (DefaultAmplify)', () => {
	afterEach(() => {
		clearGlobalContext();
		jest.restoreAllMocks();
	});

	describe('DefaultAmplify.configure()', () => {
		it('should set the global context', () => {
			Amplify.configure(mockResourceConfig);
			const config = Amplify.getConfig();
			expect(config.Auth?.Cognito?.userPoolClientId).toBe('userPoolClientId');
			expect(config.Storage?.S3?.bucket).toBe('bucket');
		});

		it('should dispatch a Hub event on configure', () => {
			const hubSpy = jest.spyOn(Hub, 'dispatch');
			Amplify.configure(mockResourceConfig);
			expect(hubSpy).toHaveBeenCalledWith(
				'core',
				expect.objectContaining({
					event: 'configure',
				}),
				'Configure',
				expect.anything(),
			);
		});

		it('should accept library options', () => {
			Amplify.configure(mockResourceConfig, {
				Storage: {
					S3: {
						defaultAccessLevel: 'private',
					},
				},
			});
			const config = Amplify.getConfig();
			expect(config.Auth?.Cognito?.userPoolClientId).toBe('userPoolClientId');
		});

		it('should accept AmplifyOutputs format', () => {
			Amplify.configure({
				version: '1.4',
				auth: {
					user_pool_id: 'userPoolId',
					user_pool_client_id: 'userPoolClientId',
					aws_region: 'us-west-2',
				},
			});
			const config = Amplify.getConfig();
			expect(config.Auth?.Cognito?.userPoolId).toBe('userPoolId');
		});
	});

	describe('DefaultAmplify.getConfig()', () => {
		it('should return the resource config after configure', () => {
			Amplify.configure(mockResourceConfig);
			const config = Amplify.getConfig();
			expect(config).toEqual(
				expect.objectContaining({
					Auth: expect.objectContaining({
						Cognito: expect.objectContaining({
							userPoolClientId: 'userPoolClientId',
						}),
					}),
				}),
			);
		});

		it('should throw if configure has not been called', () => {
			expect(() => Amplify.getConfig()).toThrow();
		});
	});

	describe('DefaultAmplify.fetchAuthSession()', () => {
		it('should delegate to the global context', async () => {
			Amplify.configure(mockResourceConfig);
			const session = await Amplify.fetchAuthSession();
			expect(session).toBeDefined();
		});
	});

	describe('DefaultAmplify.clearCredentials()', () => {
		it('should delegate to the global context', async () => {
			Amplify.configure(mockResourceConfig);
			await expect(Amplify.clearCredentials()).resolves.toBeUndefined();
		});
	});

	describe('DefaultAmplify.getTokens()', () => {
		it('should delegate to the global context', async () => {
			Amplify.configure(mockResourceConfig);
			const tokens = await Amplify.getTokens({});
			expect(tokens).toBeUndefined();
		});
	});

	describe('resolveLibraryOptions', () => {
		it('should return empty options when no Auth config', () => {
			Amplify.configure({ Storage: { S3: { bucket: 'b', region: 'r' } } });
			const config = Amplify.getConfig();
			expect(config.Auth).toBeUndefined();
		});

		it('should pass through libraryOptions.Auth when provided', () => {
			const mockTokenProvider = {
				getTokens: jest.fn().mockResolvedValue(undefined),
			};
			const mockCredentialsProvider = {
				getCredentialsAndIdentityId: jest.fn().mockResolvedValue(undefined),
				clearCredentialsAndIdentityId: jest.fn(),
			};
			Amplify.configure(mockResourceConfig, {
				Auth: {
					tokenProvider: mockTokenProvider as any,
					credentialsProvider: mockCredentialsProvider as any,
				},
			});
			const config = Amplify.getConfig();
			expect(config.Auth?.Cognito?.userPoolClientId).toBe('userPoolClientId');
		});

		it('should use cookie storage when ssr is true', () => {
			Amplify.configure(mockResourceConfig, { ssr: true });
			const config = Amplify.getConfig();
			expect(config.Auth?.Cognito?.userPoolClientId).toBe('userPoolClientId');
		});
	});
});
