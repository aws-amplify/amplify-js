// SPDX-License-Identifier: Apache-2.0
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

import { CredentialsProviderOptions } from '@aws-amplify/core/internals/aws-client-utils';

import { listCallerAccessGrants } from '../../../src/internals/apis/listCallerAccessGrants';
import { listCallerAccessGrants as listCallerAccessGrantsClient } from '../../../src/providers/s3/utils/client/s3control';

jest.mock('../../../src/providers/s3/utils/client/s3control');

const mockAccountId = '1234567890';
const mockRegion = 'us-foo-2';
const mockCredentials = {
	accessKeyId: 'key',
	secretAccessKey: 'secret',
	sessionToken: 'session',
	expiration: new Date(),
};
const mockCredentialsProvider = jest
	.fn()
	.mockResolvedValue({ credentials: mockCredentials });
const mockNextToken = '123';
const mockPageSize = 123;

describe('listCallerAccessGrants', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should invoke the listCallerAccessGrants client with expected parameters', async () => {
		expect.assertions(4);
		jest.mocked(listCallerAccessGrantsClient).mockResolvedValue({
			NextToken: undefined,
			CallerAccessGrantsList: [],
			$metadata: {} as any,
		});
		await listCallerAccessGrants({
			accountId: mockAccountId,
			region: mockRegion,
			credentialsProvider: mockCredentialsProvider,
			nextToken: mockNextToken,
			pageSize: mockPageSize,
		});
		expect(listCallerAccessGrantsClient).toHaveBeenCalledWith(
			expect.objectContaining({
				region: mockRegion,
				credentials: expect.any(Function),
			}),
			expect.objectContaining({
				AccountId: mockAccountId,
				NextToken: mockNextToken,
				MaxResults: mockPageSize,
				AllowedByApplication: true,
			}),
		);
		const inputCredentialsProvider = jest.mocked(listCallerAccessGrantsClient)
			.mock.calls[0][0].credentials as (
			input: CredentialsProviderOptions,
		) => any;
		expect(inputCredentialsProvider).toBeInstanceOf(Function);
		await expect(
			inputCredentialsProvider({ forceRefresh: true }),
		).resolves.toEqual(mockCredentials);
		expect(mockCredentialsProvider).toHaveBeenCalledWith({
			forceRefresh: true,
		});
	});

	it('should set a default page size', async () => {
		expect.assertions(1);
		jest.mocked(listCallerAccessGrantsClient).mockResolvedValue({
			NextToken: undefined,
			CallerAccessGrantsList: [],
			$metadata: {} as any,
		});
		await listCallerAccessGrants({
			accountId: mockAccountId,
			region: mockRegion,
			credentialsProvider: mockCredentialsProvider,
		});
		expect(listCallerAccessGrantsClient).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				MaxResults: 1000,
			}),
		);
	});

	it('should set response location type correctly', async () => {
		expect.assertions(2);
		jest.mocked(listCallerAccessGrantsClient).mockResolvedValue({
			NextToken: undefined,
			CallerAccessGrantsList: [
				{
					GrantScope: 's3://bucket/*',
					Permission: 'READ',
				},
				{
					GrantScope: 's3://bucket/path/*',
					Permission: 'READWRITE',
				},
				{
					GrantScope: 's3://bucket/path/to/object',
					Permission: 'READ',
					ApplicationArn: 'arn:123',
				},
			],
			$metadata: {} as any,
		});
		const { locations, nextToken } = await listCallerAccessGrants({
			accountId: mockAccountId,
			region: mockRegion,
			credentialsProvider: mockCredentialsProvider,
		});

		expect(locations).toEqual([
			{
				scope: 's3://bucket/*',
				type: 'BUCKET',
				permission: 'READ',
			},
			{
				scope: 's3://bucket/path/*',
				type: 'PREFIX',
				permission: 'READWRITE',
			},
			{
				scope: 's3://bucket/path/to/object',
				type: 'OBJECT',
				permission: 'READ',
			},
		]);
		expect(nextToken).toBeUndefined();
	});
});
