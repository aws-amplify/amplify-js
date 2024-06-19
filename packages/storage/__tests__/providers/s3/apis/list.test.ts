// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify, StorageAccessLevel } from '@aws-amplify/core';

import { listObjectsV2 } from '../../../../src/providers/s3/utils/client';
import { list } from '../../../../src/providers/s3';
import {
	ListAllInput,
	ListAllOutput,
	ListAllWithPathInput,
	ListAllWithPathOutput,
	ListPaginateInput,
	ListPaginateOutput,
	ListPaginateWithPathInput,
	ListPaginateWithPathOutput,
} from '../../../../src/providers/s3/types';
import './testUtils';

jest.mock('../../../../src/providers/s3/utils/client');
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
const mockGetConfig = Amplify.getConfig as jest.Mock;
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
	describe('Prefix: Happy Cases:', () => {
		const listAllWrapper = (input: ListAllInput): Promise<ListAllOutput> =>
			list(input);
		const listPaginatedWrapper = (
			input: ListPaginateInput,
		): Promise<ListPaginateOutput> => list(input);
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
				mockListObject.mockImplementationOnce(() => {
					return {
						Contents: [{ ...listObjectClientBaseResultItem, Key: expectedKey }],
						NextContinuationToken: nextToken,
					};
				});
				const response = await listPaginatedWrapper({
					prefix,
					options,
				});
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
					{
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: expectedKey,
					},
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
				mockListObject.mockImplementationOnce(() => {
					return {
						Contents: [{ ...listObjectClientBaseResultItem, Key: expectedKey }],
						NextContinuationToken: nextToken,
					};
				});
				const customPageSize = 5;
				const response = await listPaginatedWrapper({
					prefix,
					options: {
						...options,
						pageSize: customPageSize,
						nextToken,
					},
				});
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
					{
						Bucket: bucket,
						Prefix: expectedKey,
						ContinuationToken: nextToken,
						MaxKeys: customPageSize,
					},
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
				mockListObject.mockImplementationOnce(() => {
					return {};
				});
				const response = await listPaginatedWrapper({
					prefix,
					options,
				});
				expect(response.items).toEqual([]);

				expect(response.nextToken).toEqual(undefined);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					listObjectClientConfig,
					{
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: expectedKey,
					},
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
					const result = await listAllWrapper({
						prefix: inputPrefix,
						options: { ...options, listAll: true },
					});
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
						{
							Bucket: bucket,
							Prefix: expectedKey,
							MaxKeys: 1000,
							ContinuationToken: undefined,
						},
					);
					// last input receives TEST_TOKEN as the Continuation Token
					await expect(listObjectsV2).toHaveBeenNthCalledWithConfigAndInput(
						3,
						listObjectClientConfig,
						{
							Bucket: bucket,
							Prefix: expectedKey,
							MaxKeys: 1000,
							ContinuationToken: nextToken,
						},
					);
				});
			},
		);
	});

	describe('Path: Happy Cases:', () => {
		const listAllWrapper = (
			input: ListAllWithPathInput,
		): Promise<ListAllWithPathOutput> => list(input);
		const listPaginatedWrapper = (
			input: ListPaginateWithPathInput,
		): Promise<ListPaginateWithPathOutput> => list(input);
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
				mockListObject.mockImplementationOnce(() => {
					return {
						Contents: [
							{
								...listObjectClientBaseResultItem,
								Key: resolvePath(inputPath),
							},
						],
						NextContinuationToken: nextToken,
					};
				});
				const response = await listPaginatedWrapper({
					path: resolvedPath,
				});
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
					{
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: resolvePath(inputPath),
					},
				);
			},
		);

		it.each(pathTestCases)(
			'should list objects with pagination using custom pageSize, nextToken and custom path: $path',
			async ({ path: inputPath }) => {
				const resolvedPath = resolvePath(inputPath);
				mockListObject.mockImplementationOnce(() => {
					return {
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
				const response = await listPaginatedWrapper({
					path: resolvedPath,
					options: {
						pageSize: customPageSize,
						nextToken,
					},
				});
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
					{
						Bucket: bucket,
						Prefix: resolvePath(inputPath),
						ContinuationToken: nextToken,
						MaxKeys: customPageSize,
					},
				);
			},
		);

		it.each(pathTestCases)(
			'should list objects with zero results with custom path: $path',
			async ({ path }) => {
				mockListObject.mockImplementationOnce(() => {
					return {};
				});
				const response = await listPaginatedWrapper({
					path: resolvePath(path),
				});
				expect(response.items).toEqual([]);

				expect(response.nextToken).toEqual(undefined);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					listObjectClientConfig,
					{
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: resolvePath(path),
					},
				);
			},
		);

		it.each(pathTestCases)(
			'should list all objects having three pages with custom path: $path',
			async ({ path: inputPath }) => {
				const resolvedPath = resolvePath(inputPath);
				mockListObjectsV2ApiWithPages(3);
				const result = await listAllWrapper({
					path: resolvedPath,
					options: { listAll: true },
				});

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
					{
						Bucket: bucket,
						Prefix: resolvedPath,
						MaxKeys: 1000,
						ContinuationToken: undefined,
					},
				);
				// last input receives TEST_TOKEN as the Continuation Token
				await expect(listObjectsV2).toHaveBeenNthCalledWithConfigAndInput(
					3,
					listObjectClientConfig,
					{
						Bucket: bucket,
						Prefix: resolvedPath,
						MaxKeys: 1000,
						ContinuationToken: nextToken,
					},
				);
			},
		);
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
				await list({});
			} catch (error: any) {
				expect.assertions(3);
				expect(listObjectsV2).toHaveBeenCalledTimes(1);
				await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
					listObjectClientConfig,
					{
						Bucket: bucket,
						MaxKeys: 1000,
						Prefix: 'public/',
					},
				);
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
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

		const mockedPath = 'photos/';

		beforeEach(() => {
			mockListObject.mockResolvedValueOnce({
				Contents: mockedContents,
				CommonPrefixes: mockedCommonPrefixes,
			});
		});
		afterEach(() => {
			jest.clearAllMocks();
			mockListObject.mockClear();
		});

		it('should return excludedSubpaths when "exclude" strategy is passed in the request', async () => {
			const { items, excludedSubpaths } = await list({
				path: mockedPath,
				options: {
					subpathStrategy: { strategy: 'exclude' },
				},
			});
			expect(items).toHaveLength(3);
			expect(excludedSubpaths).toEqual([
				'photos/2023/',
				'photos/2024/',
				'photos/2025/',
			]);
			expect(listObjectsV2).toHaveBeenCalledTimes(1);
			await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
				listObjectClientConfig,
				{
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: mockedPath,
					Delimiter: '/',
				},
			);
		});

		it('should return excludedSubpaths when "exclude" strategy and listAll are passed in the request', async () => {
			const { items, excludedSubpaths } = await list({
				path: mockedPath,
				options: {
					subpathStrategy: { strategy: 'exclude' },
					listAll: true,
				},
			});
			expect(items).toHaveLength(3);
			expect(excludedSubpaths).toEqual([
				'photos/2023/',
				'photos/2024/',
				'photos/2025/',
			]);
			expect(listObjectsV2).toHaveBeenCalledTimes(1);
			await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
				listObjectClientConfig,
				{
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: mockedPath,
					Delimiter: '/',
				},
			);
		});

		it('should return excludedSubpaths when "exclude" strategy and pageSize are passed in the request', async () => {
			const { items, excludedSubpaths } = await list({
				path: mockedPath,
				options: {
					subpathStrategy: { strategy: 'exclude' },
					pageSize: 3,
				},
			});
			expect(items).toHaveLength(3);
			expect(excludedSubpaths).toEqual([
				'photos/2023/',
				'photos/2024/',
				'photos/2025/',
			]);
			expect(listObjectsV2).toHaveBeenCalledTimes(1);
			await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
				listObjectClientConfig,
				{
					Bucket: bucket,
					MaxKeys: 3,
					Prefix: mockedPath,
					Delimiter: '/',
				},
			);
		});

		it('should listObjectsV2 contain a custom Delimiter when "exclude" with delimiter is passed', async () => {
			await list({
				path: mockedPath,
				options: {
					subpathStrategy: {
						strategy: 'exclude',
						delimiter: '-',
					},
				},
			});
			expect(listObjectsV2).toHaveBeenCalledTimes(1);
			await expect(listObjectsV2).toBeLastCalledWithConfigAndInput(
				listObjectClientConfig,
				{
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: mockedPath,
					Delimiter: '-',
				},
			);
		});

		it('should listObjectsV2 contain an undefined Delimiter when "include" strategy is passed', async () => {
			await list({
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
				{
					Bucket: bucket,
					MaxKeys: 1000,
					Prefix: mockedPath,
					Delimiter: undefined,
				},
			);
		});
	});
});
