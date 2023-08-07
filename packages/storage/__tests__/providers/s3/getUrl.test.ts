import { getUrl } from '../../../src/providers/s3/apis';
jest.mock('../../../src/AwsClients/S3');
const headObject = jest.fn();

const getPresignedGetObjectUrl = jest.fn();
describe('getUrl happy path case', () => {
	test.skip('get presigned url happy case', async () => {
		// TODO test credentials
		headObject.mockImplementation(() => {
			return {
				Key: 'key',
				ContentLength: '100',
				ContentType: 'text/plain',
				ETag: 'etag',
				LastModified: 'last-modified',
				Metadata: { key: 'value' },
			};
		});
		getPresignedGetObjectUrl.mockReturnValueOnce(new URL('url'));
		const result = await getUrl({ key: 'key' });
		expect(result.url).toEqual({
			url: new URL('url'),
		});
	});
});

describe('getUrl error path case', () => {
	test.skip('Should return not found error when the object is not found', async () => {
		headObject.mockImplementation(() =>
			Object.assign(new Error(), {
				$metadata: { httpStatusCode: 404 },
				name: 'NotFound',
			})
		);
		try {
			await getUrl({ key: 'invalid_key' });
		} catch (error) {
			console.log('Error testing', error);
			expect(error.$metadata?.httpStatusCode).toBe(404);
		}
	});
});
