// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// this will make the tsc-compliance-test to pass
type Awaited<T> = T extends null | undefined
	? T // special case for `null | undefined` when not in `--strictNullChecks` mode
	: T extends object & { then(onfulfilled: infer F, ...args: infer _): any } // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
	  ? F extends (value: infer V, ...args: infer _) => any // if the argument to `then` is callable, extracts the first argument
			? Awaited<V> // recursively unwrap the value
			: never // the argument to `then` was not callable
	  : T; //
/**
 * returns in-flight promise if there is one
 *
 * @param asyncFunction - asyncFunction to be deduped.
 * @returns - the return type of the callback
 */
export const deDupeAsyncFunction = <A extends any[], R>(
	asyncFunction: (...args: A) => Promise<R>
) => {
	let inflightPromise: Promise<Awaited<R>> | undefined;
	return async (...args: A): Promise<Awaited<R>> => {
		if (inflightPromise) return inflightPromise;

		inflightPromise = new Promise(async (resolve, reject) => {
			try {
				const result = await asyncFunction(...args);
				resolve(result);
			} catch (error) {
				reject(error);
			} finally {
				inflightPromise = undefined;
			}
		});

		return inflightPromise;
	};
};
