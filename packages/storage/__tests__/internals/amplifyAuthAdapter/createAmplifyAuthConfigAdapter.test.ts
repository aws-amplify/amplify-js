// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';

import { resolveLocationsForCurrentSession } from '../../../src/internals/amplifyAuthConfigAdapter/resolveLocationsForCurrentSession';
import { createAmplifyAuthConfigAdapter } from '../../../src/internals';

jest.mock('@aws-amplify/core', () => ({
	ConsoleLogger: jest.fn(),
	Amplify: {
		getConfig: jest.fn(),
		Auth: {
			getConfig: jest.fn(),
			fetchAuthSession: jest.fn(),
		},
	},
	fetchAuthSession: jest.fn(),
}));
jest.mock(
	'../../../src/internals/amplifyAuthConfigAdapter/resolveLocationsForCurrentSession',
);

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const identityId = 'identityId';

const mockGetConfig = jest.mocked(Amplify.getConfig);
const mockFetchAuthSession = fetchAuthSession as jest.Mock;
const mockResolveLocationsFromCurrentSession =
	resolveLocationsForCurrentSession as jest.Mock;

describe('createAmplifyAuthConfigAdapter', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	mockGetConfig.mockReturnValue({
		Storage: {
			S3: {
				bucket: 'bucket1',
				region: 'region1',
				buckets: {
					'bucket-1': {
						bucketName: 'bucket-1',
						region: 'region1',
						paths: {},
					},
				},
			},
		},
	});
	mockFetchAuthSession.mockResolvedValue({
		credentials,
		identityId,
		tokens: {
			accessToken: { payload: {} },
		},
	});

	it('should return an AuthConfigAdapter with listLocations function', async () => {
		const adapter = createAmplifyAuthConfigAdapter();
		expect(adapter).toHaveProperty('listLocations');
		const { listLocations } = adapter;
		await listLocations();
		expect(mockFetchAuthSession).toHaveBeenCalled();
	});

	it('should return empty locations when buckets are not defined', async () => {
		mockGetConfig.mockReturnValue({ Storage: { S3: { buckets: undefined } } });

		const adapter = createAmplifyAuthConfigAdapter();
		const result = await adapter.listLocations();

		expect(result).toEqual({ locations: [] });
	});

	it('should generate locations correctly when buckets are defined', async () => {
		const mockBuckets = {
			bucket1: {
				bucketName: 'bucket1',
				region: 'region1',
				paths: {
					'/path1': {
						entityidentity: ['read', 'write'],
						groupsadmin: ['read'],
					},
				},
			},
		};

		mockGetConfig.mockReturnValue({
			Storage: { S3: { buckets: mockBuckets } },
		});
		mockResolveLocationsFromCurrentSession.mockReturnValue([
			{
				type: 'PREFIX',
				permission: ['read', 'write'],
				scope: {
					bucketName: 'bucket1',
					path: '/path1',
				},
			},
		]);

		const adapter = createAmplifyAuthConfigAdapter();
		const result = await adapter.listLocations();

		expect(result).toEqual({
			locations: [
				{
					type: 'PREFIX',
					permission: ['read', 'write'],
					scope: {
						bucketName: 'bucket1',
						path: '/path1',
					},
				},
			],
		});
	});
});
