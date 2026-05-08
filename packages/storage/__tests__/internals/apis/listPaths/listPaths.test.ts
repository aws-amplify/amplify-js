// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthTokens } from '@aws-amplify/core';

import { resolveLocationsForCurrentSession } from '../../../../src/internals/apis/listPaths/resolveLocationsForCurrentSession';
import { getHighestPrecedenceUserGroup } from '../../../../src/internals/apis/listPaths/getHighestPrecedenceUserGroup';
import { listPaths } from '../../../../src/internals';
import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';

jest.mock(
	'../../../../src/internals/apis/listPaths/resolveLocationsForCurrentSession',
);
jest.mock(
	'../../../../src/internals/apis/listPaths/getHighestPrecedenceUserGroup',
);

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const identityId = 'identityId';

const mockResolveLocationsFromCurrentSession =
	resolveLocationsForCurrentSession as jest.Mock;
const mockGetHighestPrecedenceUserGroup = jest.mocked(
	getHighestPrecedenceUserGroup,
);

const mockAuthConfig = {
	Auth: {
		Cognito: {
			userPoolClientId: 'userPoolClientId',
			userPoolId: 'userPoolId',
			identityPoolId: 'identityPoolId',
			groups: [{ admin: { precedence: 0 } }],
		},
	},
};
const mockBuckets = {
	bucket1: {
		bucketName: 'bucket1',
		region: 'region1',
		paths: {
			'/path1': {
				authenticated: ['read', 'write'],
				groupsadmin: ['read'],
				guest: ['read'],
			},
		},
	},
};

describe('listPaths', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return empty locations when buckets are not defined', async () => {
		const mockCtx = createMockAmplifyContext({
			...mockAuthConfig,
			Storage: { S3: { buckets: undefined } },
		});

		const result = await listPaths(mockCtx);

		expect(result).toEqual({ locations: [] });
	});

	it('should generate locations correctly when buckets are defined', async () => {
		const mockCtx = createMockAmplifyContext({
			...mockAuthConfig,
			Storage: { S3: { buckets: mockBuckets } },
		});
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			credentials,
			identityId,
			tokens: {
				accessToken: { payload: {} },
			},
		});
		mockResolveLocationsFromCurrentSession.mockReturnValue([
			{
				type: 'PREFIX',
				permission: ['read', 'write'],
				bucket: 'bucket1',
				prefix: '/path1',
			},
		]);

		const result = await listPaths(mockCtx);

		expect(result).toEqual({
			locations: [
				{
					type: 'PREFIX',
					permission: ['read', 'write'],
					bucket: 'bucket1',
					prefix: '/path1',
				},
			],
		});
	});

	it('should call resolveLocations with authenticated false for unauthenticated user', async () => {
		const mockCtx = createMockAmplifyContext({
			Auth: {
				Cognito: {
					userPoolClientId: 'userPoolClientId',
					userPoolId: 'userPoolId',
					identityPoolId: 'identityPoolId',
					groups: [{ admin: { precedence: 0 } }],
				},
			},
			Storage: { S3: { buckets: mockBuckets } },
		});
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: undefined,
			identityId: undefined,
		});
		mockResolveLocationsFromCurrentSession.mockReturnValue({
			locations: {
				type: 'PREFIX',
				permission: ['read'],
				bucket: 'bucket1',
				prefix: '/path1',
			},
		});
		await listPaths(mockCtx);

		expect(mockResolveLocationsFromCurrentSession).toHaveBeenCalled();
		expect(mockResolveLocationsFromCurrentSession).toHaveBeenCalledWith({
			buckets: mockBuckets,
			isAuthenticated: false,
			identityId: undefined,
			userGroup: undefined,
		});
	});

	it('should call resolveLocations with right userGroup when provided', async () => {
		const mockCtx = createMockAmplifyContext({
			Auth: {
				Cognito: {
					userPoolClientId: 'userPoolClientId',
					userPoolId: 'userPoolId',
					identityPoolId: 'identityPoolId',
					groups: [{ admin: { precedence: 0 } }],
				},
			},
			Storage: { S3: { buckets: mockBuckets } },
		});
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: {
				accessToken: { payload: {} },
			} as AuthTokens,
			identityId: 'identityId',
		});
		mockGetHighestPrecedenceUserGroup.mockReturnValue('admin');

		await listPaths(mockCtx);

		expect(mockResolveLocationsFromCurrentSession).toHaveBeenCalled();
		expect(mockResolveLocationsFromCurrentSession).toHaveBeenCalledWith({
			buckets: mockBuckets,
			isAuthenticated: true,
			identityId: 'identityId',
			userGroup: 'admin',
		});
	});
});
