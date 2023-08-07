import { getUrl } from '../../providers/s3';
jest.mock('../../../src/AwsClients/S3');

const getPresignedGetObjectUrl = jest.fn();
describe('getUrl happy path case', () => {
	test.skip('get presigned url happy case', async () => {
		// TODO test credentials
		getPresignedGetObjectUrl.mockReturnValueOnce(new URL('url'));
		expect(await getUrl({ key: 'key' })).toEqual({
			url: new URL('url'),
			expiresAt: new Date('December 17, 2023'),
		});
	});
});
