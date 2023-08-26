// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials } from '@aws-sdk/types';
import { Amplify, fetchAuthSession } from '@aws-amplify/core';

import { getMultipartUploadHandlers } from '../../../../src/providers/s3/apis/uploadData/multipart/uploadHandlers';
import {
	createMultipartUpload,
	uploadPart,
	completeMultipartUpload,
	abortMultipartUpload,
	listParts,
	headObject,
} from '../../../../src/AwsClients/S3';
import {
	validationErrorMap,
	StorageValidationErrorCode,
} from '../../../../src/errors/types/validation';
import { partByteLength } from '../../../../src/providers/s3/apis/uploadData/multipart/partByteLength';

jest.mock('../../../../src/AwsClients/S3');

jest.mock('@aws-amplify/core', () => {
	const core = jest.requireActual('@aws-amplify/core');
	return {
		...core,
		Amplify: {
			...core.Amplify,
			getConfig: jest.fn(),
		},
		fetchAuthSession: jest.fn(),
	};
});
const credentials: Credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const identityId = 'identityId';
const mockFetchAuthSession = fetchAuthSession as jest.Mock;
const bucket = 'bucket';
const region = 'region';
const defaultKey = 'key';

const mockCreateMultipartUpload = createMultipartUpload as jest.Mock;
const mockUploadPart = uploadPart as jest.Mock;
const mockCompleteMultipartUpload = completeMultipartUpload as jest.Mock;
const mockAbortMultipartUpload = abortMultipartUpload as jest.Mock;
const mockListParts = listParts as jest.Mock;
const mockHeadObject = headObject as jest.Mock;

const disableAssertion = true;

const MB = 1024 * 1024;

const mockMultipartUploadSuccess = (disableAssertion?: boolean) => {
	let totalSize = 0;
	mockCreateMultipartUpload.mockResolvedValueOnce({
		UploadId: 'uploadId',
	});
	mockUploadPart.mockImplementation(async (s3Config, input) => {
		if (!disableAssertion) {
			expect(input.UploadId).toEqual('uploadId');
		}
		totalSize += partByteLength(input.Body);

		return {
			Etag: `etag-${input.PartNumber}`,
			PartNumber: input.PartNumber,
		};
	});
	mockCompleteMultipartUpload.mockResolvedValueOnce({
		ETag: 'etag',
	});
	mockHeadObject.mockResolvedValueOnce({
		ContentLength: totalSize,
	});
};

const resetS3Mocks = () => {
	mockCreateMultipartUpload.mockReset();
	mockUploadPart.mockReset();
	mockCompleteMultipartUpload.mockReset();
	mockAbortMultipartUpload.mockReset();
	mockListParts.mockReset();
};

