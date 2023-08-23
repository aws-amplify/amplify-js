// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsAction } from '@aws-amplify/core/internals/utils';
import { record as recordCore } from '@aws-amplify/core/internals/providers/pinpoint';
import { AnalyticsError } from '../../../errors';
import { getAnalyticsUserAgentString } from '../../../utils/UserAgent';
import { PinpointRecordParameters } from '../types/parameters';
import { resolveConfig, resolveCredentials } from '../utils';

/**
 * Sends an event to Pinpoint.
 *
 * @param {RecordParameters} params Parameters used to construct the request.
 *
 * @throws An {@link AnalyticsError} when an error occurs invoking the API.
 *
 * @returns Returns a promise that will resolve when the request is complete.
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
	});
};
