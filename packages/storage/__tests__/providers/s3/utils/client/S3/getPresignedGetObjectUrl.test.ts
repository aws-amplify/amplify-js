// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { presignUrl } from '@aws-amplify/core/internals/aws-client-utils';

import { getPresignedGetObjectUrl } from '../../../../../../src/providers/s3/utils/client';

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

describe('serializeGetObjectRequest', () => {
	it('should return get object API request', async () => {
		const actual = await getPresignedGetObjectUrl(
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
		expect(actualUrl.searchParams.get('x-amz-content-sha256')).toEqual(
			expect.any(String),
		);
		expect(actualUrl.searchParams.get('x-amz-user-agent')).toEqual('UA');
	});

	it('should call presignUrl with uriEscapePath param set to false', async () => {
		await getPresignedGetObjectUrl(
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
});
