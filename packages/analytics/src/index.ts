// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// This entry point intentionally re-exports the deprecated Pinpoint provider
// APIs as the default Analytics surface. Removing them would be a breaking
// change; instead each is wrapped to emit a one-time runtime deprecation
// warning. The deprecated imports below are therefore expected.
/* eslint-disable import/no-deprecated */
import {
	configureAutoTrack as configureAutoTrackPinpoint,
	flushEvents as flushEventsPinpoint,
	identifyUser as identifyUserPinpoint,
	record as recordPinpoint,
} from './providers/pinpoint';
import { deprecatePinpoint } from './utils';

/**
 * @deprecated The default (Amazon Pinpoint) Analytics APIs are deprecated. AWS will end support for
 * Amazon Pinpoint on October 30, 2026. Migrate to a supported provider by importing from its sub-path
 * export instead — for example `aws-amplify/analytics/kinesis`, `aws-amplify/analytics/kinesis-firehose`,
 * or `aws-amplify/analytics/personalize`.
 */
export const record = deprecatePinpoint(recordPinpoint);

/**
 * @deprecated The default (Amazon Pinpoint) Analytics APIs are deprecated. AWS will end support for
 * Amazon Pinpoint on October 30, 2026. Migrate to a supported provider by importing from its sub-path
 * export instead — for example `aws-amplify/analytics/kinesis`, `aws-amplify/analytics/kinesis-firehose`,
 * or `aws-amplify/analytics/personalize`.
 */
export const identifyUser = deprecatePinpoint(identifyUserPinpoint);

/**
 * @deprecated The default (Amazon Pinpoint) Analytics APIs are deprecated. AWS will end support for
 * Amazon Pinpoint on October 30, 2026. Migrate to a supported provider by importing from its sub-path
 * export instead — for example `aws-amplify/analytics/kinesis`, `aws-amplify/analytics/kinesis-firehose`,
 * or `aws-amplify/analytics/personalize`.
 */
export const configureAutoTrack = deprecatePinpoint(configureAutoTrackPinpoint);

/**
 * @deprecated The default (Amazon Pinpoint) Analytics APIs are deprecated. AWS will end support for
 * Amazon Pinpoint on October 30, 2026. Migrate to a supported provider by importing from its sub-path
 * export instead — for example `aws-amplify/analytics/kinesis`, `aws-amplify/analytics/kinesis-firehose`,
 * or `aws-amplify/analytics/personalize`.
 */
export const flushEvents = deprecatePinpoint(flushEventsPinpoint);

export {
	RecordInput,
	IdentifyUserInput,
	ConfigureAutoTrackInput,
} from './providers/pinpoint';
export { enable, disable } from './apis';
export { AnalyticsError } from './errors';
