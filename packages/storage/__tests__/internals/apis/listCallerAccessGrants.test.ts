// SPDX-License-Identifier: Apache-2.0
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

import { CredentialsProviderOptions } from '@aws-amplify/core/internals/aws-client-utils';

import { listCallerAccessGrants } from '../../../src/internals/apis/listCallerAccessGrants';
import { listCallerAccessGrants as listCallerAccessGrantsClient } from '../../../src/providers/s3/utils/client/s3control';
import { ListCallerAccessGrantsOutputWithOwner } from '../../../src/providers/s3/utils/client/s3control/s3agPreviewTypes';

jest.mock('../../../src/providers/s3/utils/client/s3control');

const mockAccountId = '123456789012';
const mockCrossAccountId = '111122223333';
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
const mockCustomEndpoint = 's3-accesspoint.dualstack.us-east-2.amazonaws.com';

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
			customEndpoint: mockCustomEndpoint,
			region: mockRegion,
			credentialsProvider: mockCredentialsProvider,
			nextToken: mockNextToken,
			pageSize: mockPageSize,
		});
		expect(listCallerAccessGrantsClient).toHaveBeenCalledWith(
			expect.objectContaining({
				region: mockRegion,
				credentials: expect.any(Function),
				customEndpoint: mockCustomEndpoint,
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

	describe('instanceScope (S3 Access Grants cross-account sharing)', () => {
		it('should pass InstanceScope through to the client when provided', async () => {
			expect.assertions(1);
			jest.mocked(listCallerAccessGrantsClient).mockResolvedValue({
				NextToken: undefined,
				CallerAccessGrantsList: [],
				$metadata: {},
			});
			await listCallerAccessGrants({
				accountId: mockAccountId,
				region: mockRegion,
				credentialsProvider: mockCredentialsProvider,
				instanceScope: 'ALL',
			});
			expect(listCallerAccessGrantsClient).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ InstanceScope: 'ALL' }),
			);
		});

		it('should default InstanceScope to undefined (SELF behavior) when omitted', async () => {
			expect.assertions(1);
			jest.mocked(listCallerAccessGrantsClient).mockResolvedValue({
				NextToken: undefined,
				CallerAccessGrantsList: [],
				$metadata: {},
			});
			await listCallerAccessGrants({
				accountId: mockAccountId,
				region: mockRegion,
				credentialsProvider: mockCredentialsProvider,
			});
			expect(listCallerAccessGrantsClient).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ InstanceScope: undefined }),
			);
		});

		it('should surface the owner accountId parsed from the grant instance ARN', async () => {
			expect.assertions(1);
			const mockOutput: ListCallerAccessGrantsOutputWithOwner = {
				NextToken: undefined,
				CallerAccessGrantsList: [
					{
						GrantScope: 's3://cross-account-bucket/*',
						Permission: 'READ',
						AccessGrantsInstanceArn: `arn:aws:s3:us-east-1:${mockCrossAccountId}:access-grants/default`,
					},
				],
				$metadata: {},
			};
			jest.mocked(listCallerAccessGrantsClient).mockResolvedValue(mockOutput);
			const { locations } = await listCallerAccessGrants({
				accountId: mockAccountId,
				region: mockRegion,
				credentialsProvider: mockCredentialsProvider,
				instanceScope: 'ALL',
			});

			expect(locations[0]).toEqual({
				scope: 's3://cross-account-bucket/*',
				type: 'BUCKET',
				permission: 'READ',
				accountId: mockCrossAccountId,
			});
		});

		it('should leave accountId undefined for a grant with no instance ARN', async () => {
			expect.assertions(1);
			jest.mocked(listCallerAccessGrantsClient).mockResolvedValue({
				NextToken: undefined,
				CallerAccessGrantsList: [
					{ GrantScope: 's3://bucket/*', Permission: 'READ' },
				],
				$metadata: {},
			});
			const { locations } = await listCallerAccessGrants({
				accountId: mockAccountId,
				region: mockRegion,
				credentialsProvider: mockCredentialsProvider,
			});

			expect(locations[0].accountId).toBeUndefined();
		});

		it('should leave accountId undefined for a malformed instance ARN', async () => {
			expect.assertions(1);
			const mockOutput: ListCallerAccessGrantsOutputWithOwner = {
				NextToken: undefined,
				CallerAccessGrantsList: [
					{
						GrantScope: 's3://bucket/*',
						Permission: 'READ',
						AccessGrantsInstanceArn: 'not-an-arn',
					},
				],
				$metadata: {},
			};
			jest.mocked(listCallerAccessGrantsClient).mockResolvedValue(mockOutput);
			const { locations } = await listCallerAccessGrants({
				accountId: mockAccountId,
				region: mockRegion,
				credentialsProvider: mockCredentialsProvider,
			});

			expect(locations[0].accountId).toBeUndefined();
		});
	});
});
