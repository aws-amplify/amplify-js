// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDnsSuffix } from '~/src/clients/endpoints';
import {
	getRetryDecider,
	jitteredBackoff,
} from '~/src/clients/middleware/retry';
import { parseJsonError } from '~/src/clients/serde/json';
import { getAmplifyUserAgent } from '~/src/Platform';
import { AmplifyUrl } from '~/src/utils/amplifyUrl';
import type { EndpointResolverOptions, Headers } from '~/src/clients/types';

/**
 * The service name used to sign requests if the API requires authentication.
 */
const SERVICE_NAME = 'mobiletargeting';

/**
 * The endpoint resolver function that returns the endpoint URL for a given region.
 */
const endpointResolver = ({ region }: EndpointResolverOptions) => ({
	url: new AmplifyUrl(`https://pinpoint.${region}.${getDnsSuffix(region)}`),
});

/**
 * @internal
 */
export const defaultConfig = {
	service: SERVICE_NAME,
	endpointResolver,
	retryDecider: getRetryDecider(parseJsonError),
	computeDelay: jitteredBackoff,
	userAgentValue: getAmplifyUserAgent(),
};

/**
 * @internal
 */
export const getSharedHeaders = (): Headers => ({
	'content-type': 'application/json',
});
