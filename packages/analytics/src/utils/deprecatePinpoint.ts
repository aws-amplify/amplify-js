// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';

const logger = new ConsoleLogger('Analytics');

const DEPRECATION_MESSAGE =
	'The default (Amazon Pinpoint) export of `aws-amplify/analytics` is deprecated. ' +
	'AWS will end support for Amazon Pinpoint on October 30, 2026. ' +
	'Migrate to a supported provider by importing from its sub-path export instead: ' +
	'Kinesis (`aws-amplify/analytics/kinesis`), ' +
	'Kinesis Data Firehose (`aws-amplify/analytics/kinesis-firehose`), or ' +
	'Personalize Event (`aws-amplify/analytics/personalize`).';

/**
 * Wraps a Pinpoint (default-export) Analytics API so that invoking it emits a
 * one-time runtime deprecation warning before delegating to the underlying
 * implementation. The returned function is a transparent proxy — it preserves
 * the exact parameters, return value, and `this` binding of the wrapped API.
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
