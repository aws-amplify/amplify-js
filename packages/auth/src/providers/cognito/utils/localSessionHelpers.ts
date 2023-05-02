// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

let activeLocalAuthSession: string | undefined = undefined;

/**
 * Sets the current active Session used for Cognito APIs during the sign-in process.
 * @internal
 */
export function setActiveLocalSession(session: string | undefined) {
	activeLocalAuthSession = session;
}

/**
 * Gets the current active Session used for Cognito APIs during the sign-in process.
 * @internal
 */
export function getActiveLocalSession(): string | undefined {
	return activeLocalAuthSession;
}
