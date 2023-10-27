// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig, sharedInMemoryStorage } from '@aws-amplify/core';
import {
	createAWSCredentialsAndIdentityIdProvider,
	createKeyValueStorageFromCookieStorageAdapter,
	createUserPoolsTokenProvider,
	runWithAmplifyServerContext as runWithAmplifyServerContextCore,
} from 'aws-amplify/adapter-core';
import { runWithAmplifyServerContext } from '../src';
import { getAmplifyConfig } from '../src/utils';
import { NextServer } from '../src/types';

const mockAmplifyConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			identityPoolId: '123',
			userPoolId: 'abc',
			userPoolClientId: 'def',
		},
	},
	Storage: {
		S3: {
			bucket: 'bucket',
			region: 'us-east-1',
		},
	},
};

jest.mock('../src/utils', () => ({
	getAmplifyConfig: jest.fn(() => mockAmplifyConfig),
	createCookieStorageAdapterFromNextServerContext: jest.fn(),
}));
jest.mock('aws-amplify/adapter-core');

const mockGetAmplifyConfig = getAmplifyConfig as jest.Mock;
const mockRunWithAmplifyServerContextCore =
	runWithAmplifyServerContextCore as jest.Mock;

const mockCreateAWSCredentialsAndIdentityIdProvider =
	createAWSCredentialsAndIdentityIdProvider as jest.Mock;
const mockCreateKeyValueStorageFromCookieStorageAdapter =
	createKeyValueStorageFromCookieStorageAdapter as jest.Mock;
const mockCreateUserPoolsTokenProvider =
	createUserPoolsTokenProvider as jest.Mock;

describe('runWithAmplifyServerContext', () => {
	it('should call getAmlifyConfig', async () => {
		const operation = jest.fn();
		await runWithAmplifyServerContext({ operation, nextServerContext: null });
		expect(mockGetAmplifyConfig).toHaveBeenCalled();
	});

	describe('when amplifyConfig.Auth is not defined', () => {
		it('should call runWithAmplifyServerContextCore without Auth library options', () => {
			const mockAmplifyConfig: ResourcesConfig = {
				Analytics: {
					Pinpoint: {
						appId: 'app-id',
						region: 'region',
					},
				},
			};
			mockGetAmplifyConfig.mockReturnValueOnce(mockAmplifyConfig);
			const operation = jest.fn();
			runWithAmplifyServerContext({ operation, nextServerContext: null });
			expect(mockRunWithAmplifyServerContextCore).toHaveBeenCalledWith(
				mockAmplifyConfig,
				{},
				operation
			);
		});
	});

	describe('when amplifyConfig.Auth is defined', () => {
		describe('when nextServerContext is null (opt-in unauthenticated role)', () => {
			it('should create auth providers with sharedInMemoryStorage', () => {
				const operation = jest.fn();
				runWithAmplifyServerContext({ operation, nextServerContext: null });
				expect(
					mockCreateAWSCredentialsAndIdentityIdProvider
				).toHaveBeenCalledWith(mockAmplifyConfig.Auth, sharedInMemoryStorage);
				expect(mockCreateUserPoolsTokenProvider).toHaveBeenCalledWith(
					mockAmplifyConfig.Auth,
					sharedInMemoryStorage
				);
			});
		});

		describe('when nextServerContext is not null', () => {
			it('should create auth providers with cookie storage adapter', () => {
				const operation = jest.fn();
				const mockCookieStorageAdapter = {
					get: jest.fn(),
					set: jest.fn(),
					remove: jest.fn(),
				};
				mockCreateKeyValueStorageFromCookieStorageAdapter.mockReturnValueOnce(
					mockCookieStorageAdapter
				);
				const mockNextServerContext = {
					req: {
						headers: {
							cookie: 'cookie',
						},
					},
					res: {
						setHeader: jest.fn(),
					},
				};
				runWithAmplifyServerContext({
					operation,
					nextServerContext:
						mockNextServerContext as unknown as NextServer.Context,
				});
				expect(
					mockCreateAWSCredentialsAndIdentityIdProvider
				).toHaveBeenCalledWith(
					mockAmplifyConfig.Auth,
					mockCookieStorageAdapter
				);
				expect(mockCreateUserPoolsTokenProvider).toHaveBeenCalledWith(
					mockAmplifyConfig.Auth,
					mockCookieStorageAdapter
				);
			});
		});
	});
});
