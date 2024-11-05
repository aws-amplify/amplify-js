// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Changes object keys to camel case. If optional parameter `keys` is given, then we extract only the
 * keys specified in `keys`.
 */
export function makeCamelCase(obj?: any, keys?: string[]) {
	if (!obj) return undefined;
	const newObj = {};
	const keysToRename = keys || Object.keys(obj);
	keysToRename.forEach(key => {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			// change the key to camelcase.
			const camelCaseKey = key.charAt(0).toLowerCase() + key.substr(1);
			Object.assign(newObj, { [camelCaseKey]: obj[key] });
		}
	});

	return newObj;
}

/**
 * Given an array of object, call makeCamelCase(...) on each option.
 */
export function makeCamelCaseArray(objArr?: object[], keys?: string[]) {
	if (!objArr) return undefined;

	return objArr.map(obj => makeCamelCase(obj, keys));
}

/**
 * Converts blob to array buffer
 */
export function blobToArrayBuffer(blob: Blob): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = _event => {
			resolve(reader.result as Uint8Array);
		};
		reader.onerror = err => {
			reject(err);
		};
		try {
			reader.readAsArrayBuffer(blob);
		} catch (err) {
			reject(err); // in case user gives invalid type
		}
	});
}
