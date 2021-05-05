import {
	S3Client,
	CopyObjectCommand,
	CopyObjectRequest,
	HeadObjectCommand,
	S3ClientConfig,
	CompleteMultipartUploadCommand,
	UploadPartCopyCommand,
	CreateMultipartUploadCommand,
	ListPartsCommand,
	AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { AWSS3ProviderMultipartCopier } from '../../src/providers/AWSS3ProviderMultipartCopy';
import * as events from 'events';
import { CopyObjectConfig } from '../../src/types';

const testInput: CopyObjectRequest = {
	Bucket: 'testBucket',
	CopySource: 'srcBucket/srcKey',
	Key: 'destKey',
};

const testConfig: CopyObjectConfig = {
	bucket: 'testBucket',
	region: 'testRegion',
	level: 'protected',
};

const testS3ClientConfig: S3ClientConfig = {
	region: 'testRegion',
};

afterEach(() => {
	jest.restoreAllMocks();
	jest.clearAllMocks();
});

describe('basic copy test', () => {
	test('happy case - copy small file', async () => {
		const spyon = jest
			.spyOn(S3Client.prototype, 'send')
			.mockImplementation(command => {
				if (command instanceof CopyObjectCommand) {
					return Promise.resolve(command.input.Key);
				} else if (command instanceof HeadObjectCommand) {
					return {
						ContentLength: 100,
					};
				}
			});
		const copier = new AWSS3ProviderMultipartCopier({
			params: testInput,
			config: testConfig,
			emitter: new events.EventEmitter(),
			s3client: new S3Client(testS3ClientConfig),
		});
		const result = await copier.copy();
		expect(result).toEqual('destKey');
		expect(spyon).toBeCalledTimes(2);
	});

	test('happy case - undefined content length', async () => {
		const spyon = jest
			.spyOn(S3Client.prototype, 'send')
			.mockImplementation(async command => {
				if (command instanceof CopyObjectCommand) {
					return command.input.Key;
				} else if (command instanceof HeadObjectCommand) {
					return {
						ContentLength: undefined,
					};
				}
			});
		const copier = new AWSS3ProviderMultipartCopier({
			params: testInput,
			config: testConfig,
			emitter: new events.EventEmitter(),
			s3client: new S3Client(testS3ClientConfig),
		});
		const result = await copier.copy();
		expect(result).toEqual('destKey');
		expect(spyon).toBeCalledTimes(2);
	});
});

describe('multipart copy tests', () => {
	const testContentLength = AWSS3ProviderMultipartCopier.partSize * 3;
	test('happy case - multipart copy', async () => {
		const spyon = jest
			.spyOn(S3Client.prototype, 'send')
			.mockImplementation(async command => {
				if (command instanceof HeadObjectCommand) {
					return {
						ContentLength: testContentLength,
					};
				} else if (command instanceof CreateMultipartUploadCommand) {
					return {
						UploadId: '123',
					};
				} else if (command instanceof UploadPartCopyCommand) {
					return {
						CopyPartResult: {
							ETag: `ETag_${command.input.PartNumber}`,
						},
					};
				} else if (command instanceof CompleteMultipartUploadCommand) {
					return {
						Key: 'destKey',
					};
				}
			});

		const copier = new AWSS3ProviderMultipartCopier({
			params: testInput,
			config: testConfig,
			emitter: new events.EventEmitter(),
			s3client: new S3Client(testS3ClientConfig),
		});
		const result = await copier.copy();
		expect(spyon).toBeCalledTimes(6);
		// Head object call to check file size
		expect(spyon.mock.calls[0][0].input).toStrictEqual({
			Bucket: 'srcBucket',
			Key: 'srcKey',
		});
		// Initialize a multipartUpload
		expect(spyon.mock.calls[1][0].input).toStrictEqual({
			Bucket: 'testBucket',
			Key: 'destKey',
		});
		// First UploadPartCopy call
		expect(spyon.mock.calls[2][0].input).toStrictEqual({
			Bucket: 'testBucket',
			CopySource: 'srcBucket/srcKey',
			Key: 'destKey',
			PartNumber: 1,
			UploadId: '123',
			CopySourceRange: `bytes=0-${AWSS3ProviderMultipartCopier.partSize - 1}`,
		});
		// Second UploadPartCopy call
		expect(spyon.mock.calls[3][0].input).toStrictEqual({
			Bucket: 'testBucket',
			CopySource: 'srcBucket/srcKey',
			Key: 'destKey',
			PartNumber: 2,
			UploadId: '123',
			CopySourceRange: `bytes=${AWSS3ProviderMultipartCopier.partSize}-${
				AWSS3ProviderMultipartCopier.partSize * 2 - 1
			}`,
		});
		// Third UploadPartCopy call
		expect(spyon.mock.calls[4][0].input).toStrictEqual({
			Bucket: 'testBucket',
			CopySource: 'srcBucket/srcKey',
			Key: 'destKey',
			PartNumber: 3,
			UploadId: '123',
			CopySourceRange: `bytes=${AWSS3ProviderMultipartCopier.partSize * 2}-${
				AWSS3ProviderMultipartCopier.partSize * 3 - 1
			}`,
		});
		// Finally, CompleteMultipartUpload call
		expect(spyon.mock.calls[5][0].input).toStrictEqual({
			Bucket: 'testBucket',
			Key: 'destKey',
			UploadId: '123',
			MultipartUpload: {
				Parts: [
					{
						ETag: 'ETag_1',
						PartNumber: 1,
					},
					{
						ETag: 'ETag_2',
						PartNumber: 2,
					},
					{
						ETag: 'ETag_3',
						PartNumber: 3,
					},
				],
			},
		});
		expect(result).toEqual('destKey');
	});

	test('Multipart upload fails in-flight', async () => {
		const spyon = jest
			.spyOn(S3Client.prototype, 'send')
			.mockImplementation(async command => {
				if (command instanceof HeadObjectCommand) {
					return {
						ContentLength: testContentLength,
					};
				} else if (command instanceof CreateMultipartUploadCommand) {
					return {
						UploadId: '123',
					};
				} else if (command instanceof UploadPartCopyCommand) {
					// Simulate failing after the first request
					if (command.input.PartNumber > 1) {
						throw new Error('err');
					}
					return {
						CopyPartResult: {
							ETag: `ETag_${command.input.PartNumber}`,
						},
					};
				} else if (command instanceof CompleteMultipartUploadCommand) {
					return {
						Key: 'destKey',
					};
				} else if (command instanceof AbortMultipartUploadCommand) {
					return {
						Parts: [],
					};
				}
			});
		const copier = new AWSS3ProviderMultipartCopier({
			params: testInput,
			config: testConfig,
			emitter: new events.EventEmitter(),
			s3client: new S3Client(testS3ClientConfig),
			queueSize: 1,
		});
		await expect(copier.copy()).rejects.toThrow('err');
	});

	test('Cleanup failed', async () => {
		S3Client.prototype.send = jest.fn(async command => {
			if (command instanceof HeadObjectCommand) {
				return {
					ContentLength: testContentLength,
				};
			} else if (command instanceof CreateMultipartUploadCommand) {
				return {
					UploadId: '123',
				};
			} else if (command instanceof UploadPartCopyCommand) {
				return {
					CopyPartResult: {
						ETag: `ETag_${command.input.PartNumber}`,
					},
				};
			} else if (command instanceof ListPartsCommand) {
				return {
					Parts: [
						{
							ETag: 'ETag_1',
							PartNumber: 1,
						},
					],
				};
			}
		});
		const copier = new AWSS3ProviderMultipartCopier({
			params: testInput,
			config: testConfig,
			emitter: new events.EventEmitter(),
			s3client: new S3Client(testS3ClientConfig),
		});
		await expect(copier.copy()).rejects.toThrow(
			'Multipart copy clean up failed'
		);
	});

	test('Cannot finalize multipart copy request', async () => {
		const spyon = jest
			.spyOn(S3Client.prototype, 'send')
			.mockImplementation(async command => {
				if (command instanceof HeadObjectCommand) {
					return {
						ContentLength: testContentLength,
					};
				} else if (command instanceof CreateMultipartUploadCommand) {
					return {
						UploadId: '123',
					};
				} else if (command instanceof UploadPartCopyCommand) {
					return {
						CopyPartResult: {
							ETag: `ETag_${command.input.PartNumber}`,
						},
					};
				} else if (command instanceof CompleteMultipartUploadCommand) {
					throw new Error('err');
				}
			});

		const copier = new AWSS3ProviderMultipartCopier({
			params: testInput,
			config: testConfig,
			emitter: new events.EventEmitter(),
			s3client: new S3Client(testS3ClientConfig),
		});
		await expect(copier.copy()).rejects.toThrow('err');
	});
});
