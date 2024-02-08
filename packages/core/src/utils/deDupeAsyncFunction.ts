// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * returns in-flight promise if there is one
 *
 * @param asyncFunction - asyncFunction to be deduped.
 * @returns - the return type of the callback
 */
export const deDupeAsyncFunction = <A extends any[], R>(
	asyncFunction: (...args: A) => Promise<R>,
) => {
	let inflightPromise: Promise<R> | undefined;

	return async (...args: A): Promise<R> => {
		if (inflightPromise) return inflightPromise;

		inflightPromise = new Promise<R>((resolve, reject) => {
			asyncFunction(...args)
				.then(result => {
					resolve(result);
				})
				.catch(error => {
					reject(error);
				})
				.finally(() => {
					inflightPromise = undefined;
				});
		});

		return inflightPromise;
	};
};
