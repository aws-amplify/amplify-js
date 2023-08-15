// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from "@aws-amplify/core";
import { 
	AnalyticsEvent
} from "../../../types";
import { AnalyticsError } from '../../../errors/AnalyticsError';
import { assertValidationError } from "../../../errors/utils/assertValidationError";
import { AnalyticsValidationErrorCode } from "../../../errors/types/errors";

/**
 * Sends an event to Pinpoint.
 * 
 * @param params - An AnalyticsEvent to send to Pinpoint.
 * 
 * @throws -{@link AnalyticsError }
 * Thrown when an error occurs sending the event.
 * 
 * @returns Returns a promise that will resolve with the results of operation.
 */
export const record = async (params: AnalyticsEvent) => {
	// Load configuration & credentials
	const analyticsConfig = AmplifyV6.getConfig().Analytics;
	const { credentials } = await AmplifyV6.Auth.fetchAuthSession();

	assertValidationError(
		!!analyticsConfig?.appId || !!analyticsConfig?.region, 
		AnalyticsValidationErrorCode.InvalidAnalyticsConfiguration
	);
	assertValidationError(!!credentials, AnalyticsValidationErrorCode.NoCredentials);

	// TODO(v6) Attach the session & generate an event ID

	// TODO(v6) Refactor event buffer

	// TODO(v6) Refactor send event client
};