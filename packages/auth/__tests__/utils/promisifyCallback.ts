// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Utility function that uses promises/resolve pattern to test asynchronous code in the Jest library
 * @param {object} obj - pass the entire object/file being test to resolve dependencies utilized within fn
 * @param {function} fn - name of the function that will be called.
 * @param {[args]} ...args - an array of arguments that varies with every function
 *
 * More information here:  https://jestjs.io/docs/asynchronous#callbacks
 **/
export async function promisifyCallback(obj: object, fn: string, ...args: any) {
	return new Promise((resolve, reject) => {
		const callback = (err, data) => {
			err ? reject(err) : resolve(data);
		};
		try {
			// in case .apply() fails
			obj[fn].apply(obj, [...args, callback]);
		} catch (error) {
			reject(error);
		}
	});
}
