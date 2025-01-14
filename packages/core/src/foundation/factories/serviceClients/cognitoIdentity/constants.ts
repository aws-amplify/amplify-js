// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getRetryDecider,
	jitteredBackoff,
	parseJsonError,
} from '../../../../clients';

/**
 * The service name used to sign requests if the API requires authentication.
 */
export const COGNITO_IDENTITY_SERVICE_NAME = 'cognito-identity';

export const DEFAULT_SERVICE_CLIENT_API_CONFIG = {
	service: COGNITO_IDENTITY_SERVICE_NAME,
	retryDecider: getRetryDecider(parseJsonError),
	computeDelay: jitteredBackoff,
	cache: 'no-store',
};
