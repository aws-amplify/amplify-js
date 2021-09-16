import { listSingleFile } from "../src/common/StorageUtils";
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

const testOpts: any = {
	bucket: 'testBucket',
	region: 'testRegion',
	credentials,
	level: 'level',
};

describe('listSingleFile', () => {
	const s3Client = new S3Client(testOpts);
	const testParams = {
		s3Client,
		key: 'testKey',
		bucket: testOpts.bucket,
	};

	jest.spyOn(S3Client.prototype, 'send').mockImplementation(command => {
		if (command instanceof ListObjectsV2Command) {
			return {
				Contents: [{ Key: 'testKey'}],			
			};
		}
	});

	test('returns object with matching key', async () => {
		const response = await listSingleFile(testParams);

		expect(response).toEqual({ Key : 'testKey' });
	});

	test('returns undefined if key does not match', async () => {
		const params = {
			s3Client,
			key: 'incorrectKey',
			bucket: testOpts.bucket,
		}
		const response = await listSingleFile(params);

		expect(response).toBeUndefined();
	});

});