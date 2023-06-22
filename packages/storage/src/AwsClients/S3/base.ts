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

/**
 * The service name used to sign requests if the API requires authentication.
 */
const SERVICE_NAME = 's3';

type S3EndpointResolverOptions = EndpointResolverOptions & {
	useAccelerateEndpoint?: boolean;
};

/**
 * The endpoint resolver function that returns the endpoint URL for a given region, and input parameters.
 */
const endpointResolver = ({
	region,
	useAccelerateEndpoint,
}: S3EndpointResolverOptions) => {
	// TODO: [V6] support force path style.
	if (useAccelerateEndpoint) {
		return { url: new URL(`https://s3-accelerate.${getDnsSuffix(region)}`) };
	} else {
		return { url: new URL(`https://s3.${region}.${getDnsSuffix(region)}`) };
	}
};

/**
 * @internal
 */
export const defaultConfig = {
	service: SERVICE_NAME,
	endpointResolver,
	retryDecider: getRetryDecider(parseXmlError),
	computeDelay: jitteredBackoff,
	userAgentValue: getAmplifyUserAgent(), // TODO: use getAmplifyUserAgentString() when available.
	useAccelerateEndpoint: false,
	uriEscapePath: false, // Required by S3. See https://github.com/aws/aws-sdk-js-v3/blob/9ba012dfa3a3429aa2db0f90b3b0b3a7a31f9bc3/packages/signature-v4/src/SignatureV4.ts#L76-L83
};
