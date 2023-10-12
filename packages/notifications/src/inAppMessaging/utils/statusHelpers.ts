// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InAppMessagingValidationErrorCode,
	assertValidationError,
} from '../errors';

let inAppMessagingInitialized = false;

/**
 * Returns the current status of the InAppMessaging category.
 */
export const isInAppMessagingInitialized = () => inAppMessagingInitialized;

/**
 * Initialize the InAppMessaging category.
 */
export const setInAppMessagingInitializedStatus = (status: boolean) =>
	(inAppMessagingInitialized = status);

export function assertInitializationError() {
	assertValidationError(
		isInAppMessagingInitialized(),
		InAppMessagingValidationErrorCode.NotInitialized
	);
}
