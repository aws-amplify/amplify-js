// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	UNSIGNED_PAYLOAD,
	presignUrl,
} from '@aws-amplify/core/internals/aws-client-utils';

import { getPresignedPutObjectUrl } from '../../../../../../src/providers/s3/utils/client/s3data';

import { defaultConfigWithStaticCredentials } from './cases/shared';

jest.mock('@aws-amplify/core/internals/aws-client-utils', () => {
	const original = jest.requireActual(
		'@aws-amplify/core/internals/aws-client-utils',
	);
	const { presignUrl: getPresignedUrl } = original;

	return {
		...original,
		presignUrl: jest.fn((...args) => getPresignedUrl(...args)),
	};
});

const mockPresignUrl = presignUrl as jest.Mock;

describe('getPresignedPutObjectUrl', () => {
	it('should return put object API request', async () => {
		const actual = await getPresignedPutObjectUrl(
			{
				...defaultConfigWithStaticCredentials,
				signingRegion: defaultConfigWithStaticCredentials.region,
				signingService: 's3',
				expiration: 900,
				userAgentValue: 'UA',
			},
			{
				Bucket: 'bucket',
				Key: 'key',
			},
		);
		const actualUrl = actual;
		expect(actualUrl.hostname).toEqual(
			`bucket.s3.${defaultConfigWithStaticCredentials.region}.amazonaws.com`,
		);
		expect(actualUrl.pathname).toEqual('/key');
		expect(actualUrl.searchParams.get('X-Amz-Expires')).toEqual('900');
		expect(actualUrl.searchParams.get('x-amz-user-agent')).toEqual('UA');
	});

	it('should call presignUrl with uriEscapePath param set to false', async () => {
		await getPresignedPutObjectUrl(
			{
				...defaultConfigWithStaticCredentials,
				signingRegion: defaultConfigWithStaticCredentials.region,
				signingService: 's3',
				expiration: 900,
				userAgentValue: 'UA',
			},
			{
				Bucket: 'bucket',
				Key: 'key',
			},
		);

		expect(mockPresignUrl).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				uriEscapePath: false,
			}),
		);
	});

	it('should return put object API request with content type and disposition', async () => {
		const actual = await getPresignedPutObjectUrl(
			{
				...defaultConfigWithStaticCredentials,
				signingRegion: defaultConfigWithStaticCredentials.region,
				signingService: 's3',
				expiration: 900,
				userAgentValue: 'UA',
			},
			{
				Bucket: 'bucket',
				Key: 'key',
				ContentType: 'image/jpeg',
				ContentDisposition: 'attachment; filename="photo.jpg"',
			},
		);

		expect(actual).toEqual(
			expect.objectContaining({
				hostname: `bucket.s3.${defaultConfigWithStaticCredentials.region}.amazonaws.com`,
				pathname: '/key',
				searchParams: expect.objectContaining({
					get: expect.any(Function),
				}),
			}),
		);

		expect(actual.searchParams.get('X-Amz-Expires')).toBe('900');
		expect(actual.searchParams.get('content-type')).toBe('image/jpeg');
		expect(actual.searchParams.get('content-disposition')).toBe(
			'attachment; filename="photo.jpg"',
		);
		expect(actual.searchParams.get('x-amz-user-agent')).toBe('UA');
	});

	it('should use UNSIGNED-PAYLOAD for presigned URLs', async () => {
		mockPresignUrl.mockClear();

		const result = await getPresignedPutObjectUrl(
			{
				...defaultConfigWithStaticCredentials,
				signingRegion: defaultConfigWithStaticCredentials.region,
				signingService: 's3',
				expiration: 900,
			},
			{
				Bucket: 'bucket',
				Key: 'key',
			},
		);

		expect(mockPresignUrl).toHaveBeenCalledWith(
			expect.objectContaining({
				body: UNSIGNED_PAYLOAD,
			}),
			expect.anything(),
		);

		expect(result.searchParams.get('x-amz-content-sha256')).toBeNull();
	});
});
