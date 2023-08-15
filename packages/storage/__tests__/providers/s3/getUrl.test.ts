import { getProperties, getUrl } from '../../../src/providers/s3/apis';
jest.mock('../../../src/AwsClients/S3');
const headObject = jest.fn();

const getPresignedGetObjectUrl = jest.fn();
describe('getUrl happy path case', () => {
	test.skip('get presigned url happy case', async () => {
		// TODO[kvramya] test credentials
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
		getPresignedGetObjectUrl.mockReturnValueOnce({ url: new URL('url') });
		expect(getPresignedGetObjectUrl).toBeCalledTimes(1);
		const result = await getUrl({ key: 'key' });
		expect(result.url).toEqual({
			url: new URL('url'),
		});
	});
});

describe('getUrl error path case', () => {
	test.skip('Should return not found error when the object is not found', async () => {
	  expect.assertions(2)
		// TODO[kvramya] test credentials
		headObject.mockImplementation(() =>
			Object.assign(new Error(), {
				$metadata: { httpStatusCode: 404 },
				name: 'NotFound',
			})
		);
		try {
			await getUrl({
				key: 'invalid_key',
				options: { validateObjectExistence: true },
			});
		} catch (error) {
			expect(getProperties).toBeCalledTimes(1);
			expect(error.$metadata?.httpStatusCode).toBe(404);
		}
	});
});
