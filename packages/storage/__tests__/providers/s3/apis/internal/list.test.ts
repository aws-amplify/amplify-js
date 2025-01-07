// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify, StorageAccessLevel } from '@aws-amplify/core';

import { listObjectsV2 } from '../../../../../src/providers/s3/utils/client/s3data';
import { list } from '../../../../../src/providers/s3/apis/internal/list';
import {
	ListAllInput,
	ListAllWithPathInput,
	ListAllWithPathOutput,
	ListPaginateInput,
	ListPaginateOutput,
	ListPaginateWithPathInput,
	ListPaginateWithPathOutput,
} from '../../../../../src/providers/s3/types';
import './testUtils';
import { ListObjectsV2CommandInput } from '../../../../../src/providers/s3/utils/client/s3data/types';

jest.mock('../../../../../src/providers/s3/utils/client/s3data');
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
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;
const mockGetConfig = jest.mocked(Amplify.getConfig);
const mockListObject = listObjectsV2 as jest.Mock;
const inputKey = 'path/itemsKey';
const bucket = 'bucket';
const region = 'region';
const nextToken = 'nextToken';
const targetIdentityId = 'targetIdentityId';
const defaultIdentityId = 'defaultIdentityId';
const etagValue = 'eTag';
const lastModifiedValue = 'lastModified';
const sizeValue = 'size';
const validBucketOwner = '111122223333';
const credentials: AWSCredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const listObjectClientConfig = {
	credentials,
	region,
	userAgentValue: expect.any(String),
};
const listObjectClientBaseResultItem = {
	ETag: etagValue,
	LastModified: lastModifiedValue,
	Size: sizeValue,
};
const listResultItem = {
	eTag: etagValue,
	lastModified: lastModifiedValue,
	size: sizeValue,
};
const mockListObjectsV2ApiWithPages = (pages: number) => {
	let methodCalls = 0;
	mockListObject.mockClear();
	mockListObject.mockImplementation(async (_, input) => {
		let token: string | undefined;
		methodCalls++;
		if (methodCalls > pages) {
			fail(`listObjectsV2 calls are more than expected. Expected ${pages}`);
		}
		if (input.ContinuationToken === undefined || methodCalls < pages) {
			token = nextToken;
		}

		return {
			...mockListResponse(input),
			Contents: [{ ...listObjectClientBaseResultItem, Key: input.Prefix }],
			NextContinuationToken: token,
		};
	});
};
const mockListResponse = (listParams: ListObjectsV2CommandInput) => ({
	Name: listParams.Bucket,
	Delimiter: listParams.Delimiter,
	MaxKeys: listParams.MaxKeys,
	Prefix: listParams.Prefix,
	ContinuationToken: listParams.ContinuationToken,
});

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
					buckets: { 'default-bucket': { bucketName: bucket, region } },
				},
			},
		});
	});
	describe('Prefix: Happy Cases:', () => {
		const listAllWrapper = (input: ListAllInput) => list(Amplify, input);
		const listPaginatedWrapper = (input: ListPaginateInput) =>
			list(Amplify, input);
		afterEach(() => {
			jest.clearAllMocks();
		});

		const accessLevelTests: {
			prefix?: string;
			expectedKey: string;
			options?: {
				accessLevel?: StorageAccessLevel;
				targetIdentityId?: string;
			};
		}[] = [
			{
				expectedKey: `public/`,
			},
			{
				options: { accessLevel: 'guest' },
				expectedKey: `public/`,
			},
			{
				prefix: inputKey,
				expectedKey: `public/${inputKey}`,
			},
			{
				prefix: inputKey,
				options: { accessLevel: 'guest' },
				expectedKey: `public/${inputKey}`,
			},
			{
				prefix: inputKey,
				options: { accessLevel: 'private' },
				expectedKey: `private/${defaultIdentityId}/${inputKey}`,
			},
			{
				prefix: inputKey,
				options: { accessLevel: 'protected' },
				expectedKey: `protected/${defaultIdentityId}/${inputKey}`,
			},
			{
				prefix: inputKey,
				options: { accessLevel: 'protected', targetIdentityId },
				expectedKey: `protected/${targetIdentityId}/${inputKey}`,
			},
		];

		accessLevelTests.forEach(({ prefix, options, expectedKey }) => {
			const pathMsg = prefix ? 'custom' : 'default';
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `with targetIdentityId`
				: '';
			it(`should list objects with pagination, default pageSize, ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				mockListObject.mockImplementationOnce((_, listParams) => {
					return {
						...mockListResponse(listParams),
						Contents: [{ ...listObjectClientBaseResultItem, Key: expectedKey }],
						NextContinuationToken: nextToken,
					};
				});
				const response = (await listPaginatedWrapper({
					prefix,
					options,
				})) as ListPaginateOutput;
				const { key, eTag, size, lastModified } = response.items[0];
				expect(response.items).toHaveLength(1);
				expect({ key, eTag, size, lastModified }).toEqual({
					key: prefix ?? '',
					...listResultItem,
				});
				expect(response.nextToken).toEqual(nextToken);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					listObjectClientConfig,
					expect.objectContaining({
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: expectedKey,
					}),
				);
			});
		});

		accessLevelTests.forEach(({ prefix, options, expectedKey }) => {
			const pathMsg = prefix ? 'custom' : 'default';
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `with targetIdentityId`
				: '';
			it(`should list objects with pagination using pageSize, nextToken, ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				mockListObject.mockImplementationOnce((_, listParams) => {
					return {
						...mockListResponse(listParams),
						Contents: [{ ...listObjectClientBaseResultItem, Key: expectedKey }],
						NextContinuationToken: nextToken,
					};
				});
				const customPageSize = 5;
				const response = (await listPaginatedWrapper({
					prefix,
					options: {
						...options,
						pageSize: customPageSize,
						nextToken,
					},
				})) as ListPaginateOutput;
				const { key, eTag, size, lastModified } = response.items[0];
				expect(response.items).toHaveLength(1);
				expect({ key, eTag, size, lastModified }).toEqual({
					key: prefix ?? '',
					...listResultItem,
				});
				expect(response.nextToken).toEqual(nextToken);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					listObjectClientConfig,
					expect.objectContaining({
						Bucket: bucket,
						Prefix: expectedKey,
						ContinuationToken: nextToken,
						MaxKeys: customPageSize,
					}),
				);
			});
		});

		accessLevelTests.forEach(({ prefix, options, expectedKey }) => {
			const pathMsg = prefix ? 'custom' : 'default';
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `with targetIdentityId`
				: '';
			it(`should list objects with zero results with ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				mockListObject.mockImplementationOnce((_, listParams) => {
					return {
						...mockListResponse(listParams),
						IsTruncated: false,
						KeyCount: 0,
					};
				});
				const response = (await listPaginatedWrapper({
					prefix,
					options,
				})) as ListPaginateOutput;
				expect(response.items).toEqual([]);

				expect(response.nextToken).toEqual(undefined);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					listObjectClientConfig,
					expect.objectContaining({
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: expectedKey,
					}),
				);
			});
		});

		accessLevelTests.forEach(
			({ prefix: inputPrefix, options, expectedKey }) => {
				const pathMsg = inputPrefix ? 'custom' : 'default';
				const accessLevelMsg = options?.accessLevel ?? 'default';
				const targetIdentityIdMsg = options?.targetIdentityId
					? `with targetIdentityId`
					: '';
				it(`should list all objects having three pages with ${pathMsg} path, ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
					mockListObjectsV2ApiWithPages(3);
					const result = (await listAllWrapper({
						prefix: inputPrefix,
						options: { ...options, listAll: true },
					})) as ListPaginateOutput;
					const { key, eTag, lastModified, size } = result.items[0];
					expect(result.items).toHaveLength(3);
					expect({ key, eTag, lastModified, size }).toEqual({
						...listResultItem,
						key: inputPrefix ?? '',
					});
					expect(result).not.toHaveProperty(nextToken);

					// listing three times for three pages
					expect(listObjectsV2).toHaveBeenCalledTimes(3);

					// first input receives undefined as the Continuation Token
					await expect(listObjectsV2).toHaveBeenNthCalledWithConfigAndInput(
						1,
						listObjectClientConfig,
						expect.objectContaining({
							Bucket: bucket,
							Prefix: expectedKey,
							MaxKeys: 1000,
							ContinuationToken: undefined,
						}),
					);
					// last input receives TEST_TOKEN as the Continuation Token
					await expect(listObjectsV2).toHaveBeenNthCalledWithConfigAndInput(
						3,
						listObjectClientConfig,
						expect.objectContaining({
							Bucket: bucket,
							Prefix: expectedKey,
							MaxKeys: 1000,
							ContinuationToken: nextToken,
						}),
					);
				});
			},
		);

		describe('bucket passed in options', () => {
			it('should override bucket in listObject call when bucket is object', async () => {
				mockListObject.mockImplementationOnce((_, listParams) => {
					return {
						...mockListResponse(listParams),
						Contents: [
							{
								...listObjectClientBaseResultItem,
								Key: listParams.Prefix + inputKey,
							},
						],
						NextContinuationToken: nextToken,
					};
				});
				const mockBucketName = 'bucket-1';
				const mockRegion = 'region-1';
				await listPaginatedWrapper({
					prefix: inputKey,
					options: {
						bucket: { bucketName: mockBucketName, region: mockRegion },
					},
				});
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					{
						credentials,
						region: mockRegion,
						userAgentValue: expect.any(String),
					},
					expect.objectContaining({
						Bucket: mockBucketName,
						MaxKeys: 1000,
						Prefix: `public/${inputKey}`,
					}),
				);
			});

			it('should override bucket in listObject call when bucket is string', async () => {
				mockListObject.mockImplementationOnce((_, listParams) => {
					return {
						...mockListResponse(listParams),
						Contents: [
							{
								...listObjectClientBaseResultItem,
								Key: listParams.Prefix + inputKey,
							},
						],
						NextContinuationToken: nextToken,
					};
				});
				await listPaginatedWrapper({
					prefix: inputKey,
					options: {
						bucket: 'default-bucket',
					},
				});
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					{
						credentials,
						region,
						userAgentValue: expect.any(String),
					},
					expect.objectContaining({
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: `public/${inputKey}`,
					}),
				);
			});
		});
	});

	describe('Path: Happy Cases:', () => {
		const listAllWrapper = (input: ListAllWithPathInput) =>
			list(Amplify, input);
		const listPaginatedWrapper = (input: ListPaginateWithPathInput) =>
			list(Amplify, input);
		const resolvePath = (
			path: string | (({ identityId }: { identityId: string }) => string),
		) =>
			typeof path === 'string' ? path : path({ identityId: defaultIdentityId });
		afterEach(() => {
			jest.clearAllMocks();
			mockListObject.mockClear();
		});
		const pathTestCases = [
			{
				path: `public/${inputKey}`,
			},
			{
				path: ({ identityId }: { identityId: string }) =>
					`protected/${identityId}/${inputKey}`,
			},
		];

		it.each(pathTestCases)(
			'should list objects with pagination, default pageSize, custom path',
			async ({ path: inputPath }) => {
				const resolvedPath = resolvePath(inputPath);
				mockListObject.mockImplementationOnce((_, listParams) => {
					return {
						...mockListResponse(listParams),
						Contents: [
							{
								...listObjectClientBaseResultItem,
								Key: resolvePath(inputPath),
							},
						],
						NextContinuationToken: nextToken,
					};
				});
				const response = (await listPaginatedWrapper({
					path: resolvedPath,
				})) as ListPaginateWithPathOutput;
				const { path, eTag, lastModified, size } = response.items[0];
				expect(response.items).toHaveLength(1);
				expect({ path, eTag, lastModified, size }).toEqual({
					...listResultItem,
					path: resolvedPath,
				});
				expect(response.nextToken).toEqual(nextToken);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					listObjectClientConfig,
					expect.objectContaining({
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: resolvePath(inputPath),
					}),
				);
			},
		);

		it.each(pathTestCases)(
			'should list objects with pagination using custom pageSize, nextToken and custom path: $path',
			async ({ path: inputPath }) => {
				const resolvedPath = resolvePath(inputPath);
				mockListObject.mockImplementationOnce((_, listParams) => {
					return {
						...mockListResponse(listParams),
						Contents: [
							{
								...listObjectClientBaseResultItem,
								Key: resolvePath(inputPath),
							},
						],
						NextContinuationToken: nextToken,
					};
				});
				const customPageSize = 5;
				const response = (await listPaginatedWrapper({
					path: resolvedPath,
					options: {
						pageSize: customPageSize,
						nextToken,
					},
				})) as ListPaginateWithPathOutput;
				const { path, eTag, lastModified, size } = response.items[0];
				expect(response.items).toHaveLength(1);
				expect({ path, eTag, lastModified, size }).toEqual({
					...listResultItem,
					path: resolvedPath,
				});
				expect(response.nextToken).toEqual(nextToken);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					listObjectClientConfig,
					expect.objectContaining({
						Bucket: bucket,
						Prefix: resolvePath(inputPath),
						ContinuationToken: nextToken,
						MaxKeys: customPageSize,
					}),
				);
			},
		);

		it.each(pathTestCases)(
			'should list objects with zero results with custom path: $path',
			async ({ path }) => {
				mockListObject.mockImplementationOnce((_, listParams) => {
					return {
						...mockListResponse(listParams),
						IsTruncated: false,
						KeyCount: 0,
					};
				});
				const response = (await listPaginatedWrapper({
					path: resolvePath(path),
				})) as ListPaginateWithPathOutput;
				expect(response.items).toEqual([]);

				expect(response.nextToken).toEqual(undefined);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					listObjectClientConfig,
					expect.objectContaining({
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: resolvePath(path),
					}),
				);
			},
		);

		it.each(pathTestCases)(
			'should list all objects having three pages with custom path: $path',
			async ({ path: inputPath }) => {
				const resolvedPath = resolvePath(inputPath);
				mockListObjectsV2ApiWithPages(3);
				const result = (await listAllWrapper({
					path: resolvedPath,
					options: { listAll: true },
				})) as ListPaginateWithPathOutput;

				const listResult = {
					path: resolvedPath,
					...listResultItem,
				};
				const { path, lastModified, eTag, size } = result.items[0];
				expect(result.items).toHaveLength(3);
				expect({ path, lastModified, eTag, size }).toEqual(listResult);
				expect(result.items).toEqual([listResult, listResult, listResult]);
				expect(result).not.toHaveProperty(nextToken);

				// listing three times for three pages
				expect(listObjectsV2).toHaveBeenCalledTimes(3);

				// first input receives undefined as the Continuation Token
				await expect(listObjectsV2).toHaveBeenNthCalledWithConfigAndInput(
					1,
					listObjectClientConfig,
					expect.objectContaining({
						Bucket: bucket,
						Prefix: resolvedPath,
						MaxKeys: 1000,
						ContinuationToken: undefined,
					}),
				);
				// last input receives TEST_TOKEN as the Continuation Token
				await expect(listObjectsV2).toHaveBeenNthCalledWithConfigAndInput(
					3,
					listObjectClientConfig,
					expect.objectContaining({
						Bucket: bucket,
						Prefix: resolvedPath,
						MaxKeys: 1000,
						ContinuationToken: nextToken,
					}),
				);
			},
		);

		describe('bucket passed in options', () => {
			it('should override bucket in listObject call when bucket is object', async () => {
				mockListObject.mockImplementationOnce((_, listParams) => {
					return {
						...mockListResponse(listParams),
						Contents: [
							{
								...listObjectClientBaseResultItem,
								Key: 'path/',
							},
						],
						NextContinuationToken: nextToken,
					};
				});
				const mockBucketName = 'bucket-1';
				const mockRegion = 'region-1';
				await listPaginatedWrapper({
					path: 'path/',
					options: {
						bucket: { bucketName: mockBucketName, region: mockRegion },
					},
				});
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					{
						credentials,
						region: mockRegion,
						userAgentValue: expect.any(String),
					},
					expect.objectContaining({
						Bucket: mockBucketName,
						MaxKeys: 1000,
						Prefix: 'path/',
					}),
				);
			});

			it('should override bucket in listObject call when bucket is string', async () => {
				mockListObject.mockImplementationOnce((_, listParams) => {
					return {
						...mockListResponse(listParams),
						Contents: [
							{
								...listObjectClientBaseResultItem,
								Key: 'path/',
							},
						],
						NextContinuationToken: nextToken,
					};
				});
				await listPaginatedWrapper({
					path: 'path/',
					options: {
						bucket: 'default-bucket',
					},
				});
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					{
						credentials,
						region,
						userAgentValue: expect.any(String),
					},
					expect.objectContaining({
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: 'path/',
					}),
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
				}),
			);
			try {
				await list(Amplify, {});
			} catch (error: any) {
				expect.assertions(3);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					listObjectClientConfig,
					expect.objectContaining({
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: 'public/',
					}),
				);
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});

		describe.each([
			{
				type: 'Prefix',
				mockListFunction: () => list(Amplify, { prefix: 'test/' }),
			},
			{
				type: 'Path',
				mockListFunction: () => list(Amplify, { path: 'test/' }),
			},
		])('$type response validation check', ({ mockListFunction }) => {
			it.each([
				{
					name: 'missing Delimiter echo',
					override: { Delimiter: 'mock-invalid-value' },
				},
				{
					name: 'missing MaxKeys echo',
					override: { MaxKeys: 'mock-invalid-value' },
				},
				{
					name: 'missing Prefix echo',
					override: { Prefix: 'mock-invalid-value' },
				},
				{
					name: 'missing ContinuationToken echo',
					override: { ContinuationToken: 'mock-invalid-value' },
				},
			])('should throw with $name', async ({ override }) => {
				mockListObject.mockImplementationOnce((_, listParams) => {
					return {
						...mockListResponse(listParams),
						...override,
					};
				});

				await expect(mockListFunction()).rejects.toThrow(
					'An unknown error has occurred.',
				);
			});
		});
	});

	describe('with delimiter', () => {
		const mockedContents = [
			{
				Key: 'photos/',
				...listObjectClientBaseResultItem,
			},
			{
				Key: 'photos/2023.png',
				...listObjectClientBaseResultItem,
			},
			{
				Key: 'photos/2024.png',
				...listObjectClientBaseResultItem,
			},
		];
		const mockedCommonPrefixes = [
			{ Prefix: 'photos/2023/' },
			{ Prefix: 'photos/2024/' },
			{ Prefix: 'photos/2025/' },
		];

		const expectedExcludedSubpaths = mockedCommonPrefixes.map(
			({ Prefix }) => Prefix,
		);

		const mockedPath = 'photos/';

		beforeEach(() => {
			mockListObject.mockImplementationOnce((_, listParams) => {
				return {
					...mockListResponse(listParams),
					CommonPrefixes: mockedCommonPrefixes,
					Contents: mockedContents,
					NextContinuationToken: nextToken,
					KeyCount: 3,
				};
			});
		});
		afterEach(() => {
			jest.clearAllMocks();
			mockListObject.mockClear();
		});

		it('should return excludedSubpaths when "exclude" strategy is passed in the request', async () => {
			const { items, excludedSubpaths } = (await list(Amplify, {
				path: mockedPath,
				options: {
					subpathStrategy: { strategy: 'exclude' },
				},
			})) as ListPaginateWithPathOutput;

			expect(items).toHaveLength(3);
			expect(excludedSubpaths).toEqual(expectedExcludedSubpaths);
			expect(listObjectsV2).toHaveBeenCalledTimes(1);
			await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
				listObjectClientConfig,
				expect.objectContaining({
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: mockedPath,
					Delimiter: '/',
				}),
			);
		});

		it('should return excludedSubpaths when "exclude" strategy and listAll are passed in the request', async () => {
			mockListObject.mockReset();
			mockListObject.mockImplementationOnce((_, listParams) => {
				return {
					...mockListResponse(listParams),
					CommonPrefixes: mockedCommonPrefixes,
					Contents: mockedContents,
					KeyCount: 3,
					NextContinuationToken: undefined,
					IsTruncated: false,
				};
			});

			const { items, excludedSubpaths } = (await list(Amplify, {
				path: mockedPath,
				options: {
					subpathStrategy: { strategy: 'exclude' },
					listAll: true,
				},
			})) as ListAllWithPathOutput;
			expect(items).toHaveLength(3);
			expect(excludedSubpaths).toEqual(expectedExcludedSubpaths);
			expect(listObjectsV2).toHaveBeenCalledTimes(1);
			await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
				listObjectClientConfig,
				expect.objectContaining({
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: mockedPath,
					Delimiter: '/',
				}),
			);
		});

		it('should return excludedSubpaths when "exclude" strategy and pageSize are passed in the request', async () => {
			const { items, excludedSubpaths } = (await list(Amplify, {
				path: mockedPath,
				options: {
					subpathStrategy: { strategy: 'exclude' },
					pageSize: 3,
				},
			})) as ListPaginateWithPathOutput;
			expect(items).toHaveLength(3);
			expect(excludedSubpaths).toEqual(expectedExcludedSubpaths);
			expect(listObjectsV2).toHaveBeenCalledTimes(1);
			await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
				listObjectClientConfig,
				expect.objectContaining({
					Bucket: bucket,
					MaxKeys: 3,
					Prefix: mockedPath,
					Delimiter: '/',
				}),
			);
		});

		it('should listObjectsV2 contain a custom Delimiter when "exclude" with delimiter is passed', async () => {
			(await list(Amplify, {
				path: mockedPath,
				options: {
					subpathStrategy: {
						strategy: 'exclude',
						delimiter: '-',
					},
				},
			})) as ListPaginateWithPathOutput;
			expect(listObjectsV2).toHaveBeenCalledTimes(1);
			await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
				listObjectClientConfig,
				expect.objectContaining({
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: mockedPath,
					Delimiter: '-',
				}),
			);
		});

		it('should listObjectsV2 contain an undefined Delimiter when "include" strategy is passed', async () => {
			await list(Amplify, {
				path: mockedPath,
				options: {
					subpathStrategy: {
						strategy: 'include',
					},
				},
			});
			expect(listObjectsV2).toHaveBeenCalledTimes(1);
			await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
				listObjectClientConfig,
				expect.objectContaining({
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: mockedPath,
					Delimiter: undefined,
				}),
			);
		});

		it('should listObjectsV2 contain an undefined Delimiter when no options are passed', async () => {
			await list(Amplify, {
				path: mockedPath,
			});
			expect(listObjectsV2).toHaveBeenCalledTimes(1);
			await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
				listObjectClientConfig,
				expect.objectContaining({
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: mockedPath,
					Delimiter: undefined,
				}),
			);
		});
	});

	describe(`List with path and Expected Bucket Owner`, () => {
		describe(`v1`, () => {
			const listAllWrapper = (input: ListAllInput) => list(Amplify, input);
			const listPaginatedWrapper = (input: ListPaginateInput) =>
				list(Amplify, input);
			const resolvePath = (
				path: string | (({ identityId }: { identityId: string }) => string),
			) =>
				typeof path === 'string'
					? path
					: path({ identityId: defaultIdentityId });
			const mockPrefix = 'test-path';
			const mockBucket = 'bucket-1';
			const mockRegion = 'region-1';
			afterEach(() => {
				jest.clearAllMocks();
				mockListObject.mockClear();
			});
			it('should include expectedBucketOwner in headers with listAll call when provided', async () => {
				const resolvedPath = resolvePath(mockPrefix);
				mockListObjectsV2ApiWithPages(3);
				await listAllWrapper({
					prefix: resolvedPath,
					options: {
						bucket: { bucketName: mockBucket, region: mockRegion },
						listAll: true,
						expectedBucketOwner: validBucketOwner,
					},
				});

				expect(listObjectsV2).toHaveBeenNthCalledWithConfigAndInput(
					1,
					expect.any(Object),
					expect.objectContaining({
						ExpectedBucketOwner: validBucketOwner,
					}),
				);
			});
			it('should include expectedBucketOwner in headers with paginated call when provided', async () => {
				const resolvedPath = resolvePath(mockPrefix);
				mockListObjectsV2ApiWithPages(3);
				const customPageSize = 5;
				await listPaginatedWrapper({
					prefix: resolvedPath,
					options: {
						bucket: { bucketName: mockBucket, region: mockRegion },
						listAll: false,
						pageSize: customPageSize,
						expectedBucketOwner: validBucketOwner,
					},
				});

				expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					expect.any(Object),
					expect.objectContaining({
						ExpectedBucketOwner: validBucketOwner,
					}),
				);
			});
		});

		describe(`v2`, () => {
			const listAllWrapper = (input: ListAllWithPathInput) =>
				list(Amplify, input);
			const listPaginatedWrapper = (input: ListPaginateWithPathInput) =>
				list(Amplify, input);
			const resolvePath = (
				path: string | (({ identityId }: { identityId: string }) => string),
			) =>
				typeof path === 'string'
					? path
					: path({ identityId: defaultIdentityId });
			const mockPath = 'public/test-path';
			const mockBucket = 'bucket-1';
			const mockRegion = 'region-1';
			afterEach(() => {
				jest.clearAllMocks();
				mockListObject.mockClear();
			});
			it('should include expectedBucketOwner in headers with listAll call when provided', async () => {
				const resolvedPath = resolvePath(mockPath);
				mockListObjectsV2ApiWithPages(3);
				await listAllWrapper({
					path: resolvedPath,
					options: {
						bucket: { bucketName: mockBucket, region: mockRegion },
						listAll: true,
						expectedBucketOwner: validBucketOwner,
					},
				});

				expect(listObjectsV2).toHaveBeenNthCalledWithConfigAndInput(
					1,
					expect.any(Object),
					expect.objectContaining({
						Bucket: mockBucket,
						MaxKeys: 1000,
						Prefix: mockPath,
						ExpectedBucketOwner: validBucketOwner,
					}),
				);
			});
			it('should include expectedBucketOwner in headers with paginated call when provided', async () => {
				const resolvedPath = resolvePath(mockPath);
				mockListObjectsV2ApiWithPages(3);
				const customPageSize = 5;
				await listPaginatedWrapper({
					path: resolvedPath,
					options: {
						bucket: { bucketName: mockBucket, region: mockRegion },
						listAll: false,
						pageSize: customPageSize,
						expectedBucketOwner: validBucketOwner,
					},
				});

				expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					expect.any(Object),
					expect.objectContaining({
						Bucket: mockBucket,
						Prefix: mockPath,
						ExpectedBucketOwner: validBucketOwner,
					}),
				);
			});
		});
	});

	describe.each([
		{
			type: 'Prefix',
			listFunction: (options?: any) =>
				list(Amplify, {
					prefix: 'some folder with  unprintable unicode/',
					options,
				}),
			key: 'key',
		},
		{
			type: 'Path',
			listFunction: (options?: any) =>
				list(Amplify, {
					path: 'public/some folder with  unprintable unicode/',
					options,
				}),
			key: 'path',
		},
	])('Encoding for List with $type', ({ listFunction, key }) => {
		afterEach(() => {
			mockListObject.mockClear();
		});
		it('should decode encoded list output', async () => {
			const encodedBadKeys = [
				'some+folder+with+spaces/',
				'real%0A%0A%0A%0A%0A%0A%0A%0A%0Afunny%0A%0A%0A%0A%0A%0A%0A%0A%0Abiz',
				'some+folder+with+%E3%81%8A%E3%81%AF%E3%82%88%E3%81%86+multibyte+unicode/',
				'bad%3Cdiv%3Ekey',
				'bad%00key',
				'bad%01key',
			];

			mockListObject.mockReturnValueOnce({
				Name: bucket,
				Prefix: 'public/some+folder+with++unprintable+unicode/',
				Delimiter: 'bad%08key',
				MaxKeys: 1000,
				StartAfter: 'bad%7Fbiz/',
				EncodingType: 'url',
				Contents: encodedBadKeys.map(badKey => ({
					...listObjectClientBaseResultItem,
					Key: key === 'key' ? `public/${badKey}` : badKey,
				})),
			});

			const result = await listFunction({
				subpathStrategy: { strategy: 'exclude', delimiter: 'bad\x08key' },
			});

			expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
				expect.any(Object),
				expect.objectContaining({
					Bucket: bucket,
					EncodingType: 'url',
				}),
			);

			const decodedKeys = [
				'some folder with spaces/',
				'real\x0a\x0a\x0a\x0a\x0a\x0a\x0a\x0a\x0afunny\x0a\x0a\x0a\x0a\x0a\x0a\x0a\x0a\x0abiz',
				'some folder with おはよう multibyte unicode/',
				'bad<div>key',
				'bad\x00key',
				'bad\x01key',
			];

			const expectedResult = {
				items: decodedKeys.map(decodedKey => ({
					[key]: decodedKey,
					eTag: 'eTag',
					lastModified: 'lastModified',
					size: 'size',
				})),
				nextToken: undefined,
			};
			expect(result).toEqual(expectedResult);
		});
	});
});
