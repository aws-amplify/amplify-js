// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify, defaultStorage } from '@aws-amplify/core';
import {
	createMultipartUpload,
	uploadPart,
	completeMultipartUpload,
	abortMultipartUpload,
	listParts,
	headObject,
} from '../../../../../src/providers/s3/utils/client';
import { getMultipartUploadHandlers } from '../../../../../src/providers/s3/apis/uploadData/multipart';
import {
	validationErrorMap,
	StorageValidationErrorCode,
} from '../../../../../src/errors/types/validation';
import { UPLOADS_STORAGE_KEY } from '../../../../../src/providers/s3/utils/constants';
import { byteLength } from '../../../../../src/providers/s3/apis/uploadData/byteLength';
import { CanceledError } from '../../../../../src/errors/CanceledError';
import { StorageOptions } from '../../../../../src/types';

jest.mock('@aws-amplify/core');
jest.mock('../../../../../src/providers/s3/utils/client');

const credentials: AWSCredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const defaultIdentityId = 'defaultIdentityId';
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;
const bucket = 'bucket';
const region = 'region';
const defaultKey = 'key';
const defaultContentType = 'application/octet-stream';
const defaultCacheKey = '8388608_application/octet-stream_bucket_public_key';
const testPath = 'testPath/object';
const testPathCacheKey = `8388608_${defaultContentType}_${bucket}_custom_${testPath}`;

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

		// mock 2 invocation of onProgress callback to simulate progress
		s3Config?.onUploadProgress({
			transferredBytes: input.Body.byteLength / 2,
			totalBytes: input.Body.byteLength,
		});
		s3Config?.onUploadProgress({
			transferredBytes: input.Body.byteLength,
			totalBytes: input.Body.byteLength,
		});

		totalSize += byteLength(input.Body)!;

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

const mockMultipartUploadCancellation = (
	beforeUploadPartResponseCallback?: () => void,
) => {
	mockCreateMultipartUpload.mockImplementation(async ({ abortSignal }) => ({
		UploadId: 'uploadId',
	}));

	mockUploadPart.mockImplementation(async ({ abortSignal }, { PartNumber }) => {
		beforeUploadPartResponseCallback?.();
		if (abortSignal?.aborted) {
			throw new Error('AbortError');
		}
		return {
			ETag: `etag-${PartNumber}`,
			PartNumber,
		};
	});

	mockAbortMultipartUpload.mockResolvedValueOnce({});
	// Mock resumed upload and completed upload successfully
	mockCompleteMultipartUpload.mockResolvedValueOnce({
		ETag: 'etag',
	});
};

const resetS3Mocks = () => {
	mockCreateMultipartUpload.mockReset();
	mockUploadPart.mockReset();
	mockCompleteMultipartUpload.mockReset();
	mockAbortMultipartUpload.mockReset();
	mockListParts.mockReset();
};

