// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { createMessageEventRecorder } from './createMessageEventRecorder';
export { getAnalyticsEvent } from './getAnalyticsEvent';
export {
	getChannelType,
	getInflightDeviceRegistration,
	rejectInflightDeviceRegistration,
	resolveInflightDeviceRegistration,
} from '../../shared/utils';
export { resolveConfig } from './resolveConfig';
