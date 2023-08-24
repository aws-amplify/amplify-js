// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AnalyticsAction,
	ConsoleLogger as Logger,
} from '@aws-amplify/core/internals/utils';
import { record as recordCore } from '@aws-amplify/core/internals/providers/pinpoint';
import {
	AnalyticsError,
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';
import { getAnalyticsUserAgentString } from '../../../utils/userAgent';
import { PinpointRecordParameters } from '../types/parameters';
import { resolveConfig, resolveCredentials } from '../utils';

const logger = new Logger('Analytics');

/**
 * Sends an event to Pinpoint.
 *
 * @param {RecordParameters} params Parameters used to construct the request.
 *
 * @throws An {@link AnalyticsValidationErrorCode} when there is an error in the parameters or configuration.
 *
 * @returns Returns a promise that will resolve when the request is complete.
 */
export const record = ({ event }: PinpointRecordParameters): void => {
	const { appId, region } = resolveConfig();

	assertValidationError(!!event, AnalyticsValidationErrorCode.NoEvent);
	assertValidationError(!!event.name, AnalyticsValidationErrorCode.NoEventName);

	resolveCredentials()
		.then(({ credentials, identityId }) => {
			recordCore({
				appId,
				category: 'Analytics',
				credentials,
				event,
				identityId,
				region,
				userAgentValue: getAnalyticsUserAgentString(AnalyticsAction.Record),
			});
		})
		.catch(e => {
			// An error occured while fetching credentials or persisting the event to the buffer
			logger.warn('Failed to record event.', e);
		});
};
