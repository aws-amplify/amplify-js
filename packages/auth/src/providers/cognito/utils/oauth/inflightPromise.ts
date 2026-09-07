// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const inflightPromises: ((value: void | PromiseLike<void>) => void)[] = [];

/**
 * Registers a resolver to be invoked when the inflight OAuth flow completes.
 *
 * Returns an `unregister` handle that removes the resolver from the internal
 * list. Callers that resolve their wait through another path (e.g. a bounded
 * timeout or a cross-tab `storage` event) MUST call it to avoid leaving a dead
 * resolver in the list.
 */
export const addInflightPromise = (resolver: () => void): (() => void) => {
	inflightPromises.push(resolver);

	return () => {
		const index = inflightPromises.indexOf(resolver);
		if (index > -1) {
			inflightPromises.splice(index, 1);
		}
	};
};

export const resolveAndClearInflightPromises = () => {
	while (inflightPromises.length) {
		inflightPromises.pop()?.();
	}
};

// Tracks whether *this* tab is actively processing an OAuth redirect response
// (i.e. running `attemptCompleteOAuthFlow` -> `completeOAuthFlow`). It is an
// in-memory, per-tab signal used to distinguish a tab that legitimately owns
// the inflight OAuth flow — and should keep waiting for it to complete — from a
// bystander tab that merely observes the shared `inflightOAuth` flag another
// tab set (or a flag left behind by an abandoned flow).
let oauthInProgress = false;

export const setOAuthInProgress = (inProgress: boolean) => {
	oauthInProgress = inProgress;
};

export const isOAuthInProgress = (): boolean => oauthInProgress;
