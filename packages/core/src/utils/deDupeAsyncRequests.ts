// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// this will make the tsc-complience-test to pass
type Awaited<T> = T extends null | undefined
	? T // special case for `null | undefined` when not in `--strictNullChecks` mode
	: T extends object & { then(onfulfilled: infer F, ...args: infer _): any } // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
	  ? F extends (value: infer V, ...args: infer _) => any // if the argument to `then` is callable, extracts the first argument
			? Awaited<V> // recursively unwrap the value
			: never // the argument to `then` was not callable
	  : T; //
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