describe('getMultipartUploadHandlers', () => {
	beforeAll(() => {
		mockFetchAuthSession.mockResolvedValue({
			credentials,
			identityId,
		});
		(Amplify.getConfig as jest.Mock).mockReturnValue({
			Storage: {
				bucket,
				region,
			},
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it.skip('should return multipart upload handlers', async () => {
		const multipartUploadHandlers = getMultipartUploadHandlers(
			{
				key: defaultKey,
				data: { size: 5 * 1024 * 1024 } as any,
			},
			5 * 1024 * 1024
		);
		expect(multipartUploadHandlers).toEqual({
			multipartUploadJob: expect.any(Function),
			onPause: expect.any(Function),
			onResume: expect.any(Function),
			onCancel: expect.any(Function),
		});
	});

	describe('upload', () => {
		beforeEach(() => {
			resetS3Mocks();
		});
		const getBlob = (size: number) => new Blob(['1'.repeat(size)]);
		it.each([
			['file', new File([getBlob(8 * MB)], 'someName')],
			['blob', getBlob(8 * MB)],
			['string', '1'.repeat(8 * MB)],
			['arrayBuffer', new ArrayBuffer(8 * MB)],
			['arrayBufferView', new Uint8Array(8 * MB)],
		])(
			'should upload a %s type body that splits in 2 parts',
			async (_, twoPartsPayload) => {
				mockMultipartUploadSuccess();
				const { multipartUploadJob } = getMultipartUploadHandlers({
					key: defaultKey,
					data: twoPartsPayload,
				});
				const result = await multipartUploadJob();
				expect(mockCreateMultipartUpload).toBeCalledWith(
					expect.objectContaining({
						credentials,
						region,
						abortSignal: expect.any(AbortSignal),
					}),
					expect.objectContaining({
						Bucket: bucket,
						Key: `public/${defaultKey}`,
						ContentType: 'binary/octet-stream',
					})
				);
				expect(result).toEqual(
					expect.objectContaining({ key: defaultKey, eTag: 'etag' })
				);
				expect(mockCreateMultipartUpload).toBeCalledTimes(1);
				expect(mockUploadPart).toBeCalledTimes(2);
				expect(mockCompleteMultipartUpload).toBeCalledTimes(1);
			}
		);

		it('should throw if unsupported payload type is provided', async () => {
			mockMultipartUploadSuccess();
			const { multipartUploadJob } = getMultipartUploadHandlers({
				key: defaultKey,
				data: 1 as any,
			});
			await expect(multipartUploadJob()).rejects.toThrowError(
				expect.objectContaining(
					validationErrorMap[StorageValidationErrorCode.InvalidUploadSource]
				)
			);
		});

		it('should upload a body that exceeds the sie of default part size and parts count', async () => {
			let buffer: ArrayBuffer;
			const file = {
				__proto__: File.prototype,
				name: 'some file',
				lastModified: 0,
				size: 100_000 * MB,
				type: 'text/plain',
				slice: jest.fn().mockImplementation((start, end) => {
					if (end - start !== buffer?.byteLength) {
						buffer = new ArrayBuffer(end - start);
					}
					return buffer;
				}),
			} as any as File;
			mockMultipartUploadSuccess();
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: file,
				},
				file.size
			);
			await multipartUploadJob();
			expect(file.slice).toBeCalledTimes(10_000); // S3 limit of parts count
			expect(mockCreateMultipartUpload).toBeCalledTimes(1);
			expect(mockUploadPart).toBeCalledTimes(10_000);
			expect(mockCompleteMultipartUpload).toBeCalledTimes(1);
			expect(mockUploadPart.mock.calls[0][1].Body.byteLength).toEqual(10 * MB); // The part size should be adjusted from default 5MB to 10MB.
		});

		it('should throw error when remote and local file sizes do not match upon completed upload', async () => {
			expect.assertions(1);
			mockMultipartUploadSuccess(disableAssertion);
			mockHeadObject.mockReset();
			mockHeadObject.mockResolvedValue({
				ContentLength: 1,
			});

			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: new ArrayBuffer(8 * MB),
				},
				8 * MB
			);
			try {
				await multipartUploadJob();
				fail('should throw error');
			} catch (e) {
				expect(e.message).toEqual(
					`Upload failed. Expected object size ${8 * MB}, but got 1.`
				);
			}
		});

		it('should handle error case: create multipart upload request failed', async () => {
			expect.assertions(1);
			mockMultipartUploadSuccess();
			mockCreateMultipartUpload.mockReset();
			mockCreateMultipartUpload.mockRejectedValueOnce(new Error('error'));

			const { multipartUploadJob } = getMultipartUploadHandlers({
				key: defaultKey,
				data: new ArrayBuffer(8 * MB),
			});
			await expect(multipartUploadJob()).rejects.toThrowError('error');
		});

		it('should handle error case: list parts request failed', async () => {
			expect.assertions(1);
			mockMultipartUploadSuccess();
			mockListParts.mockReset();
			mockListParts.mockRejectedValueOnce(new Error('error'));

			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: new ArrayBuffer(8 * MB),
				},
				8 * MB
			);
			await expect(multipartUploadJob()).rejects.toThrowError('error');
		});

		it('should handle error case: finish multipart upload failed', async () => {
			expect.assertions(1);
			mockMultipartUploadSuccess(disableAssertion);
			mockCompleteMultipartUpload.mockReset();
			mockCompleteMultipartUpload.mockRejectedValueOnce(new Error('error'));

			const { multipartUploadJob } = getMultipartUploadHandlers({
				key: defaultKey,
				data: new ArrayBuffer(8 * MB),
			});
			await expect(multipartUploadJob()).rejects.toThrowError('error');
		});

		it('should handle error case: upload a body that splits in two parts but second part fails', async () => {
			expect.assertions(3);
			mockMultipartUploadSuccess(disableAssertion);
			mockUploadPart.mockReset();
			mockUploadPart.mockResolvedValueOnce({
				ETag: `etag-1`,
				PartNumber: 1,
			});
			mockUploadPart.mockRejectedValueOnce(new Error('error'));

			const { multipartUploadJob } = getMultipartUploadHandlers({
				key: defaultKey,
				data: new ArrayBuffer(8 * MB),
			});
			await expect(multipartUploadJob()).rejects.toThrowError('error');
			expect(mockUploadPart).toBeCalledTimes(2);
			expect(mockCompleteMultipartUpload).not.toBeCalled();
		});
	});

	describe.skip('upload caching', () => {
		it('should send createMultipartUpload request if the upload task is not cached', async () => {});

		it('should send createMultipartUpload request if the upload task is cached but outdated', async () => {});

		it('should send listParts request if the upload task is cached', async () => {});

		it('should cache upload task if new upload task is created', async () => {});

		it('should remove from cache if upload task is completed', async () => {});

		it('should remove from cache if upload task is canceled', async () => {});
	});

	describe.skip('cancel()', () => {
		it('should abort in-flight uploadPart requests and throw if upload is canceled', async () => {});
		it('should NOT send listParts or createMultipartUpload request if the upload task is canceled', async () => {});
	});

	describe.skip('pause() & resume()', () => {
		it('should abort in-flight uploadPart requests if upload is paused', async () => {});

		it('should restart uploadPart requests if upload is resumed', async () => {});
	});

	describe.skip('upload progress', () => {
		it('should send progress for cached upload parts', async () => {});

		it('should send progress for in-flight upload parts', async () => {});
	});
});
