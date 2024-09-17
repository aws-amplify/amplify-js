// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { endpointResolver } from '../../src/foundation/endpointResolver';
import { SERVICE_NAME } from '../../src/foundation/constants';

const region = 'us-west-2';

describe('endpointResolver', () => {
	it('should return default base endpoint', async () => {
		const { url } = endpointResolver({ region });

		expect(url instanceof AmplifyUrl).toBe(true);
		expect(url.toString()).toStrictEqual(
			`https://${SERVICE_NAME}.${region}.amazonaws.com/`,
		);
	});

	it('should return custom endpoint', async () => {
		const customEndpoint = 'http://test.com/';
		const { url } = endpointResolver({ region, customEndpoint });

		expect(url instanceof AmplifyUrl).toBe(true);
		expect(url.toString()).toStrictEqual(`${customEndpoint}`);
	});

	it('should return accelerate endpoint', async () => {
		const { url } = endpointResolver({ region, useAccelerateEndpoint: true });

		expect(url instanceof AmplifyUrl).toBe(true);
		expect(url.toString()).toStrictEqual(
			`https://${SERVICE_NAME}-accelerate.amazonaws.com/`,
		);
	});

	it('should return endpoint with bucket name', async () => {
		const bucketName = 'mybucket';
		const { url } = endpointResolver({ region }, { Bucket: bucketName });

		expect(url instanceof AmplifyUrl).toBe(true);
		expect(url.toString()).toStrictEqual(
			`https://${bucketName}.${SERVICE_NAME}.${region}.amazonaws.com/`,
		);
	});

	it('should return endpoint with bucket name with forcePathStyle enabled', async () => {
		const bucketName = 'mybucket';
		const { url } = endpointResolver(
			{ region, forcePathStyle: true },
			{ Bucket: bucketName },
		);

		expect(url instanceof AmplifyUrl).toBe(true);
		expect(url.toString()).toStrictEqual(
			`https://${SERVICE_NAME}.${region}.amazonaws.com/${bucketName}`,
		);
	});
});
