// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyUserAgent } from '@aws-amplify/core';
import {
	getDnsSuffix,
	jitteredBackoff,
	getRetryDecider,
	EndpointResolverOptions,
} from '@aws-amplify/core/internals/aws-client-utils';
import { parseXmlError } from './utils';

const DOMAIN_PATTERN = /^[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]$/;
const IP_ADDRESS_PATTERN = /(\d+\.){3}\d+/;
const DOTS_PATTERN = /\.\./;

/**
 * The service name used to sign requests if the API requires authentication.
 */
export const SERVICE_NAME = 's3';

/**
 * Options for endpoint resolver.
 *
 * @internal
 */
export type S3EndpointResolverOptions = EndpointResolverOptions & {
	/**
	 * Whether to use the S3 Transfer Acceleration endpoint.
	 */
	useAccelerateEndpoint?: boolean;
	/**
	 * Fully qualified custom endpoint for S3. If this is set, this endpoint will be used regardless of region or
	 * useAccelerateEndpoint config.
	 * The path of this endpoint
	 */
	customEndpoint?: string;

	/**
	 * Whether to force path style URLs for S3 objects (e.g., https://s3.amazonaws.com/<bucketName>/<key> instead of
	 * https://<bucketName>.s3.amazonaws.com/<key>
	 * @default false
	 */
	forcePathStyle?: boolean;
};

/**
 * The endpoint resolver function that returns the endpoint URL for a given region, and input parameters.
 */
const endpointResolver = (
	options: S3EndpointResolverOptions,
	apiInput?: { Bucket?: string }
) => {
	const { region, useAccelerateEndpoint, customEndpoint, forcePathStyle } =
		options;
	let endpoint: URL;
	// 1. get base endpoint
	if (customEndpoint) {
		endpoint = new URL(customEndpoint);
	} else if (useAccelerateEndpoint) {
		if (forcePathStyle) {
			throw new Error(
				'Path style URLs are not supported with S3 Transfer Acceleration.'
			);
		}
		endpoint = new URL(`https://s3-accelerate.${getDnsSuffix(region)}`);
	} else {
		endpoint = new URL(`https://s3.${region}.${getDnsSuffix(region)}`);
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

/**
 * Determines whether a given string is DNS compliant per the rules outlined by
 * S3. Length, capitaization, and leading dot restrictions are enforced by the
 * DOMAIN_PATTERN regular expression.
 * @internal
 *
 * @see https://github.com/aws/aws-sdk-js-v3/blob/f2da6182298d4d6b02e84fb723492c07c27469a8/packages/middleware-bucket-endpoint/src/bucketHostnameUtils.ts#L39-L48
 * @see https://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html
 */
export const isDnsCompatibleBucketName = (bucketName: string): boolean =>
	DOMAIN_PATTERN.test(bucketName) &&
	!IP_ADDRESS_PATTERN.test(bucketName) &&
	!DOTS_PATTERN.test(bucketName);

/**
 * @internal
 */
export const defaultConfig = {
	service: SERVICE_NAME,
	endpointResolver,
	retryDecider: getRetryDecider(parseXmlError),
	computeDelay: jitteredBackoff,
	userAgentValue: getAmplifyUserAgent(),
	useAccelerateEndpoint: false,
	uriEscapePath: false, // Required by S3. See https://github.com/aws/aws-sdk-js-v3/blob/9ba012dfa3a3429aa2db0f90b3b0b3a7a31f9bc3/packages/signature-v4/src/SignatureV4.ts#L76-L83
};
