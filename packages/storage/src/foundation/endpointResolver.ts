// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyUrl } from '@aws-amplify/core/internals/utils';
import { getDnsSuffix } from '@aws-amplify/core/internals/aws-client-utils';

import { S3EndpointResolverOptions } from './factories/serviceClients/s3/s3data/types';
import { isDnsCompatibleBucketName } from './isDnsCompatibleBucketName';

// TODO(ashwinkumar6): remove duplicate storage/src/providers/s3/utils/client/s3data/base.ts

/**
 * The endpoint resolver function that returns the endpoint URL for a given region, and input parameters.
 */
export const endpointResolver = (
	options: S3EndpointResolverOptions,
	apiInput?: { Bucket?: string },
) => {
	const { region, useAccelerateEndpoint, customEndpoint, forcePathStyle } =
		options;
	let endpoint: URL;
	// 1. get base endpoint
	if (customEndpoint) {
		endpoint = new AmplifyUrl(customEndpoint);
	} else if (useAccelerateEndpoint) {
		if (forcePathStyle) {
			throw new Error(
				'Path style URLs are not supported with S3 Transfer Acceleration.',
			);
		}
		endpoint = new AmplifyUrl(`https://s3-accelerate.${getDnsSuffix(region)}`);
	} else {
		endpoint = new AmplifyUrl(`https://s3.${region}.${getDnsSuffix(region)}`);
	}
	// 2. inject bucket name
	if (apiInput?.Bucket) {
		if (!isDnsCompatibleBucketName(apiInput.Bucket)) {
			throw new Error(`Invalid bucket name: "${apiInput.Bucket}".`);
		}
		if (forcePathStyle || apiInput.Bucket.includes('.')) {
			endpoint.pathname = `/${apiInput.Bucket}`;
		} else {
			endpoint.host = `${apiInput.Bucket}.${endpoint.host}`;
		}
	}

	return { url: endpoint };
};
