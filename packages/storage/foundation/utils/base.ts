/* eslint-disable import/order */
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

import {
	createRetryDecider,
	createXmlErrorParser,
} from '../../src/providers/s3/utils/client/utils';
import { assertValidationError } from '../assertions/assertValidationError';
import { LOCAL_TESTING_S3_ENDPOINT } from './constants';
import { StorageValidationErrorCode } from '../../src/internals';

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
	useAccelerateEndpoint?: boolean;
	customEndpoint?: string;
	forcePathStyle?: boolean;
};

/**
 * The endpoint resolver function that returns the endpoint URL for a given region, and input parameters.
 */
const endpointResolver = (
	options: S3EndpointResolverOptions,
	apiInput?: { Bucket?: string },
) => {
	const { region, useAccelerateEndpoint, customEndpoint, forcePathStyle } =
		options;
	let endpoint: URL;
	// 1. get base endpoint
	if (customEndpoint) {
		if (customEndpoint === LOCAL_TESTING_S3_ENDPOINT) {
			endpoint = new AmplifyUrl(customEndpoint);
		}
		assertValidationError(
			!customEndpoint.includes('://'),
			StorageValidationErrorCode.InvalidCustomEndpoint,
		);
		endpoint = new AmplifyUrl(`https://${customEndpoint}`);
	} else if (useAccelerateEndpoint) {
		assertValidationError(
			!forcePathStyle,
			StorageValidationErrorCode.ForcePathStyleEndpointNotSupported,
		);
		endpoint = new AmplifyUrl(`https://s3-accelerate.${getDnsSuffix(region)}`);
	} else {
		endpoint = new AmplifyUrl(`https://s3.${region}.${getDnsSuffix(region)}`);
	}
	// 2. inject bucket name
	if (apiInput?.Bucket) {
		assertValidationError(
			isDnsCompatibleBucketName(apiInput.Bucket),
			StorageValidationErrorCode.DnsIncompatibleBucketName,
		);

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
 */
export const isDnsCompatibleBucketName = (bucketName: string): boolean =>
	DOMAIN_PATTERN.test(bucketName) &&
	!IP_ADDRESS_PATTERN.test(bucketName) &&
	!DOTS_PATTERN.test(bucketName);

/**
 * Error parser for the XML payload of S3 data plane error response.
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
	get userAgentValue() {
		return getAmplifyUserAgent();
	},
	useAccelerateEndpoint: false,
	uriEscapePath: false,
};
