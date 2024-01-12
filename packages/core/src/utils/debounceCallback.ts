// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Debounces concurrent sync calls
 *
 * @param callback - callback to be debounced.
 * @returns - the return type of the callback
 */
export const debounceCallback = <F extends (...args: any[]) => any>(
	callback: F
) => {
	let counter: number = 0;
	let inflightPromise: Promise<Awaited<ReturnType<F>>>;
	return async (...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> => {
		if (counter === 0) {
			inflightPromise = new Promise(async (resolve, reject) => {
				try {
					const result = await callback(...args);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			});
		}
		counter++;

		try {
			return await inflightPromise;
		} finally {
			counter--;
		}
	};
};
