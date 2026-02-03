// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '@aws-amplify/core/internals/aws-client-utils';

import { s3TransferHandler } from '../../../../../../src/providers/s3/utils/client/runtime/s3TransferHandler/fetch';
import { deleteObjects } from '../../../../../../src/providers/s3/utils/client/s3data';
import { DEFAULT_RESPONSE_HEADERS, expectedMetadata } from '../S3/cases/shared';

jest.mock(
	'../../../../../../src/providers/s3/utils/client/runtime/s3TransferHandler/fetch',
);

const mockS3TransferHandler = s3TransferHandler as jest.Mock;

const mockResponse = ({
	status,
	headers,
	body,
}: {
	status: number;
	headers: Record<string, string>;
	body: string;
}): HttpResponse => {
	const responseBody = {
		json: async (): Promise<any> => {
			throw new Error('Not implemented');
		},
		blob: async () => new Blob([body], { type: 'application/xml' }),
		text: async () => body,
	} as HttpResponse['body'];

	return {
		statusCode: status,
		headers,
		body: responseBody,
	} as any;
};

describe('deleteObjects', () => {
	const config = {
		credentials: {
			accessKeyId: 'accessKeyId',
			secretAccessKey: 'secretAccessKey',
		},
		region: 'us-east-1',
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('successful deletion', () => {
		it('should delete multiple objects successfully', async () => {
			const successResponse = `<?xml version="1.0" encoding="UTF-8"?>
<DeleteResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
	<Deleted>
		<Key>file1.txt</Key>
	</Deleted>
	<Deleted>
		<Key>file2.txt</Key>
	</Deleted>
</DeleteResult>`;

			mockS3TransferHandler.mockResolvedValue(
				mockResponse({
					status: 200,
					headers: DEFAULT_RESPONSE_HEADERS,
					body: successResponse,
				}),
			);

			const result = await deleteObjects(config, {
				Bucket: 'test-bucket',
				Delete: {
					Objects: [{ Key: 'file1.txt' }, { Key: 'file2.txt' }],
					Quiet: false,
				},
			});

			expect(result.Deleted).toEqual([
				{ Key: 'file1.txt' },
				{ Key: 'file2.txt' },
			]);
			expect(result.Errors).toEqual([]);
			expect(result.$metadata).toEqual(expectedMetadata);
		});

		it('should handle empty response when Quiet is true', async () => {
			const emptyResponse = `<?xml version="1.0" encoding="UTF-8"?>
<DeleteResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
</DeleteResult>`;

			mockS3TransferHandler.mockResolvedValue(
				mockResponse({
					status: 200,
					headers: DEFAULT_RESPONSE_HEADERS,
					body: emptyResponse,
				}),
			);

			const result = await deleteObjects(config, {
				Bucket: 'test-bucket',
				Delete: {
					Objects: [{ Key: 'file1.txt' }],
					Quiet: true,
				},
			});

			expect(result.Deleted).toEqual([]);
			expect(result.Errors).toEqual([]);
		});
	});

	describe('partial failures', () => {
		it('should handle mixed success and error responses', async () => {
			const mixedResponse = `<?xml version="1.0" encoding="UTF-8"?>
<DeleteResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
	<Deleted>
		<Key>file1.txt</Key>
	</Deleted>
	<Error>
		<Key>file2.txt</Key>
		<Code>AccessDenied</Code>
		<Message>Access Denied</Message>
	</Error>
</DeleteResult>`;

			mockS3TransferHandler.mockResolvedValue(
				mockResponse({
					status: 200,
					headers: DEFAULT_RESPONSE_HEADERS,
					body: mixedResponse,
				}),
			);

			const result = await deleteObjects(config, {
				Bucket: 'test-bucket',
				Delete: {
					Objects: [{ Key: 'file1.txt' }, { Key: 'file2.txt' }],
					Quiet: false,
				},
			});

			expect(result.Deleted).toEqual([{ Key: 'file1.txt' }]);
			expect(result.Errors).toEqual([
				{
					Key: 'file2.txt',
					Code: 'AccessDenied',
					Message: 'Access Denied',
				},
			]);
		});
	});

	describe('request serialization', () => {
		it('should serialize request correctly', async () => {
			mockS3TransferHandler.mockResolvedValue(
				mockResponse({
					status: 200,
					headers: DEFAULT_RESPONSE_HEADERS,
					body: '<DeleteResult></DeleteResult>',
				}),
			);

			await deleteObjects(config, {
				Bucket: 'test-bucket',
				Delete: {
					Objects: [{ Key: 'file1.txt' }, { Key: 'file2.txt' }],
					Quiet: false,
				},
				ExpectedBucketOwner: '123456789012',
				ContentMD5: 'mock-md5-hash',
			});

			const call = mockS3TransferHandler.mock.calls[0][0];
			expect(call.method).toBe('POST');
			expect(call.headers).toEqual(
				expect.objectContaining({
					'x-amz-expected-bucket-owner': '123456789012',
					'content-type': 'application/xml',
					'content-md5': 'mock-md5-hash',
				}),
			);
			expect(call.url.toString()).toContain('?delete=');
			expect(call.body).toContain(
				'<Delete xmlns="http://s3.amazonaws.com/doc/2006-03-01/">',
			);
		});

		it('should include objects in XML body', async () => {
			mockS3TransferHandler.mockResolvedValue(
				mockResponse({
					status: 200,
					headers: DEFAULT_RESPONSE_HEADERS,
					body: '<DeleteResult></DeleteResult>',
				}),
			);

			await deleteObjects(config, {
				Bucket: 'test-bucket',
				Delete: {
					Objects: [{ Key: 'file1.txt' }, { Key: 'file2.txt' }],
					Quiet: false,
				},
			});

			const call = mockS3TransferHandler.mock.calls[0][0];
			expect(call.body).toContain('<Object><Key>file1.txt</Key></Object>');
			expect(call.body).toContain('<Object><Key>file2.txt</Key></Object>');
			expect(call.body).toContain('<Quiet>false</Quiet>');
		});
	});

	describe('error handling', () => {
		it('should throw error for non-200 status codes', async () => {
			const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Error>
	<Code>InvalidRequest</Code>
	<Message>Invalid request</Message>
</Error>`;

			mockS3TransferHandler.mockResolvedValue(
				mockResponse({
					status: 400,
					headers: DEFAULT_RESPONSE_HEADERS,
					body: errorResponse,
				}),
			);

			await expect(
				deleteObjects(config, {
					Bucket: 'test-bucket',
					Delete: {
						Objects: [{ Key: 'file1.txt' }],
						Quiet: false,
					},
				}),
			).rejects.toThrow();
		});
	});
});
