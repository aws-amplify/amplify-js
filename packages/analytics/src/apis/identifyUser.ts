// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { IdentifyUserParameters } from '../types';
import { identifyUser as pinpointIdentifyUser } from '../providers/pinpoint';

/**
 * Identifies the current user with the analytics service.
 *
 * @param {IdentifyUserParameters} params parameters used to construct requests sent to service.
 *
 * @throws An {@link UpdateEndpointException} when the underlying service returns an error.
 * @throws An {@link AnalyticsValidationErrorCode} when API call parameters are invalid.
 */
export const identifyUser = async (
	params: IdentifyUserParameters
): Promise<void> => pinpointIdentifyUser(params);
