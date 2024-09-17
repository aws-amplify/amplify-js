// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(ashwinkumar6): remove duplicate storage/src/providers/s3/utils/client/s3data/base.ts
import { getAmplifyUserAgent } from '@aws-amplify/core/internals/utils';
import { jitteredBackoff } from '@aws-amplify/core/internals/aws-client-utils';

import { retryDecider } from '../retryDecider';
import { endpointResolver } from '../../../../endpointResolver';
import { SERVICE_NAME } from '../../../../constants';

/**
 * @internal
 */
export const DEFAULT_SERVICE_CLIENT_API_CONFIG = {
	service: SERVICE_NAME,
	endpointResolver,
	retryDecider,
	computeDelay: jitteredBackoff,
	userAgentValue: getAmplifyUserAgent(),
	useAccelerateEndpoint: false,
	uriEscapePath: false, // Required by S3. See https://github.com/aws/aws-sdk-js-v3/blob/9ba012dfa3a3429aa2db0f90b3b0b3a7a31f9bc3/packages/signature-v4/src/SignatureV4.ts#L76-L83
};