/* TODO Remove suite when `key` parameter is removed */
describe('getMultipartUploadHandlers with key', () => {
	beforeAll(() => {
		mockFetchAuthSession.mockResolvedValue({
			credentials,
			identityId: defaultIdentityId,
		});
		(Amplify.getConfig as jest.Mock).mockReturnValue({
			Storage: {
				S3: {
					bucket,
					region,
				},
			},
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
		resetS3Mocks();
	});

	it('should return multipart upload handlers', async () => {
		const multipartUploadHandlers = getMultipartUploadHandlers(
			{
				key: defaultKey,
				data: { size: 5 * 1024 * 1024 } as any,
			},
			5 * 1024 * 1024,
		);
		expect(multipartUploadHandlers).toEqual({
			multipartUploadJob: expect.any(Function),
			onPause: expect.any(Function),
			onResume: expect.any(Function),
			onCancel: expect.any(Function),
		});
	});

	describe('upload', () => {
		const getBlob = (size: number) => new Blob(['1'.repeat(size)]);
		[
			{
				expectedKey: `public/${defaultKey}`,
			},
			{
				options: { accessLevel: 'guest' },
				expectedKey: `public/${defaultKey}`,
			},
			{
				options: { accessLevel: 'private' },
				expectedKey: `private/${defaultIdentityId}/${defaultKey}`,
			},
			{
				options: { accessLevel: 'protected' },
				expectedKey: `protected/${defaultIdentityId}/${defaultKey}`,
			},
		].forEach(({ options, expectedKey }) => {
			const accessLevelMsg = options?.accessLevel ?? 'default';
			it.each([
				['file', new File([getBlob(8 * MB)], 'someName')],
				['blob', getBlob(8 * MB)],
				['string', 'Ü'.repeat(4 * MB)],
				['arrayBuffer', new ArrayBuffer(8 * MB)],
				['arrayBufferView', new Uint8Array(8 * MB)],
			])(
				`should upload a %s type body that splits in 2 parts using ${accessLevelMsg} accessLevel`,
				async (_, twoPartsPayload) => {
					mockMultipartUploadSuccess();
					const { multipartUploadJob } = getMultipartUploadHandlers({
						key: defaultKey,
						data: twoPartsPayload,
						options: options as StorageOptions,
					});
					const result = await multipartUploadJob();
					expect(mockCreateMultipartUpload).toHaveBeenCalledWith(
						expect.objectContaining({
							credentials,
							region,
							abortSignal: expect.any(AbortSignal),
						}),
						expect.objectContaining({
							Bucket: bucket,
							Key: expectedKey,
							ContentType: defaultContentType,
						}),
					);
					expect(result).toEqual(
						expect.objectContaining({ key: defaultKey, eTag: 'etag' }),
					);
					expect(mockCreateMultipartUpload).toHaveBeenCalledTimes(1);
					expect(mockUploadPart).toHaveBeenCalledTimes(2);
					expect(mockCompleteMultipartUpload).toHaveBeenCalledTimes(1);
				},
			);
		});

		it('should throw if unsupported payload type is provided', async () => {
			mockMultipartUploadSuccess();
			const { multipartUploadJob } = getMultipartUploadHandlers({
				key: defaultKey,
				data: 1 as any,
			});
			await expect(multipartUploadJob()).rejects.toThrow(
				expect.objectContaining(
					validationErrorMap[StorageValidationErrorCode.InvalidUploadSource],
				),
			);
		});

		it('should upload a body that exceeds the size of default part size and parts count', async () => {
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
				file.size,
			);
			await multipartUploadJob();
			expect(file.slice).toHaveBeenCalledTimes(10_000); // S3 limit of parts count
			expect(mockCreateMultipartUpload).toHaveBeenCalledTimes(1);
			expect(mockUploadPart).toHaveBeenCalledTimes(10_000);
			expect(mockCompleteMultipartUpload).toHaveBeenCalledTimes(1);
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
				8 * MB,
			);
			try {
				await multipartUploadJob();
				fail('should throw error');
			} catch (e: any) {
				expect(e.message).toEqual(
					`Upload failed. Expected object size ${8 * MB}, but got 1.`,
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
			await expect(multipartUploadJob()).rejects.toThrow('error');
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
			await expect(multipartUploadJob()).rejects.toThrow('error');
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
			await expect(multipartUploadJob()).rejects.toThrow('error');
			expect(mockUploadPart).toHaveBeenCalledTimes(2);
			expect(mockCompleteMultipartUpload).not.toHaveBeenCalled();
		});
	});

	describe('upload caching', () => {
		const mockDefaultStorage = defaultStorage as jest.Mocked<
			typeof defaultStorage
		>;
		beforeEach(() => {
			mockDefaultStorage.getItem.mockReset();
			mockDefaultStorage.setItem.mockReset();
		});

		it('should send createMultipartUpload request if the upload task is not cached', async () => {
			mockMultipartUploadSuccess();
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: new ArrayBuffer(size),
				},
				size,
			);
			await multipartUploadJob();
			// 1 for caching upload task; 1 for remove cache after upload is completed
			expect(mockDefaultStorage.setItem).toHaveBeenCalledTimes(2);
			expect(mockCreateMultipartUpload).toHaveBeenCalledTimes(1);
			expect(mockListParts).not.toHaveBeenCalled();
		});

		it('should send createMultipartUpload request if the upload task is cached but outdated', async () => {
			mockDefaultStorage.getItem.mockResolvedValue(
				JSON.stringify({
					[defaultCacheKey]: {
						uploadId: 'uploadId',
						bucket,
						key: defaultKey,
						lastTouched: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
					},
				}),
			);
			mockMultipartUploadSuccess();
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: new ArrayBuffer(size),
				},
				size,
			);
			await multipartUploadJob();
			expect(mockCreateMultipartUpload).toHaveBeenCalledTimes(1);
			expect(mockListParts).not.toHaveBeenCalled();
			expect(mockUploadPart).toHaveBeenCalledTimes(2);
			expect(mockCompleteMultipartUpload).toHaveBeenCalledTimes(1);
		});

		it('should cache the upload with file including file lastModified property', async () => {
			mockMultipartUploadSuccess();
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: new File([new ArrayBuffer(size)], 'someName'),
				},
				size,
			);
			await multipartUploadJob();
			// 1 for caching upload task; 1 for remove cache after upload is completed
			expect(mockDefaultStorage.setItem).toHaveBeenCalledTimes(2);
			const cacheValue = JSON.parse(
				mockDefaultStorage.setItem.mock.calls[0][1],
			);
			expect(Object.keys(cacheValue)).toEqual([
				expect.stringMatching(
					// \d{13} is the file lastModified property of a file
					/someName_\d{13}_8388608_application\/octet-stream_bucket_public_key/,
				),
			]);
		});

		it('should send listParts request if the upload task is cached', async () => {
			mockDefaultStorage.getItem.mockResolvedValue(
				JSON.stringify({
					[defaultCacheKey]: {
						uploadId: 'uploadId',
						bucket,
						key: defaultKey,
						lastModified: Date.now(),
					},
				}),
			);
			mockMultipartUploadSuccess();
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: new ArrayBuffer(size),
				},
				size,
			);
			await multipartUploadJob();
			expect(mockCreateMultipartUpload).not.toHaveBeenCalled();
			expect(mockListParts).toHaveBeenCalledTimes(1);
			expect(mockUploadPart).toHaveBeenCalledTimes(2);
			expect(mockCompleteMultipartUpload).toHaveBeenCalledTimes(1);
		});

		it('should cache upload task if new upload task is created', async () => {
			mockMultipartUploadSuccess();
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: new ArrayBuffer(size),
				},
				size,
			);
			await multipartUploadJob();
			// 1 for caching upload task; 1 for remove cache after upload is completed
			expect(mockDefaultStorage.setItem).toHaveBeenCalledTimes(2);
			expect(mockDefaultStorage.setItem.mock.calls[0][0]).toEqual(
				UPLOADS_STORAGE_KEY,
			);
			const cacheValue = JSON.parse(
				mockDefaultStorage.setItem.mock.calls[0][1],
			);
			expect(Object.keys(cacheValue)).toEqual([
				expect.stringMatching(
					/8388608_application\/octet-stream_bucket_public_key/,
				),
			]);
		});

		it('should remove from cache if upload task is completed', async () => {
			mockMultipartUploadSuccess();
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: new ArrayBuffer(size),
				},
				size,
			);
			await multipartUploadJob();
			// 1 for caching upload task; 1 for remove cache after upload is completed
			expect(mockDefaultStorage.setItem).toHaveBeenCalledTimes(2);
			expect(mockDefaultStorage.setItem).toHaveBeenNthCalledWith(
				2,
				UPLOADS_STORAGE_KEY,
				JSON.stringify({}),
			);
		});

		it('should remove from cache if upload task is canceled', async () => {
			expect.assertions(2);
			mockMultipartUploadSuccess(disableAssertion);
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob, onCancel } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: new ArrayBuffer(size),
				},
				size,
			);
			const uploadJobPromise = multipartUploadJob();
			await uploadJobPromise;
			// 1 for caching upload task; 1 for remove cache after upload is completed
			expect(mockDefaultStorage.setItem).toHaveBeenCalledTimes(2);
			expect(mockDefaultStorage.setItem).toHaveBeenNthCalledWith(
				2,
				UPLOADS_STORAGE_KEY,
				JSON.stringify({}),
			);
		});
	});

	describe('cancel()', () => {
		it('should abort in-flight uploadPart requests and throw if upload is canceled', async () => {
			const { multipartUploadJob, onCancel } = getMultipartUploadHandlers({
				key: defaultKey,
				data: new ArrayBuffer(8 * MB),
			});
			let partCount = 0;
			mockMultipartUploadCancellation(() => {
				partCount++;
				if (partCount === 2) {
					onCancel(); // Cancel upload at the the last uploadPart call
				}
			});
			try {
				await multipartUploadJob();
				fail('should throw error');
			} catch (error: any) {
				expect(error).toBeInstanceOf(CanceledError);
				expect(error.message).toBe('Upload is canceled by user');
			}
			expect(mockAbortMultipartUpload).toHaveBeenCalledTimes(1);
			expect(mockUploadPart).toHaveBeenCalledTimes(2);
			expect(mockUploadPart.mock.calls[0][0].abortSignal?.aborted).toBe(true);
			expect(mockUploadPart.mock.calls[1][0].abortSignal?.aborted).toBe(true);
		});
	});

	describe('pause() & resume()', () => {
		it('should abort in-flight uploadPart requests if upload is paused', async () => {
			const { multipartUploadJob, onPause, onResume } =
				getMultipartUploadHandlers({
					key: defaultKey,
					data: new ArrayBuffer(8 * MB),
				});
			let partCount = 0;
			mockMultipartUploadCancellation(() => {
				partCount++;
				if (partCount === 2) {
					onPause(); // Pause upload at the the last uploadPart call
				}
			});
			const uploadPromise = multipartUploadJob();
			onResume();
			await uploadPromise;
			expect(mockUploadPart).toHaveBeenCalledTimes(2);
			expect(mockUploadPart.mock.calls[0][0].abortSignal?.aborted).toBe(true);
			expect(mockUploadPart.mock.calls[1][0].abortSignal?.aborted).toBe(true);
		});
	});

	describe('upload progress', () => {
		it('should send progress for in-flight upload parts', async () => {
			const onProgress = jest.fn();
			mockMultipartUploadSuccess();
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: new ArrayBuffer(8 * MB),
					options: {
						onProgress,
					},
				},
				8 * MB,
			);
			await multipartUploadJob();
			expect(onProgress).toHaveBeenCalledTimes(4); // 2 simulated onProgress events per uploadPart call are all tracked
			expect(onProgress).toHaveBeenNthCalledWith(1, {
				totalBytes: 8388608,
				transferredBytes: 2621440,
			});
			expect(onProgress).toHaveBeenNthCalledWith(2, {
				totalBytes: 8388608,
				transferredBytes: 5242880,
			});
			expect(onProgress).toHaveBeenNthCalledWith(3, {
				totalBytes: 8388608,
				transferredBytes: 6815744,
			});
			expect(onProgress).toHaveBeenNthCalledWith(4, {
				totalBytes: 8388608,
				transferredBytes: 8388608,
			});
		});

		it('should send progress for cached upload parts', async () => {
			mockMultipartUploadSuccess();

			const mockDefaultStorage = defaultStorage as jest.Mocked<
				typeof defaultStorage
			>;
			mockDefaultStorage.getItem.mockResolvedValue(
				JSON.stringify({
					[defaultCacheKey]: {
						uploadId: 'uploadId',
						bucket,
						key: defaultKey,
					},
				}),
			);
			mockListParts.mockResolvedValue({
				Parts: [{ PartNumber: 1 }],
			});

			const onProgress = jest.fn();
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					key: defaultKey,
					data: new ArrayBuffer(8 * MB),
					options: {
						onProgress,
					},
				},
				8 * MB,
			);
			await multipartUploadJob();
			expect(onProgress).toHaveBeenCalledTimes(3);
			// The first part's 5 MB progress is reported even though no uploadPart call is made.
			expect(onProgress).toHaveBeenNthCalledWith(1, {
				totalBytes: 8388608,
				transferredBytes: 5242880,
			});
		});
	});
});

