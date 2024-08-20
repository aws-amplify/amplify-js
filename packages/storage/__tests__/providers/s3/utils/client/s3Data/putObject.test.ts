import { HttpResponse } from '@aws-amplify/core/internals/aws-client-utils';

import { s3TransferHandler } from '../../../../../../src/providers/s3/utils/client/runtime/s3TransferHandler/fetch';
import { putObject } from '../../../../../../src/providers/s3/utils/client/s3data';
import { isPresignedURLDurable } from '../../../../../../src/providers/s3/utils/isPresignedUrlDurable';
import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
	expectedMetadata,
} from '../S3/cases/shared';
import { IntegrityError } from '../../../../../../src/errors/IntegrityError';

jest.mock('../../../../../../src/providers/s3/utils/isPresignedUrlDurable');
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

const putObjectSuccessResponse = {
	status: 200,
	headers: {
		...DEFAULT_RESPONSE_HEADERS,
		'x-amz-version-id': 'versionId',
		etag: 'etag',
	},
	body: '',
};

describe('serializeGetObjectRequest', () => {
	beforeEach(() => {
		mockS3TransferHandler.mockReset();
	});

	it('should pass when presignedUrl is durable', async () => {
		mockS3TransferHandler.mockResolvedValue(
			mockBinaryResponse(putObjectSuccessResponse as any),
		);
		(isPresignedURLDurable as jest.Mock).mockReturnValue(true);
		const output = await putObject(defaultConfig, {
			Bucket: 'bucket',
			Key: 'key',
		});
		expect(output).toEqual({
			$metadata: expect.objectContaining(expectedMetadata),
			ETag: 'etag',
			VersionId: 'versionId',
		});
	});

	it('should fail when presignedUrl is NOT durable', async () => {
		mockS3TransferHandler.mockResolvedValue(
			mockBinaryResponse(putObjectSuccessResponse as any),
		);
		(isPresignedURLDurable as jest.Mock).mockReturnValue(false);
		try {
			await putObject(defaultConfig, {
				Bucket: 'bucket',
				Key: 'key',
			});
		} catch (e) {
			expect(e).toBeInstanceOf(IntegrityError);
		}
	});
});
