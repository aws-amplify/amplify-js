// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	getConflictHandler,
	setConflictHandler,
} from './conflictHandlerManager';
export { resolveConfig } from './resolveConfig';
export { resolveCredentials } from './resolveCredentials';
export { getInAppMessagingUserAgentString } from './userAgent';
export {
	PINPOINT_KEY_PREFIX,
	CATEGORY,
	CHANNEL_TYPE,
	STORAGE_KEY_SUFFIX,
} from './constants';

export {
	processInAppMessages,
	sessionStateChangeHandler,
	incrementMessageCounts,
} from './messageProcessingHelpers';
