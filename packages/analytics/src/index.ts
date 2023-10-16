// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	record,
	identifyUser,
	RecordInput,
	IdentifyUserInput,
	flushEvents,
} from './providers/pinpoint';
export { enable, disable } from './apis';
export { AnalyticsError } from './errors';
