// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * returns inflight promise if there hasn't been resolved yet
 *
 * @param callback - callback to be deDup.
 * @returns - the return type of the callback
 */
export const deDupeAsyncRequests = <A extends any[], R>(
	callback: (...args: A) => Promise<R>
) => {
	let inflightPromise: Promise<Awaited<R>> | undefined;
	return async (...args: A): Promise<Awaited<R>> => {
		if (inflightPromise) return inflightPromise;

		if (!inflightPromise) {
			inflightPromise = new Promise(async (resolve, reject) => {
				try {
					const result = await callback(...args);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			});
		}

		try {
			return await inflightPromise;
		} finally {
			inflightPromise = undefined;
		}
	};
};
