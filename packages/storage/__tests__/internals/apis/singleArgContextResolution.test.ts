// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable unused-imports/no-unused-vars */

import { AmplifyContext } from '@aws-amplify/core';
import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import {
	AWSCredentials,
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { list, remove, uploadData } from '../../../src/internals';
import {
	ListAllInput,
	ListPaginateInput,
	RemoveInput,
	UploadDataInput,
} from '../../../src/internals/types/inputs';
import {
	RemoveOutput,
	UploadDataOutput,
} from '../../../src/internals/types/outputs';
import { RemoveOperation } from '../../../src/providers/s3/types';
import {
	ListAllWithPathOutput,
	ListPaginateWithPathOutput,
} from '../../../src/providers/s3';
import {
	deleteObject,
	listObjectsV2,
	putObject,
} from '../../../src/providers/s3/utils/client/s3data';

/**
 * Regression tests for the e2e-discovered runtime signature break
 * (integ_react_storage_browser): consumers built against main (e.g. the
 * amplify-ui Storage Browser) call the internals data-plane APIs with a
 * SINGLE input argument — `uploadData({ path, data, options })`. A ctx-only
 * signature made the options bag land in `ctx` and `input` become
 * `undefined`, throwing a synchronous TypeError before any network call.
 *
 * These tests mock only the transfer boundary (the s3data HTTP client) and
 * the global context, exercising the real package internals end to end.
 */
jest.mock('../../../src/providers/s3/utils/client/s3data');

const mockPutObject = jest.mocked(putObject);
const mockDeleteObject = jest.mocked(deleteObject);
const mockListObjectsV2 = jest.mocked(listObjectsV2);

const bucket = 'bucket';
const region = 'us-east-1';
const identityId = 'identityId';
const credentials: AWSCredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const locationCredentials: AWSCredentials = {
	accessKeyId: 'grantAccessKeyId',
	sessionToken: 'grantSessionToken',
	secretAccessKey: 'grantSecretAccessKey',
	expiration: new Date(),
};

const globalCtx = createMockAmplifyContext({
	Storage: {
		S3: {
			bucket,
			region,
		},
	},
});

describe('internals data-plane APIs: single-arg (global-context) form', () => {
	// Mirrors the amplify-ui Storage Browser call shape: an options bag
	// carrying a locationCredentialsProvider (the access-grant path).
	let locationCredentialsProvider: jest.Mock;

	beforeAll(() => {
		setGlobalContext(globalCtx);
	});

	afterAll(() => {
		clearGlobalContext();
	});

	beforeEach(() => {
		globalCtx.fetchAuthSession.mockResolvedValue({
			identityId,
			credentials,
		});
		locationCredentialsProvider = jest
			.fn()
			.mockResolvedValue({ credentials: locationCredentials });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// The resolved s3Config.credentials is a union of static credentials and a
	// provider function; the access-grant path always wires a provider fn.
	// Narrow, invoke, and assert the locationCredentialsProvider supplied it.
	const expectAccessGrantCredentials = async (boundaryCredentials: unknown) => {
		expect(typeof boundaryCredentials).toBe('function');
		if (typeof boundaryCredentials !== 'function') return;
		await expect(boundaryCredentials()).resolves.toEqual(locationCredentials);
		expect(locationCredentialsProvider).toHaveBeenCalled();
	};

	describe('uploadData', () => {
		beforeEach(() => {
			mockPutObject.mockResolvedValue({
				ETag: 'eTag',
				$metadata: {},
			});
		});

		it('supports the single-arg form and reaches the transfer boundary with the access-grant provider', async () => {
			const result = await uploadData({
				path: 'public/photo.jpg',
				data: 'data',
				options: { locationCredentialsProvider },
			}).result;

			expect(result).toMatchObject({ path: 'public/photo.jpg' });
			expect(mockPutObject).toHaveBeenCalledTimes(1);

			const [s3Config, putInput] = mockPutObject.mock.calls[0];
			// Global-context config resolved through resolveS3ConfigAndInput.
			expect(s3Config.region).toBe(region);
			expect(putInput).toMatchObject({
				Bucket: bucket,
				Key: 'public/photo.jpg',
			});
			// The locationCredentialsProvider must be wired into the resolved
			// s3Config credentials provider — proves the access-grant path is
			// reachable again from the single-arg call form.
			await expectAccessGrantCredentials(s3Config.credentials);
		});

		it('keeps the explicit two-arg ctx form unchanged', async () => {
			const explicitCtx = createMockAmplifyContext({
				Storage: {
					S3: { bucket: 'explicit-bucket', region: 'eu-west-1' },
				},
			});
			explicitCtx.fetchAuthSession.mockResolvedValue({
				identityId,
				credentials,
			});

			const result = await uploadData(explicitCtx, {
				path: 'public/photo.jpg',
				data: 'data',
			}).result;

			expect(result).toMatchObject({ path: 'public/photo.jpg' });
			const [s3Config, putInput] = mockPutObject.mock.calls[0];
			expect(s3Config.region).toBe('eu-west-1');
			expect(putInput).toMatchObject({ Bucket: 'explicit-bucket' });
			// The explicit context — not the global one — served the request.
			expect(explicitCtx.fetchAuthSession).toHaveBeenCalled();
			expect(globalCtx.fetchAuthSession).not.toHaveBeenCalled();
		});
	});

	describe('remove', () => {
		beforeEach(() => {
			mockDeleteObject.mockResolvedValue({ $metadata: {} });
			// Not-a-folder answer for the isPathFolder probe.
			mockListObjectsV2.mockResolvedValue({
				Contents: [],
				CommonPrefixes: [],
				$metadata: {},
			});
		});

		it('supports the single-arg form and reaches the transfer boundary with the access-grant provider', async () => {
			const result = await remove({
				path: 'public/photo.jpg',
				options: { locationCredentialsProvider },
			}).result;

			expect(result).toEqual({ path: 'public/photo.jpg' });
			expect(mockDeleteObject).toHaveBeenCalledTimes(1);

			const [s3Config, deleteInput] = mockDeleteObject.mock.calls[0];
			expect(s3Config.region).toBe(region);
			expect(deleteInput).toMatchObject({
				Bucket: bucket,
				Key: 'public/photo.jpg',
			});
			await expectAccessGrantCredentials(s3Config.credentials);
		});

		it('keeps the explicit two-arg ctx form unchanged', async () => {
			const explicitCtx = createMockAmplifyContext({
				Storage: {
					S3: { bucket: 'explicit-bucket', region: 'eu-west-1' },
				},
			});
			explicitCtx.fetchAuthSession.mockResolvedValue({
				identityId,
				credentials,
			});

			const result = await remove(explicitCtx, {
				path: 'public/photo.jpg',
			}).result;

			expect(result).toEqual({ path: 'public/photo.jpg' });
			const [s3Config, deleteInput] = mockDeleteObject.mock.calls[0];
			expect(s3Config.region).toBe('eu-west-1');
			expect(deleteInput).toMatchObject({ Bucket: 'explicit-bucket' });
			expect(globalCtx.fetchAuthSession).not.toHaveBeenCalled();
		});
	});

	describe('list', () => {
		beforeEach(() => {
			// The internal list validates that the service echoed the request
			// parameters (integrity check), so the mock must echo them back.
			mockListObjectsV2.mockImplementation(async (_config, input) => ({
				Contents: [],
				Name: input.Bucket,
				Prefix: input.Prefix,
				MaxKeys: input.MaxKeys,
				Delimiter: input.Delimiter,
				ContinuationToken: input.ContinuationToken,
				$metadata: {},
			}));
		});

		it('supports the single-arg form and reaches the transfer boundary with the access-grant provider', async () => {
			const result = await list({
				path: 'public/',
				options: { locationCredentialsProvider },
			});

			expect(result.items).toEqual([]);
			expect(mockListObjectsV2).toHaveBeenCalledTimes(1);

			const [s3Config, listInput] = mockListObjectsV2.mock.calls[0];
			expect(s3Config.region).toBe(region);
			expect(listInput).toMatchObject({
				Bucket: bucket,
				Prefix: 'public/',
			});
			await expectAccessGrantCredentials(s3Config.credentials);
		});

		it('keeps the explicit two-arg ctx form unchanged', async () => {
			const explicitCtx = createMockAmplifyContext({
				Storage: {
					S3: { bucket: 'explicit-bucket', region: 'eu-west-1' },
				},
			});
			explicitCtx.fetchAuthSession.mockResolvedValue({
				identityId,
				credentials,
			});

			const result = await list(explicitCtx, { path: 'public/' });

			expect(result.items).toEqual([]);
			const [s3Config, listInput] = mockListObjectsV2.mock.calls[0];
			expect(s3Config.region).toBe('eu-west-1');
			expect(listInput).toMatchObject({ Bucket: 'explicit-bucket' });
			expect(globalCtx.fetchAuthSession).not.toHaveBeenCalled();
		});
	});

	describe('signature contract (type-level)', () => {
		// Type-only assertions: the enclosing arrow is never invoked, so nothing
		// executes at runtime; ts-jest type-checks this file at transform time.
		const typeOnly = (ctx: AmplifyContext) => {
			const uploadInput: UploadDataInput = { path: 'p', data: 'd' };
			const singleArgUpload: UploadDataOutput = uploadData(uploadInput);
			const ctxFirstUpload: UploadDataOutput = uploadData(ctx, uploadInput);

			const removeInput: RemoveInput = { path: 'p' };
			const singleArgRemove: RemoveOperation<RemoveOutput> =
				remove(removeInput);
			const ctxFirstRemove: RemoveOperation<RemoveOutput> = remove(
				ctx,
				removeInput,
			);

			const listAllInput: ListAllInput = {
				path: 'p',
				options: { listAll: true },
			};
			const singleArgListAll: Promise<ListAllWithPathOutput> =
				list(listAllInput);
			const ctxFirstListAll: Promise<ListAllWithPathOutput> = list(
				ctx,
				listAllInput,
			);

			const listPaginateInput: ListPaginateInput = { path: 'p' };
			const singleArgListPaginate: Promise<ListPaginateWithPathOutput> =
				list(listPaginateInput);
			const ctxFirstListPaginate: Promise<ListPaginateWithPathOutput> = list(
				ctx,
				listPaginateInput,
			);
		};

		test('both call forms compile for uploadData, remove and list', () => {
			expect(typeOnly).toBeInstanceOf(Function);
		});
	});
});
