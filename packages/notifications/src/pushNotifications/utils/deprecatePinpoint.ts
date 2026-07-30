// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';

const logger = new ConsoleLogger('PushNotification');

const DEPRECATION_MESSAGE =
	'The default `aws-amplify/push-notifications` entry point is deprecated because it is ' +
	'backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. ' +
	'Import from a supported provider sub-path export instead: ' +
	'Amazon Connect Customer Profiles (`aws-amplify/push-notifications/customer-profiles`).';

/**
 * Wraps a Push Notifications API exported from the deprecated default (Amazon
 * Pinpoint backed) entry point so that invoking it emits a one-time runtime
 * deprecation warning before delegating to the underlying implementation. The
 * returned function is a transparent proxy — it preserves the exact parameters
 * and return value of the wrapped API, including synchronous throws and
 * rejected promises.
 *
 * The warning names the deprecated entry point rather than the individual API,
 * because most of these APIs are transport-agnostic and are re-exported
 * unchanged by every provider — it is the default entry point, not the
 * behaviour of the call, that customers need to migrate away from.
 *
 * The warning is emitted at most once per wrapped API for the lifetime of the
 * module, so repeated calls do not spam the console.
 *
 * @internal
 */
export const deprecatePinpoint = <TArgs extends any[], TReturn>(
	fn: (...args: TArgs) => TReturn,
): ((...args: TArgs) => TReturn) => {
	let warned = false;

	return (...args: TArgs): TReturn => {
		if (!warned) {
			warned = true;
			logger.warn(DEPRECATION_MESSAGE);
		}

		return fn(...args);
	};
};
