// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { resolveCredentials } from './resolveCredentials';
export { groupBy } from './groupBy';
export {
	EventBuffer,
	IAnalyticsClient,
	EventBufferConfig,
} from './eventBuffer';
export {
	enableAnalytics,
	disableAnalytics,
	isAnalyticsEnabled,
} from './statusHelpers';
export {
	getAnalyticsUserAgent,
	getAnalyticsUserAgentString,
} from './userAgent';
export { updateProviderTrackers } from './trackerHelpers';
export { validateTrackerConfiguration } from './trackerConfigHelpers';
