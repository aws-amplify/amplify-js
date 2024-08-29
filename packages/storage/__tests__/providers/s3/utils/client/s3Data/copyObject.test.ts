import { HttpResponse } from '@aws-amplify/core/internals/aws-client-utils';

import { s3TransferHandler } from '../../../../../../src/providers/s3/utils/client/runtime/s3TransferHandler/fetch';
import {
	copyObject,
	validateCopyObjectHeaders,
} from '../../../../../../src/providers/s3/utils/client/s3data/copyObject';
import { validateObjectUrl } from '../../../../../../src/providers/s3/utils/validateObjectUrl';
import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
	expectedMetadata,
} from '../S3/cases/shared';
import { IntegrityError } from '../../../../../../src/errors/IntegrityError';

jest.mock('../../../../../../src/providers/s3/utils/validateObjectUrl');
jest.mock(
	'../../../../../../src/providers/s3/utils/client/runtime/s3TransferHandler/fetch',
);

const mockS3TransferHandler = s3TransferHandler as jest.Mock;
const mockBinaryResponse = ({
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
			throw new Error(
				'Parsing response to JSON is not implemented. Please use response.text() instead.',
			);
		},
		blob: async () => new Blob([body], { type: 'plain/text' }),
		text: async () => body,
	} as HttpResponse['body'];

	return {
		statusCode: status,
		headers,
		body: responseBody,
	} as any;
};

const copyObjectSuccessResponse: any = {
	status: 200,
	headers: DEFAULT_RESPONSE_HEADERS,
	body: '',
};

describe('copyObjectSerializer', () => {
	const mockIsValidObjectUrl = jest.mocked(validateObjectUrl);
	beforeEach(() => {
		mockS3TransferHandler.mockReset();
	});

	it('should pass when objectUrl is valid', async () => {
		expect.assertions(1);
		mockS3TransferHandler.mockResolvedValue(
			mockBinaryResponse(copyObjectSuccessResponse),
		);
		const output = await copyObject(defaultConfig, {
			CopySource: 'mock-source',
			Bucket: 'bucket',
			Key: 'key',
		});
		expect(output).toEqual({
			$metadata: expect.objectContaining(expectedMetadata),
		});
	});

	it('should fail when objectUrl is NOT valid', async () => {
		expect.assertions(1);
		mockS3TransferHandler.mockResolvedValue(
			mockBinaryResponse(copyObjectSuccessResponse),
		);
		const integrityError = new IntegrityError();
		mockIsValidObjectUrl.mockImplementationOnce(() => {
			throw integrityError;
		});
		expect(
			copyObject(defaultConfig, {
				CopySource: 'mock-source',
				Bucket: 'bucket',
				Key: 'key',
			}),
		).rejects.toThrow(integrityError);
	});
});

describe('validateCopyObjectHeaders', () => {
	const baseRequest: any = { CopySource: 'mock-source' };
	const baseHeaders: any = { 'x-amz-copy-source': 'mock-source' };

	[
		{
			description: 'when only correct copy source is provided',
			request: baseRequest,
			headers: baseHeaders,
			expectPass: true,
		},
		{
			description: 'when optional headers are provided correctly',
			request: {
				...baseRequest,
				MetadataDirective: 'mock-metadata',
				CopySourceIfMatch: 'mock-etag',
				CopySourceIfUnmodifiedSince: new Date(0),
			},
			headers: {
				...baseHeaders,
				'x-amz-metadata-directive': 'mock-metadata',
				'x-amz-copy-source-if-match': 'mock-etag',
				'x-amz-copy-source-if-unmodified-since': '1970-01-01T00:00:00.000Z',
			},
			expectPass: true,
		},
		{
			description: 'when optional headers are added without request',
			request: baseRequest,
			headers: {
				...baseHeaders,
				'x-amz-metadata-directive': 'mock-metadata',
				'x-amz-copy-source-if-match': 'mock-etag',
				'x-amz-copy-source-if-unmodified-since': '1970-01-01T00:00:00.000Z',
			},
			expectPass: false,
		},
		...[null, undefined, 'wrong-metadata'].map(incorrectHeader => ({
			description: `when metadata is not mapped correctly: ${incorrectHeader}`,
			request: {
				...baseRequest,
				MetadataDirective: 'mock-metadata',
			},
			headers: {
				...baseHeaders,
				'x-amz-metadata-directive': incorrectHeader,
			},
			expectPass: false,
		})),
		...[null, undefined, 'wrong-etag'].map(incorrectHeader => ({
			description: `when source etag is not mapped correctly: ${incorrectHeader}`,
			request: {
				...baseRequest,
				CopySourceIfMatch: 'mock-etag',
			},
			headers: {
				...baseHeaders,
				'x-amz-copy-source-if-match': incorrectHeader,
			},
			expectPass: false,
		})),
		...[null, undefined, 'wrong-date'].map(incorrectHeader => ({
			description: `when unmodified since date is not mapped correctly: ${incorrectHeader}`,
			request: {
				...baseRequest,
				CopySourceIfUnmodifiedSince: new Date(0),
			},
			headers: {
				...baseHeaders,
				'x-amz-copy-source-if-unmodified-since': incorrectHeader,
			},
			expectPass: false,
		})),
	].forEach(({ description, request, headers, expectPass }) => {
		describe(description, () => {
			if (expectPass) {
				it('should pass validation', () => {
					try {
						validateCopyObjectHeaders(request, headers);
					} catch (_) {
						fail('test case should succeed');
					}
				});
			} else {
				it('should fail validation', () => {
					expect.assertions(1);
					try {
						validateCopyObjectHeaders(request, headers);
						fail('test case should fail');
					} catch (e: any) {
						expect(e.name).toBe('Unknown');
					}
				});
			}
		});
	});
});
