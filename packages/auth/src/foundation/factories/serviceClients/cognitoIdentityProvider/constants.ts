// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getRetryDecider,
	jitteredBackoff,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';
import { getAmplifyUserAgent } from '@aws-amplify/core/internals/utils';

import { COGNITO_IDP_SERVICE_NAME } from '../../../constants';

export const DEFAULT_SERVICE_CLIENT_API_CONFIG = {
	service: COGNITO_IDP_SERVICE_NAME,
	retryDecider: getRetryDecider(parseJsonError),
	computeDelay: jitteredBackoff,
	userAgentValue: getAmplifyUserAgent(),
	cache: 'no-store',
};
