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
import { assertValidationError } from '../../../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../../../errors/types/validation';

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
	 * Fully qualified custom endpoint for S3. If this is set, this endpoint will be used regardless of region.
	 *
	 * A fully qualified custom endpoint for S3. If set, this endpoint will override
	 * the default S3 control endpoint and be used regardless of the specified region configuration.
	 *
	 * Refer to AWS documentation for more details on available endpoints:
	 * https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region
	 *
	 * @example
	 * ```ts
	 * // Examples of S3 custom endpoints
	 * const endpoint1 = "s3-control.us-east-2.amazonaws.com";
	 * const endpoint2 = "s3-control.dualstack.us-east-2.amazonaws.com";
	 * const endpoint3 = "s3-control-fips.dualstack.us-east-2.amazonaws.com";
	 * ```
	 */
	customEndpoint?: string;
};

/**
 * The endpoint resolver function that returns the endpoint URL for a given region, and input parameters.
 */
const endpointResolver = (
	options: S3EndpointResolverOptions,
	apiInput: { AccountId: string },
) => {
	const { region, customEndpoint } = options;
	const { AccountId: accountId } = apiInput;
	let endpoint: URL;

	if (customEndpoint) {
		assertValidationError(
			!customEndpoint.includes('://'),
			StorageValidationErrorCode.InvalidCustomEndpoint,
		);
		endpoint = new AmplifyUrl(`https://${accountId}.${customEndpoint}`);
	} else {
		endpoint = new AmplifyUrl(
			`https://${accountId}.s3-control.${region}.${getDnsSuffix(region)}`,
		);
	}

	return { url: endpoint };
};

/**
 * Error parser for the XML payload of S3 control plane error response. The
 * error's `Code` and `Message` locates at the nested `Error` element instead of
 * the XML root element.
 *
 * @example
 * ```
 * 	<?xml version="1.0" encoding="UTF-8"?>
 * 	<ErrorResponse>
 * 	  <Error>
 * 		  <Code>AccessDenied</Code>
 * 		  <Message>Access Denied</Message>
 * 		</Error>
 * 		<RequestId>656c76696e6727732072657175657374</RequestId>
 * 		<HostId>Uuag1LuByRx9e6j5Onimru9pO4ZVKnJ2Qz7/C1NPcfTWAtRPfTaOFg==</HostId>
 * 	</ErrorResponse>
 * 	```
 *
 * @internal
 */
export const parseXmlError = createXmlErrorParser();

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
	uriEscapePath: false, // Required by S3. See https://github.com/aws/aws-sdk-js-v3/blob/9ba012dfa3a3429aa2db0f90b3b0b3a7a31f9bc3/packages/signature-v4/src/SignatureV4.ts#L76-L83
};
