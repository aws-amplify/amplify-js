// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { createStorageConfiguration } from '../../../../../src/providers/s3/utils';

jest.mock('@aws-amplify/core', () => ({
	ConsoleLogger: jest.fn().mockImplementation(function ConsoleLogger() {
		return { debug: jest.fn() };
	}),
	Amplify: {
		getConfig: jest.fn(),
		Auth: {
			fetchAuthSession: jest.fn(),
		},
	},
}));
const mockedBucket = 'mock-bucket';
const mockedRegion = 'mock-region';
const mockPermission = 'READ';
const mockedPath = 'path';
const mockGetConfig = jest.mocked(Amplify.getConfig);
const mockLocationCredentialsProvider = jest.fn();
const STORAGE_CONFIG_ERROR_MESSAGE = 'Storage configuration is required.';
const STORAGE_PATH_ERROR_MESSAGE = 'path option needs to be a string';

describe('createStorageConfiguration', () => {
	const mockAmplify = Amplify;

	beforeEach(() => {
		mockGetConfig.mockReturnValue({
			Storage: {
				S3: {
					bucket: mockedBucket,
					region: mockedRegion,
				},
			},
		});
	});

	afterEach(() => {
		mockGetConfig.mockReset();
	});

	it('should resolve Storage service options from API input', () => {
		const apiInput = {
			options: {
				bucket: mockedBucket,
				region: mockedRegion,
			},
		};
		const config = createStorageConfiguration(
			mockAmplify,
			apiInput,
			mockPermission,
		);
		expect(config).toMatchObject({
			bucket: mockedBucket,
			region: mockedRegion,
			credentialsProvider: expect.any(Function),
			identityIdProvider: expect.any(Function),
		});
	});

	it('should resolve Storage service options from Amplify singleton', () => {
		const config = createStorageConfiguration(mockAmplify, {}, mockPermission);
		expect(config).toMatchObject({
			bucket: mockedBucket,
			region: mockedRegion,
			credentialsProvider: expect.any(Function),
			identityIdProvider: expect.any(Function),
		});
	});

	it('should throw if Storage service options are not resolved from API input and Amplify singleton', () => {
		mockGetConfig.mockReturnValue({});
		expect(() =>
			createStorageConfiguration(mockAmplify, {}, mockPermission),
		).toThrow(STORAGE_CONFIG_ERROR_MESSAGE);
	});

	it('should create a custom credentials provider if locationCredentialsProvider is defined', () => {
		const apiInput = {
			path: mockedPath,
			options: {
				bucket: mockedBucket,
				region: mockedRegion,
				locationCredentialsProvider: mockLocationCredentialsProvider,
			},
		};
		const config = createStorageConfiguration(
			mockAmplify,
			apiInput,
			mockPermission,
		);
		expect(config.credentialsProvider).not.toBe(expect.any(Function));
	});

	it('should throw if bucket is undefined when creating a custom credentials provider', () => {
		mockGetConfig.mockReturnValue({
			Storage: {
				S3: {
					bucket: undefined,
					region: mockedRegion,
				},
			},
		});
		const apiInput = {
			path: mockedPath,
			options: {
				region: mockedRegion,
				locationCredentialsProvider: mockLocationCredentialsProvider,
			},
		};
		expect(() =>
			createStorageConfiguration(mockAmplify, apiInput, mockPermission),
		).toThrow(STORAGE_CONFIG_ERROR_MESSAGE);
	});

	it('should throw if path is undefined when creating a custom credentials provider', () => {
		const apiInput = {
			options: {
				bucket: mockedBucket,
				region: mockedRegion,
				locationCredentialsProvider: jest.fn(),
			},
		};
		expect(() =>
			createStorageConfiguration(mockAmplify, apiInput, mockPermission),
		).toThrow(STORAGE_PATH_ERROR_MESSAGE);
	});

	it('should throw if path is a function when creating a custom credentials provider', () => {
		const apiInput = {
			path: jest.fn(),
			options: {
				bucket: mockedBucket,
				region: mockedRegion,
				locationCredentialsProvider: jest.fn(),
			},
		};
		expect(() =>
			createStorageConfiguration(mockAmplify, apiInput, mockPermission),
		).toThrow(STORAGE_PATH_ERROR_MESSAGE);
	});

	it('should create paths if API input has a path when creating a custom credentials provider', () => {
		const apiInput = {
			path: 'mock-path',
			options: {
				bucket: mockedBucket,
				region: mockedRegion,
				locationCredentialsProvider: mockLocationCredentialsProvider,
			},
		};
		const config = createStorageConfiguration(
			mockAmplify,
			apiInput,
			mockPermission,
		);
		expect(config.credentialsProvider).toBeInstanceOf(Function);
	});

	it('should create paths if API input has source and destination when creating a custom credentials provider', () => {
		const apiInput = {
			source: { path: 'source-path' },
			destination: { path: 'destination-path' },
			options: {
				bucket: mockedBucket,
				region: mockedRegion,
				locationCredentialsProvider: mockLocationCredentialsProvider,
			},
		};
		const config = createStorageConfiguration(
			mockAmplify,
			apiInput,
			mockPermission,
		);
		expect(config.credentialsProvider).toBeInstanceOf(Function);
	});

	it('should create a default credentials provider if locationCredentialsProvider is not defined and Storage config is passed in the input', () => {
		const apiInput = {
			options: {
				bucket: mockedBucket,
				region: mockedRegion,
			},
		};
		const config = createStorageConfiguration(
			mockAmplify,
			apiInput,
			mockPermission,
		);
		expect(config.credentialsProvider).toBeInstanceOf(Function);
	});

	it('should create a default credentials provider if locationCredentialsProvider is not defined and Storage config is not passed in the input', () => {
		const apiInput = {};
		const config = createStorageConfiguration(
			mockAmplify,
			apiInput,
			mockPermission,
		);
		expect(config.credentialsProvider).toBeInstanceOf(Function);
	});

	it('should not throw if path is a function when creating a default credentials provider', () => {
		const apiInput = {
			path: jest.fn(),
		};
		expect(() =>
			createStorageConfiguration(mockAmplify, apiInput, mockPermission),
		).not.toThrow();
	});
});
