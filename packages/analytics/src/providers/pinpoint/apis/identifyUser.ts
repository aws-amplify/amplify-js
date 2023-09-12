// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsAction } from '@aws-amplify/core/internals/utils';
import { updateEndpoint } from '@aws-amplify/core/internals/providers/pinpoint';
import { AnalyticsValidationErrorCode } from '../../../errors';
import { getAnalyticsUserAgentString } from '../../../utils/userAgent';
import { IdentifyUserInput, UpdateEndpointException } from '../types';
import { resolveConfig, resolveCredentials } from '../utils';

/**
 * Identifies the current user with Pinpoint.
 *
 * @param {IdentifyUserParameters} params parameters used to construct requests sent to Pinpoint's UpdateEndpoint API.
 *
 * @throws An {@link UpdateEndpointException} when the underlying Pinpoint service returns an error.
 * @throws An {@link AnalyticsValidationErrorCode} when API call parameters are invalid.
 */
export const identifyUser = async ({
	userId,
	userProfile,
}: IdentifyUserInput): Promise<void> => {
	const { credentials, identityId } = await resolveCredentials();
	const { appId, region } = resolveConfig();
	updateEndpoint({
		appId,
		category: 'Analytics',
		credentials,
		identityId,
		region,
		userId,
		userProfile,
		userAgentValue: getAnalyticsUserAgentString(AnalyticsAction.UpdateEndpoint),
	});
};
