// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDnsSuffix } from '../../clients/endpoints';
import {
	getRetryDecider,
	jitteredBackoff,
} from '../../clients/middleware/retry';
import { parseJsonError } from '../../clients/serde/json';
import type { EndpointResolverOptions, Headers } from '../../clients/types';
import { getAmplifyUserAgent } from '../../Platform';
import { AmplifyUrl } from '../../utils/amplifyUrl';

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
