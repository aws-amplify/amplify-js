// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AnalyticsAction,
	ConsoleLogger as Logger,
} from '@aws-amplify/core/internals/utils';
import { record as recordCore } from '@aws-amplify/core/internals/providers/pinpoint';
import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';
import { getAnalyticsUserAgentString } from '../../../utils/userAgent';
import { RecordInput } from '../types';
import { resolveConfig, resolveCredentials } from '../utils';

const logger = new Logger('Analytics');

/**
 * Records an Analytic event to Pinpoint. Events will be buffered and periodically sent to Pinpoint.
 *
 * @param {RecordInput} params The input object used to construct the request.
 *
 * @throws validation: {@link AnalyticsValidationErrorCode} - Thrown when the provided parameters or library
 *  configuration is incorrect.
 *
 * @example
 * ```ts
 * // Send an event to Pinpoint
 * record({
 *     event: {
 * 	       name: eventName,
 *     }
 * })
 * ```
 *
 * @example
 * ```ts
 * // Send an event to Pinpoint with metrics & custom attributes
 * record({
 *     event: {
 *         name: eventName,
 *         attributes: {
 *             'my-attribute': attributeValue
 *         },
 *         metrics: {
 *             'my-metric': metricValue
 *         }
 *     }
 * })
 * ```
 */
export const record = ({ event }: RecordInput): void => {
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
