import { headObject } from '../../../src/AwsClients/S3/headObject';
import { getProperties } from '../../../src/providers/s3';
jest.mock('../../../src/AwsClients/S3');
const mockHeadObject = headObject as jest.Mock;

describe('getProperties API happy path case', async () => {
	// TODO test credentials
	mockHeadObject.mockReturnValueOnce({
		Key: 'key',
		ContentLength: '100',
		ContentType: 'text/plain',
		ETag: 'etag',
		LastModified: 'last-modified',
		Metadata: { key: 'value' },
	});
	const metadata = { key: 'value' };
	expect(await getProperties({ key: 'key' })).toEqual({
		key: 'key',
		contentLength: '100',
		contentType: 'text/plain',
		eTag: 'etag',
		lastModified: 'last-modified',
		metadata,
	});
});
describe('getProperties API should return a not found error', async () => {
	// TODO test credentials
	mockHeadObject.mockRejectedValueOnce(
		Object.assign(new Error(), {
			$metadata: { httpStatusCode: 404 },
			name: 'NotFound',
		})
	);
	try {
		getProperties({ key: 'invalid_key' });
	} catch (error) {
		expect(error.$metadata.httpStatusCode).toBe(404);
	}
});
