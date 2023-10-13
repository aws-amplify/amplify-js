// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InAppMessagingValidationErrorCode,
	assertValidationError,
} from '../errors';

let initialized = false;

/**
 * Sets initialization status to true.
 *
 * @internal
 */
export const initialize = () => {
	initialized = true;
};

/**
 * Returns the initialization status of In-App Messaging.
 *
 * @internal
 */
export const isInitialized = () => initialized;

export function assertIsInitialized() {
	assertValidationError(
		isInitialized(),
		InAppMessagingValidationErrorCode.NotInitialized
	);
}
