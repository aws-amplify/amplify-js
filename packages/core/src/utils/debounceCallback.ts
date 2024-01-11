// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type TimeOutOutput = ReturnType<typeof setTimeout>;

/**
 * Debounces concurrent calls of the callback passed in the parameters. The debouncing process will
 * be stopped after there is no more concurrent calls.
 *
 * @param callback - callback to be debounced.
 * @param delay - delay time until the callback will stop from being debounced.
 * @returns - the return type of the callback
 */
export const debounceCallback = <F extends (...args: any[]) => any>(
	callback: F,
	delay: number
) => {
	let timer: TimeOutOutput | undefined;
	let response: ReturnType<F>;
	return (...args: Parameters<F>): ReturnType<F> => {
		if (!timer) {
			response = callback(...args);
		}

		clearTimeout(timer);
		// it will run when there is no concurrent calls and the delay time have passed.
		timer = setTimeout(() => {
			timer = undefined;
		}, delay);

		return response;
	};
};
