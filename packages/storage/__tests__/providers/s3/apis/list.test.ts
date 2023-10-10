// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials } from '@aws-sdk/types';
import { Amplify } from '@aws-amplify/core';
import { listObjectsV2 } from '../../../../src/providers/s3/utils/client';
import { list } from '../../../../src/providers/s3';
import {
	ListAllOptions,
	ListPaginateOptions,
} from '../../../../src/providers/s3/types';

jest.mock('../../../../src/providers/s3/utils/client');
jest.mock('@aws-amplify/core', () => ({
	Amplify: {
		getConfig: jest.fn(),
		Auth: {
			fetchAuthSession: jest.fn(),
		},
	},
}));
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;
const mockListObject = listObjectsV2 as jest.Mock;
const key = 'path/itemsKey';
const path = key;
const bucket = 'bucket';
const region = 'region';
const nextToken = 'nextToken';
const targetIdentityId = 'targetIdentityId';
const defaultIdentityId = 'defaultIdentityId';
const eTag = 'eTag';
const lastModified = 'lastModified';
const size = 'size';
const credentials: Credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const listObjectClientConfig = {
	credentials,
	region,
	userAgentValue: expect.any(String)
};
const listObjectClientBaseResultItem = {
	ETag: eTag,
	LastModified: lastModified,
	Size: size,
};
const listResultItem = {
	eTag,
	lastModified,
	size,
};
const mockListObjectsV2ApiWithPages = pages => {
	let methodCalls = 0;
	mockListObject.mockClear();
	mockListObject.mockImplementation(async (_, input) => {
		let token: string | undefined = undefined;
		methodCalls++;
		if (methodCalls > pages) {
			fail(`listObjectsV2 calls are more than expected. Expected ${pages}`);
		}
		if (input.ContinuationToken === undefined || methodCalls < pages) {
			token = nextToken;
		}
		return {
			Contents: [{ ...listObjectClientBaseResultItem, Key: input.Prefix }],
			NextContinuationToken: token,
		};
	});
};

describe('list API', () => {
	beforeAll(() => {
		mockFetchAuthSession.mockResolvedValue({
			credentials,
			identityId: defaultIdentityId,
		});
		mockGetConfig.mockReturnValue({
			Storage: {
				S3: {
					bucket,
					region,
				},
			},
		});
	});
	describe('Happy Cases:', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		const accessLevelTests = [
			{
				expectedPath: `public/`,
			},
			{
				path,
				expectedPath: `public/${path}`,
			},
			{
				path,
				options: { accessLevel: 'guest' },
				expectedPath: `public/${path}`,
			},
			{
				path,
				options: { accessLevel: 'private' },
				expectedPath: `private/${defaultIdentityId}/${path}`,
			},
			{
				path,
				options: { accessLevel: 'protected' },
				expectedPath: `protected/${defaultIdentityId}/${path}`,
			},
			{
				path,
				options: { accessLevel: 'protected', targetIdentityId },
				expectedPath: `protected/${targetIdentityId}/${path}`,
			},
		];

		accessLevelTests.forEach(({ path, options, expectedPath }) => {
			const pathMsg = path ? 'custom' : 'default';
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `with targetIdentityId`
				: '';
			it(`should list objects with pagination, default pageSize, ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				mockListObject.mockImplementationOnce(() => {
					return {
						Contents: [
							{ ...listObjectClientBaseResultItem, Key: expectedPath },
						],
						NextContinuationToken: nextToken,
					};
				});
				expect.assertions(4);
				let response = await list({
					prefix: path,
					options: options as ListPaginateOptions,
				});
				expect(response.items).toEqual([
					{ ...listResultItem, key: path ?? '' },
				]);
				expect(response.nextToken).toEqual(nextToken);
				expect(listObjectsV2).toBeCalledTimes(1);
				expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: expectedPath,
				});
			});
		});

		accessLevelTests.forEach(({ path, options, expectedPath }) => {
			const pathMsg = path ? 'custom' : 'default';
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `with targetIdentityId`
				: '';
			it(`should list objects with pagination using pageSize, nextToken, ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				mockListObject.mockImplementationOnce(() => {
					return {
						Contents: [
							{ ...listObjectClientBaseResultItem, Key: expectedPath },
						],
						NextContinuationToken: nextToken,
					};
				});
				expect.assertions(4);
				const customPageSize = 5;
				const response = await list({
					prefix: path,
					options: {
						...(options as ListPaginateOptions),
						pageSize: customPageSize,
						nextToken: nextToken,
					},
				});
				expect(response.items).toEqual([
					{ ...listResultItem, key: path ?? '' },
				]);
				expect(response.nextToken).toEqual(nextToken);
				expect(listObjectsV2).toBeCalledTimes(1);
				expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
					Bucket: bucket,
					Prefix: expectedPath,
					ContinuationToken: nextToken,
					MaxKeys: customPageSize,
				});
			});
		});

		accessLevelTests.forEach(({ path, options, expectedPath }) => {
			const pathMsg = path ? 'custom' : 'default';
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `with targetIdentityId`
				: '';
			it(`should list objects with zero results with ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				mockListObject.mockImplementationOnce(() => {
					return {};
				});
				expect.assertions(3);
				let response = await list({
					prefix: path,
					options: options as ListPaginateOptions,
				});
				expect(response.items).toEqual([]);
				//
				expect(response.nextToken).toEqual(undefined);
				expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: expectedPath,
				});
			});
		});

		accessLevelTests.forEach(({ path, options, expectedPath }) => {
			const pathMsg = path ? 'custom' : 'default';
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `with targetIdentityId`
				: '';
			it(`should list all objects having three pages with ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				expect.assertions(5);
				mockListObjectsV2ApiWithPages(3);
				const result = await list({
					prefix: path,
					options: { ...options, listAll: true } as ListAllOptions,
				});

				const listResult = { ...listResultItem, key: path ?? '' };
				expect(result.items).toEqual([listResult, listResult, listResult]);
				expect(result).not.toHaveProperty(nextToken);

				// listing three times for three pages
				expect(listObjectsV2).toHaveBeenCalledTimes(3);

				// first input recieves undefined as the Continuation Token
				expect(listObjectsV2).toHaveBeenNthCalledWith(
					1,
					listObjectClientConfig,
					{
						Bucket: bucket,
						Prefix: expectedPath,
						MaxKeys: 1000,
						ContinuationToken: undefined,
					}
				);
				// last input recieves TEST_TOKEN as the Continuation Token
				expect(listObjectsV2).toHaveBeenNthCalledWith(
					3,
					listObjectClientConfig,
					{
						Bucket: bucket,
						Prefix: expectedPath,
						MaxKeys: 1000,
						ContinuationToken: nextToken,
					}
				);
			});
		});
	});

	describe('Error Cases:', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('should return a not found error', async () => {
			mockListObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				})
			);
			expect.assertions(3);
			try {
				await list({});
			} catch (error) {
				expect(listObjectsV2).toBeCalledTimes(1);
				expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: 'public/',
				});
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});
	});
});
