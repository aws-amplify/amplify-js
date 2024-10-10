// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyUrl,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';
import {
	EndpointResolverOptions,
	getDnsSuffix,
	jitteredBackoff,
} from '@aws-amplify/core/internals/aws-client-utils';

import { createRetryDecider, createXmlErrorParser } from '../utils';

const DOMAIN_PATTERN = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;
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
	 *	Prepends a custom endpoint with information dependent on endpoint type (e.g., https://[account-id].s3-control-fips.us-west-2.amazonaws.com)
	 */
	baseEndpoint?: string;

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
	apiInput?: { Bucket?: string },
) => {
	const {
		region,
		useAccelerateEndpoint,
		customEndpoint,
		baseEndpoint,
		forcePathStyle,
	} = options;
	let endpoint: URL;
	// 1. get base endpoint
	if (customEndpoint) {
		if (baseEndpoint) {
			endpoint = new AmplifyUrl(
				`https://${baseEndpoint}.${customEndpoint.replace('https://', '')}`,
			);
		} else {
			endpoint = new AmplifyUrl(customEndpoint);
		}
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
 * Error parser for the XML payload of S3 data plane error response. The error's
 * `Code` and `Message` locates directly at the XML root element.
 *
 * @example
 * ```
 * <?xml version="1.0" encoding="UTF-8"?>
 * 	<Error>
 * 		<Code>NoSuchKey</Code>
 * 		<Message>The resource you requested does not exist</Message>
 * 		<Resource>/mybucket/myfoto.jpg</Resource>
 * 		<RequestId>4442587FB7D0A2F9</RequestId>
 * 	</Error>
 * 	```
 *
 * @internal
 */
export const parseXmlError = createXmlErrorParser({ noErrorWrapping: true });

/**
 * @internal
 */
export const retryDecider = createRetryDecider(parseXmlError);

/**
 * @internal
 */
export const defaultConfig = {
	service: SERVICE_NAME,
	endpointResolver,
	retryDecider,
	computeDelay: jitteredBackoff,
	userAgentValue: getAmplifyUserAgent(),
	useAccelerateEndpoint: false,
	uriEscapePath: false, // Required by S3. See https://github.com/aws/aws-sdk-js-v3/blob/9ba012dfa3a3429aa2db0f90b3b0b3a7a31f9bc3/packages/signature-v4/src/SignatureV4.ts#L76-L83
};
