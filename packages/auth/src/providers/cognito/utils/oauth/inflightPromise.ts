// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const inflightPromises: ((value: void | PromiseLike<void>) => void)[] = [];

// Module-level singleton backstop timer for the inflight OAuth blocking
// deadline. A single timer (not one per waiter) is sufficient because all
// parked waiters share one release (`resolveAndClearInflightPromises` drains
// them all), and every park re-arms it with the current deadline.
let deadlineTimer: ReturnType<typeof setTimeout> | undefined;

export const addInflightPromise = (resolver: () => void) => {
	inflightPromises.push(resolver);
};

/**
 * Arms (or re-arms) the backstop timer that releases parked token consumers
 * once the inflight OAuth blocking deadline passes.
 *
 * On fire it re-reads the deadline instead of trusting the armed one: a fresh
 * `signInWithRedirect` may have renewed it (re-arm for the new deadline), or
 * the flow may have been released through another path already (the re-check
 * returns `undefined` and draining is a no-op). The release is purely local —
 * it never mutates shared OAuth state, so another tab's still-running flow is
 * left intact.
 *
 * Note: browsers throttle timers in background tabs, which may delay (never
 * prevent) this release; the cross-tab storage listener remains the fast path.
 */
export const armInflightDeadline = (
	deadline: number,
	recheckDeadline: () => Promise<number | undefined>,
) => {
	if (deadlineTimer !== undefined) {
		clearTimeout(deadlineTimer);
	}
	deadlineTimer = setTimeout(
		() => {
			deadlineTimer = undefined;
			recheckDeadline()
				.then(renewedDeadline => {
					if (renewedDeadline !== undefined) {
						armInflightDeadline(renewedDeadline, recheckDeadline);

						return;
					}
					resolveAndClearInflightPromises();
				})
				// Fail open: an error while re-checking (e.g. auth config torn down)
				// must release the waiters rather than leave them parked forever.
				.catch(() => {
					resolveAndClearInflightPromises();
				});
		},
		Math.max(0, deadline - Date.now()),
	);
};

export const resolveAndClearInflightPromises = () => {
	// The waiters this timer guarded are being released through this very call
	// (whatever triggered it) — clear it so no stale timer outlives its waiters.
	if (deadlineTimer !== undefined) {
		clearTimeout(deadlineTimer);
		deadlineTimer = undefined;
	}
	while (inflightPromises.length) {
		inflightPromises.pop()?.();
	}
};
