// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsAction } from '@aws-amplify/core';
import { record as recordCore } from '@aws-amplify/core/internals/providers/pinpoint';
import { getAnalyticsUserAgentString } from '../../../utils/UserAgent';
import { PinpointRecordParameters } from '../types/parameters';
import { resolveConfig, resolveCredentials } from '../utils';

/**
 * Sends an event to Pinpoint.
 * 
 * @param params - An AnalyticsEvent to send.
 * 
 * @throws -{@link AnalyticsError }
 * Thrown when an error occurs sending the event.
 * 
 * @returns Returns a promise that will resolve with the results of operation.
 */
export const record = async ({
	event,
	sendImmediately = true,
}: PinpointRecordParameters): Promise<void> => {
	const { credentials, identityId } = await resolveCredentials();
	const { appId, region } = resolveConfig();

	recordCore({
		appId,
		category: 'Analytics',
		credentials,
		event,
		identityId,
		region,
		sendImmediately,
		userAgentValue: getAnalyticsUserAgentString(AnalyticsAction.Record),
	})
};
