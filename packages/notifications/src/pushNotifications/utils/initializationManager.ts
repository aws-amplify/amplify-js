// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

let initialized = false;

/**
 * Sets initialization status to true.
 *
 * @internal
 */
export const initialize = async () => {
	initialized = true;
};

/**
 * Returns the initialization status of push notifications.
 *
 * @internal
 */
export const isInitialized = () => initialized;
