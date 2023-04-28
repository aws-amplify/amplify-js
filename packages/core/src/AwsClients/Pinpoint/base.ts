// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	jitteredBackoff,
	getRetryDecider,
} from '../../clients/middleware/retry';
import { parseJsonError } from '../../clients/serde/json';
import type { Headers } from '../../clients/types';
import { getAmplifyUserAgent } from '../../Platform';

/**
 * The service name used to sign requests if the API requires authentication.
 */
const SERVICE_NAME = 'mobiletargeting';

/**
 * The endpoint resolver function that returns the endpoint URL for a given region.
 */
const endpointResolver = (endpointOptions: { region: string }) => ({
	url: new URL(`https://pinpoint.${endpointOptions.region}.amazonaws.com`),
});

/**
 * @internal
 */
export const defaultConfig = {
	service: SERVICE_NAME,
	endpointResolver,
	retryDecider: getRetryDecider(parseJsonError),
	computeDelay: jitteredBackoff,
	userAgentValue: getAmplifyUserAgent(), // TODO: use getAmplifyUserAgentString() when available.
};

/**
 * @internal
 */
export const getSharedHeaders = (): Headers => ({
	'content-type': 'application/json',
});
