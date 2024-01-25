// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RecordInput } from '../types';
import {
	autoTrackMedia,
	getEventBuffer,
	resolveCachedSession,
	resolveConfig,
	updateCachedSession,
} from '../utils';
import {
	getAnalyticsUserAgentString,
	isAnalyticsEnabled,
	resolveCredentials,
} from '../../../utils';
import { AnalyticsAction } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';
import {
	IDENTIFY_EVENT_TYPE,
	MEDIA_AUTO_TRACK_EVENT_TYPE,
} from '../utils/constants';

const logger = new ConsoleLogger('Personalize');

/**
 * Record one analytic event and send it to Personalize. Events will be buffered and periodically sent to Amazon
 * Personalize.
 *
 * For more examples, you can refer to {@link https://docs.amplify.aws/javascript/build-a-backend/more-features/analytics/personalize-recommendations/#working-with-the-api the API usage guidance.}
 *
 * @param input The input object used to construct the request.
 *
 * @throws validation: {@link AnalyticsValidationErrorCode} - Thrown when the provided parameters or library
 *  configuration is incorrect.
 *
 * @example
 * ```ts
 * // Record an `Identify` event to Personalize.
 * record({
 *   eventType: "Identify",
 *   properties: {
 *     userId: "<USER_ID>"
 *   }
 * });
 * ```
 * @param input - The event to record.
 *
 * @returns void
 */
export const record = ({
	userId,
	eventId,
	eventType,
	properties,
}: RecordInput): void => {
	if (!isAnalyticsEnabled()) {
		logger.debug('Analytics is disabled, event will not be recorded.');
		return;
	}

	const { region, trackingId, bufferSize, flushSize, flushInterval } =
		resolveConfig();
	resolveCredentials()
		.then(async ({ credentials, identityId }) => {
			const timestamp = Date.now();
			const { sessionId: cachedSessionId, userId: cachedUserId } =
				await resolveCachedSession();
			if (eventType === IDENTIFY_EVENT_TYPE) {
				updateCachedSession(
					typeof properties.userId === 'string' ? properties.userId : '',
					cachedSessionId,
					cachedUserId
				);
			} else if (!!userId) {
				updateCachedSession(userId, cachedSessionId, cachedUserId);
			}

			const { sessionId: updatedSessionId, userId: updatedUserId } =
				await resolveCachedSession();

			const eventBuffer = getEventBuffer({
				region,
				flushSize,
				flushInterval,
				bufferSize,
				credentials,
				identityId,
				userAgentValue: getAnalyticsUserAgentString(AnalyticsAction.Record),
			});

			if (eventType === MEDIA_AUTO_TRACK_EVENT_TYPE) {
				autoTrackMedia(
					{
						trackingId,
						sessionId: updatedSessionId,
						userId: updatedUserId,
						event: {
							eventId,
							eventType,
							properties,
						},
					},
					eventBuffer
				);
			} else {
				eventBuffer.append({
					trackingId,
					sessionId: updatedSessionId,
					userId: updatedUserId,
					event: {
						eventId,
						eventType,
						properties,
					},
					timestamp,
				});
			}

			if (eventBuffer.length >= bufferSize) {
				eventBuffer.flushAll();
			}
		})
		.catch(e => {
			logger.warn('Failed to record event.', e);
		});
};
