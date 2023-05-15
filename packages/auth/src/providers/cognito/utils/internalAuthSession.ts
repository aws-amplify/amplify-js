// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: replace this implementation with state machines
let internalAuthSession: string | undefined = undefined;

/**
 * Sets the current active Session used for Cognito APIs during the sign-in process.
 * @internal
 */
export function setInternalAuthSession(session: string | undefined) {
	internalAuthSession = session;
}

/**
 * Gets the current active Session used for Cognito APIs during the sign-in process.
 * @internal
 */
export function getInternalAuthSession(): string | undefined {
	return internalAuthSession;
}
