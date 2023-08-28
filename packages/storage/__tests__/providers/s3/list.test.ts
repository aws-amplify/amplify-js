// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials } from '@aws-sdk/types';
import { Amplify } from '@aws-amplify/core';
import { list } from '../../../src/providers/s3/apis';
import { listObjectsV2 } from '../../../src/providers/s3/utils/client';

jest.mock('../../../src/providers/s3/utils/client');
jest.mock('@aws-amplify/core', () => {
	const core = jest.requireActual('@aws-amplify/core');
	return {
		...core,
		fetchAuthSession: jest.fn(),
		Amplify: {
			...core.Amplify,
			getConfig: jest.fn(),
			Auth: {
				...core.Amplify.Auth,
				fetchAuthSession: jest.fn(),
			},
		},
	};
});
const mockListObject = listObjectsV2 as jest.Mock;
const key = 'path/itemsKey';
const bucket = 'bucket';
const region = 'region';
const nextToken = 'nextToken';
const targetIdentityId = 'targetIdentityId';
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
};
const listObjectClientBaseResultItem = {
	ETag: eTag,
	LastModified: lastModified,
	Size: size,
};
const copyResultItem = {
	key,
	eTag,
	lastModified,
	size,
};

const listResultObj = {
	...listObjectClientBaseResultItem,
	Key: `public/${key}`,
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
		if (input.Prefix === 'public/listALLResultsPath') {
			return {
				Contents: [listResultObj],
				NextContinuationToken: token,
			};
		}
	});
};

// TODO(ashwinkumar6) this currently only tests for guest
// Update to test across all accessLevels
describe('list API', () => {
	beforeAll(() => {
		(Amplify.Auth.fetchAuthSession as jest.Mock).mockResolvedValue({
			credentials,
			identityId: targetIdentityId,
		});
		(Amplify.getConfig as jest.Mock).mockReturnValue({
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

		it('Should list objects with default params', async () => {
			mockListObject.mockImplementationOnce(() => {
				return {
					Contents: [listResultObj],
					NextContinuationToken: nextToken,
				};
			});

			expect.assertions(4);
			let response = await list();
			expect(response.items).toEqual([copyResultItem]);
			expect(response.nextToken).toEqual(nextToken);
			expect(listObjectsV2).toBeCalledTimes(1);
			expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
				Bucket: bucket,
				MaxKeys: 1000,
				Prefix: 'public/',
			});
		});

		it('Should list object with pagination using pageSize and nextToken', async () => {
			mockListObject.mockImplementationOnce(() => {
				return {
					Contents: [listResultObj],
					NextContinuationToken: nextToken,
				};
			});

			expect.assertions(4);
			const customPageSize = 5;
			const response = await list({
				path: 'listWithTokenResultsPath',
				options: {
					accessLevel: 'guest',
					pageSize: customPageSize,
					nextToken: nextToken,
				},
			});
			expect(response.items).toEqual([copyResultItem]);
			expect(response.nextToken).toEqual(nextToken);
			expect(listObjectsV2).toBeCalledTimes(1);
			expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
				Bucket: bucket,
				Prefix: 'public/listWithTokenResultsPath',
				ContinuationToken: nextToken,
				MaxKeys: customPageSize,
			});
		});

		it('Should list all objects successfully having three pages', async () => {
			expect.assertions(5);
			mockListObjectsV2ApiWithPages(3);

			const result = await list({
				path: 'listALLResultsPath',
				options: { accessLevel: 'guest', listAll: true },
			});

			expect(result.items).toEqual([
				copyResultItem,
				copyResultItem,
				copyResultItem,
			]);
			expect(result).not.toHaveProperty(nextToken);

			// listing three times for three pages
			expect(listObjectsV2).toHaveBeenCalledTimes(3);

			// first input recieves undefined as the Continuation Token
			expect(listObjectsV2).toHaveBeenNthCalledWith(1, listObjectClientConfig, {
				Bucket: bucket,
				Prefix: 'public/listALLResultsPath',
				MaxKeys: 1000,
				ContinuationToken: undefined,
			});
			// last input recieves TEST_TOKEN as the Continuation Token
			expect(listObjectsV2).toHaveBeenNthCalledWith(3, listObjectClientConfig, {
				Bucket: bucket,
				Prefix: 'public/listALLResultsPath',
				MaxKeys: 1000,
				ContinuationToken: nextToken,
			});
		});

		it('Should list objects with zero results', async () => {
			mockListObject.mockImplementationOnce(() => {
				return {};
			});

			expect.assertions(3);
			let response = await list({
				path: 'emptyListResultsPath',
				options: {
					accessLevel: 'guest',
				},
			});
			expect(response.items).toEqual([]);
			expect(response.nextToken).toEqual(undefined);
			expect(listObjectsV2).toHaveBeenCalledWith(listObjectClientConfig, {
				Bucket: bucket,
				MaxKeys: 1000,
				Prefix: 'public/emptyListResultsPath',
			});
		});
	});

	describe('Error Cases:', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('Should return a not found error', async () => {
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
