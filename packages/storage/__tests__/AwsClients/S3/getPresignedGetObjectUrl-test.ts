import { getPresignedGetObjectUrl } from '../../../src/AwsClients/S3';
import { defaultConfig } from './cases/shared';

describe('serializeGetObjectRequest', () => {
	it('should return get object API request', async () => {
		const actual = await getPresignedGetObjectUrl(
			{
				...defaultConfig,
				signingRegion: defaultConfig.region,
				signingService: 's3',
				expiration: 900,
				userAgentValue: 'UA',
			},
			{
				Bucket: 'bucket',
				Key: 'key',
			}
		);
		const actualUrl = new URL(actual);
		expect(actualUrl.hostname).toEqual(
			`bucket.s3.${defaultConfig.region}.amazonaws.com`
		);
		expect(actualUrl.pathname).toEqual('/key');
		expect(actualUrl.searchParams.get('X-Amz-Expires')).toEqual('900');
		expect(actualUrl.searchParams.get('x-amz-content-sha256')).toEqual(
			expect.any(String)
		);
		expect(actualUrl.searchParams.get('x-amz-user-agent')).toEqual('UA');
	});
});
