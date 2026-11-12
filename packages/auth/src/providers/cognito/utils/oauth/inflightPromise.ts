// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const inflightPromises = new Set<() => void>();

/**
 * Blocks a token consumer while an OAuth flow is in flight, until the flow
 * settles (`resolveAndClearInflightPromises`) or its blocking deadline passes.
 *
 * The waiter registers before it reads the deadline, so a release that happens
 * while that read is pending still settles it. Each waiter owns its backstop
 * timer: on fire it re-reads the deadline instead of trusting the armed one, as
 * a fresh `signInWithRedirect` may have renewed it. Its re-check only ever
 * settles this waiter, never one parked for a newer flow. The backstop also
 * covers environments without storage events (Safari private mode) and flows
 * that are never completed anywhere. The release is purely
 * local: it never mutates shared OAuth state, so another tab's still-running
 * flow is left intact.
 *
 * Note: browsers throttle timers in background tabs, which may delay (never
 * prevent) the backstop release; the cross-tab storage listener remains the
 * fast path.
 */
export const waitForInflightOAuth = (
	readDeadline: () => Promise<number | undefined>,
): Promise<void> =>
	new Promise<void>((resolve, reject) => {
		let deadlineTimer: ReturnType<typeof setTimeout> | undefined;

		const release = () => {
			if (!inflightPromises.delete(release)) {
				return;
			}
			clearTimeout(deadlineTimer);
			resolve();
		};

		const checkDeadline = (deadline: number | undefined) => {
			if (!inflightPromises.has(release)) {
				return;
			}
			if (deadline === undefined) {
				release();

				return;
			}
			deadlineTimer = setTimeout(
				() => {
					readDeadline()
						.then(checkDeadline)
						// Fail open: an error while re-checking (e.g. auth config torn
						// down) must release the waiter rather than leave it parked.
						.catch(release);
				},
				Math.max(0, deadline - Date.now()),
			);
		};

		inflightPromises.add(release);
		readDeadline().then(checkDeadline, error => {
			if (inflightPromises.delete(release)) {
				reject(error);
			}
		});
	});

export const resolveAndClearInflightPromises = (): void => {
	inflightPromises.forEach(release => {
		release();
	});
};
