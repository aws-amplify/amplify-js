// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	record,
	identifyUser,
	configureAutoTrack,
	flushEvents,
	RecordInput,
	IdentifyUserInput,
	ConfigureAutoTrackInput,
} from './providers/pinpoint';
export { enable, disable } from './apis';
export { AnalyticsError } from './errors';