describe('getMultipartUploadHandlers with path', () => {
	beforeAll(() => {
		mockFetchAuthSession.mockResolvedValue({
			credentials,
			identityId: defaultIdentityId,
		});
		(Amplify.getConfig as jest.Mock).mockReturnValue({
			Storage: {
				S3: {
					bucket,
					region,
				},
			},
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
		resetS3Mocks();
	});

	it('should return multipart upload handlers', async () => {
		const multipartUploadHandlers = getMultipartUploadHandlers(
			{
				path: testPath,
				data: { size: 5 * 1024 * 1024 } as any,
			},
			5 * 1024 * 1024,
		);
		expect(multipartUploadHandlers).toEqual({
			multipartUploadJob: expect.any(Function),
			onPause: expect.any(Function),
			onResume: expect.any(Function),
			onCancel: expect.any(Function),
		});
	});

	describe('upload', () => {
		const getBlob = (size: number) => new Blob(['1'.repeat(size)]);
		[
			{
				path: testPath,
				expectedKey: testPath,
			},
			{
				path: ({ identityId }: { identityId: string }) =>
					`testPath/${identityId}/object`,
				expectedKey: `testPath/${defaultIdentityId}/object`,
			},
		].forEach(({ path: inputPath, expectedKey }) => {
			it.each([
				['file', new File([getBlob(8 * MB)], 'someName')],
				['blob', getBlob(8 * MB)],
				['string', 'Ü'.repeat(4 * MB)],
				['arrayBuffer', new ArrayBuffer(8 * MB)],
				['arrayBufferView', new Uint8Array(8 * MB)],
			])(
				`should upload a %s type body that splits into 2 parts to path ${expectedKey}`,
				async (_, twoPartsPayload) => {
					mockMultipartUploadSuccess();
					const { multipartUploadJob } = getMultipartUploadHandlers({
						path: inputPath,
						data: twoPartsPayload,
					});
					const result = await multipartUploadJob();
					expect(mockCreateMultipartUpload).toHaveBeenCalledWith(
						expect.objectContaining({
							credentials,
							region,
							abortSignal: expect.any(AbortSignal),
						}),
						expect.objectContaining({
							Bucket: bucket,
							Key: expectedKey,
							ContentType: defaultContentType,
						}),
					);
					expect(result).toEqual(
						expect.objectContaining({ path: expectedKey, eTag: 'etag' }),
					);
					expect(mockCreateMultipartUpload).toHaveBeenCalledTimes(1);
					expect(mockUploadPart).toHaveBeenCalledTimes(2);
					expect(mockCompleteMultipartUpload).toHaveBeenCalledTimes(1);
				},
			);
		});

		it('should throw if unsupported payload type is provided', async () => {
			mockMultipartUploadSuccess();
			const { multipartUploadJob } = getMultipartUploadHandlers({
				path: testPath,
				data: 1 as any,
			});
			await expect(multipartUploadJob()).rejects.toThrow(
				expect.objectContaining(
					validationErrorMap[StorageValidationErrorCode.InvalidUploadSource],
				),
			);
		});

		it('should upload a body that exceeds the size of default part size and parts count', async () => {
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
					path: testPath,
					data: file,
				},
				file.size,
			);
			await multipartUploadJob();
			expect(file.slice).toHaveBeenCalledTimes(10_000); // S3 limit of parts count
			expect(mockCreateMultipartUpload).toHaveBeenCalledTimes(1);
			expect(mockUploadPart).toHaveBeenCalledTimes(10_000);
			expect(mockCompleteMultipartUpload).toHaveBeenCalledTimes(1);
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
					path: testPath,
					data: new ArrayBuffer(8 * MB),
				},
				8 * MB,
			);
			try {
				await multipartUploadJob();
				fail('should throw error');
			} catch (e: any) {
				expect(e.message).toEqual(
					`Upload failed. Expected object size ${8 * MB}, but got 1.`,
				);
			}
		});

		it('should handle error case: create multipart upload request failed', async () => {
			expect.assertions(1);
			mockMultipartUploadSuccess();
			mockCreateMultipartUpload.mockReset();
			mockCreateMultipartUpload.mockRejectedValueOnce(new Error('error'));

			const { multipartUploadJob } = getMultipartUploadHandlers({
				path: testPath,
				data: new ArrayBuffer(8 * MB),
			});
			await expect(multipartUploadJob()).rejects.toThrow('error');
		});

		it('should handle error case: finish multipart upload failed', async () => {
			expect.assertions(1);
			mockMultipartUploadSuccess(disableAssertion);
			mockCompleteMultipartUpload.mockReset();
			mockCompleteMultipartUpload.mockRejectedValueOnce(new Error('error'));

			const { multipartUploadJob } = getMultipartUploadHandlers({
				path: testPath,
				data: new ArrayBuffer(8 * MB),
			});
			await expect(multipartUploadJob()).rejects.toThrow('error');
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
				path: testPath,
				data: new ArrayBuffer(8 * MB),
			});
			await expect(multipartUploadJob()).rejects.toThrow('error');
			expect(mockUploadPart).toHaveBeenCalledTimes(2);
			expect(mockCompleteMultipartUpload).not.toHaveBeenCalled();
		});
	});

	describe('upload caching', () => {
		const mockDefaultStorage = defaultStorage as jest.Mocked<
			typeof defaultStorage
		>;
		beforeEach(() => {
			mockDefaultStorage.getItem.mockReset();
			mockDefaultStorage.setItem.mockReset();
		});

		it('should send createMultipartUpload request if the upload task is not cached', async () => {
			mockMultipartUploadSuccess();
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					path: testPath,
					data: new ArrayBuffer(size),
				},
				size,
			);
			await multipartUploadJob();
			// 1 for caching upload task; 1 for remove cache after upload is completed
			expect(mockDefaultStorage.setItem).toHaveBeenCalledTimes(2);
			expect(mockCreateMultipartUpload).toHaveBeenCalledTimes(1);
			expect(mockListParts).not.toHaveBeenCalled();
		});

		it('should send createMultipartUpload request if the upload task is cached but outdated', async () => {
			mockDefaultStorage.getItem.mockResolvedValue(
				JSON.stringify({
					[testPathCacheKey]: {
						uploadId: 'uploadId',
						bucket,
						key: testPath,
						lastTouched: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
					},
				}),
			);
			mockMultipartUploadSuccess();
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					path: testPath,
					data: new ArrayBuffer(size),
				},
				size,
			);
			await multipartUploadJob();
			expect(mockCreateMultipartUpload).toHaveBeenCalledTimes(1);
			expect(mockListParts).not.toHaveBeenCalled();
			expect(mockUploadPart).toHaveBeenCalledTimes(2);
			expect(mockCompleteMultipartUpload).toHaveBeenCalledTimes(1);
		});

		it('should cache the upload with file including file lastModified property', async () => {
			mockMultipartUploadSuccess();
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					path: testPath,
					data: new File([new ArrayBuffer(size)], 'someName'),
				},
				size,
			);
			await multipartUploadJob();
			// 1 for caching upload task; 1 for remove cache after upload is completed
			expect(mockDefaultStorage.setItem).toHaveBeenCalledTimes(2);
			const cacheValue = JSON.parse(
				mockDefaultStorage.setItem.mock.calls[0][1],
			);

			// \d{13} is the file lastModified property of a file
			const lastModifiedRegex = /someName_\d{13}_/;

			expect(Object.keys(cacheValue)).toEqual([
				expect.stringMatching(
					new RegExp(lastModifiedRegex.source + testPathCacheKey),
				),
			]);
		});

		it('should send listParts request if the upload task is cached', async () => {
			mockDefaultStorage.getItem.mockResolvedValue(
				JSON.stringify({
					[testPathCacheKey]: {
						uploadId: 'uploadId',
						bucket,
						key: testPath,
						lastModified: Date.now(),
					},
				}),
			);
			mockMultipartUploadSuccess();
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					path: testPath,
					data: new ArrayBuffer(size),
				},
				size,
			);
			await multipartUploadJob();
			expect(mockCreateMultipartUpload).not.toHaveBeenCalled();
			expect(mockListParts).toHaveBeenCalledTimes(1);
			expect(mockUploadPart).toHaveBeenCalledTimes(2);
			expect(mockCompleteMultipartUpload).toHaveBeenCalledTimes(1);
		});

		it('should cache upload task if new upload task is created', async () => {
			mockMultipartUploadSuccess();
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					path: testPath,
					data: new ArrayBuffer(size),
				},
				size,
			);
			await multipartUploadJob();
			// 1 for caching upload task; 1 for remove cache after upload is completed
			expect(mockDefaultStorage.setItem).toHaveBeenCalledTimes(2);
			expect(mockDefaultStorage.setItem.mock.calls[0][0]).toEqual(
				UPLOADS_STORAGE_KEY,
			);
			const cacheValue = JSON.parse(
				mockDefaultStorage.setItem.mock.calls[0][1],
			);
			expect(Object.keys(cacheValue)).toEqual([
				expect.stringMatching(new RegExp(testPathCacheKey)),
			]);
		});

		it('should remove from cache if upload task is completed', async () => {
			mockMultipartUploadSuccess();
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					path: testPath,
					data: new ArrayBuffer(size),
				},
				size,
			);
			await multipartUploadJob();
			// 1 for caching upload task; 1 for remove cache after upload is completed
			expect(mockDefaultStorage.setItem).toHaveBeenCalledTimes(2);
			expect(mockDefaultStorage.setItem).toHaveBeenNthCalledWith(
				2,
				UPLOADS_STORAGE_KEY,
				JSON.stringify({}),
			);
		});

		it('should remove from cache if upload task is canceled', async () => {
			expect.assertions(2);
			mockMultipartUploadSuccess(disableAssertion);
			mockListParts.mockResolvedValueOnce({ Parts: [] });
			const size = 8 * MB;
			const { multipartUploadJob, onCancel } = getMultipartUploadHandlers(
				{
					path: testPath,
					data: new ArrayBuffer(size),
				},
				size,
			);
			const uploadJobPromise = multipartUploadJob();
			await uploadJobPromise;
			// 1 for caching upload task; 1 for remove cache after upload is completed
			expect(mockDefaultStorage.setItem).toHaveBeenCalledTimes(2);
			expect(mockDefaultStorage.setItem).toHaveBeenNthCalledWith(
				2,
				UPLOADS_STORAGE_KEY,
				JSON.stringify({}),
			);
		});
	});

	describe('cancel()', () => {
		it('should abort in-flight uploadPart requests and throw if upload is canceled', async () => {
			const { multipartUploadJob, onCancel } = getMultipartUploadHandlers({
				path: testPath,
				data: new ArrayBuffer(8 * MB),
			});
			let partCount = 0;
			mockMultipartUploadCancellation(() => {
				partCount++;
				if (partCount === 2) {
					onCancel(); // Cancel upload at the the last uploadPart call
				}
			});
			try {
				await multipartUploadJob();
				fail('should throw error');
			} catch (error: any) {
				expect(error).toBeInstanceOf(CanceledError);
				expect(error.message).toBe('Upload is canceled by user');
			}
			expect(mockAbortMultipartUpload).toHaveBeenCalledTimes(1);
			expect(mockUploadPart).toHaveBeenCalledTimes(2);
			expect(mockUploadPart.mock.calls[0][0].abortSignal?.aborted).toBe(true);
			expect(mockUploadPart.mock.calls[1][0].abortSignal?.aborted).toBe(true);
		});
	});

	describe('pause() & resume()', () => {
		it('should abort in-flight uploadPart requests if upload is paused', async () => {
			const { multipartUploadJob, onPause, onResume } =
				getMultipartUploadHandlers({
					path: testPath,
					data: new ArrayBuffer(8 * MB),
				});
			let partCount = 0;
			mockMultipartUploadCancellation(() => {
				partCount++;
				if (partCount === 2) {
					onPause(); // Pause upload at the the last uploadPart call
				}
			});
			const uploadPromise = multipartUploadJob();
			onResume();
			await uploadPromise;
			expect(mockUploadPart).toHaveBeenCalledTimes(2);
			expect(mockUploadPart.mock.calls[0][0].abortSignal?.aborted).toBe(true);
			expect(mockUploadPart.mock.calls[1][0].abortSignal?.aborted).toBe(true);
		});
	});

	describe('upload progress', () => {
		it('should send progress for in-flight upload parts', async () => {
			const onProgress = jest.fn();
			mockMultipartUploadSuccess();
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					path: testPath,
					data: new ArrayBuffer(8 * MB),
					options: {
						onProgress,
					},
				},
				8 * MB,
			);
			await multipartUploadJob();
			expect(onProgress).toHaveBeenCalledTimes(4); // 2 simulated onProgress events per uploadPart call are all tracked
			expect(onProgress).toHaveBeenNthCalledWith(1, {
				totalBytes: 8388608,
				transferredBytes: 2621440,
			});
			expect(onProgress).toHaveBeenNthCalledWith(2, {
				totalBytes: 8388608,
				transferredBytes: 5242880,
			});
			expect(onProgress).toHaveBeenNthCalledWith(3, {
				totalBytes: 8388608,
				transferredBytes: 6815744,
			});
			expect(onProgress).toHaveBeenNthCalledWith(4, {
				totalBytes: 8388608,
				transferredBytes: 8388608,
			});
		});

		it('should send progress for cached upload parts', async () => {
			mockMultipartUploadSuccess();

			const mockDefaultStorage = defaultStorage as jest.Mocked<
				typeof defaultStorage
			>;
			mockDefaultStorage.getItem.mockResolvedValue(
				JSON.stringify({
					[testPathCacheKey]: {
						uploadId: 'uploadId',
						bucket,
						key: testPath,
					},
				}),
			);
			mockListParts.mockResolvedValue({
				Parts: [{ PartNumber: 1 }],
			});

			const onProgress = jest.fn();
			const { multipartUploadJob } = getMultipartUploadHandlers(
				{
					path: testPath,
					data: new ArrayBuffer(8 * MB),
					options: {
						onProgress,
					},
				},
				8 * MB,
			);
			await multipartUploadJob();
			expect(onProgress).toHaveBeenCalledTimes(3);
			// The first part's 5 MB progress is reported even though no uploadPart call is made.
			expect(onProgress).toHaveBeenNthCalledWith(1, {
				totalBytes: 8388608,
				transferredBytes: 5242880,
			});
		});
	});
});
