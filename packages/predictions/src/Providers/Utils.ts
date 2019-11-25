/**
 * Changes object keys to camel case. If optional parameter `keys` is given, then we extract only the
 * keys specified in `keys`.
 */
export function makeCamelCase(obj: object, keys?: string[]) {
	if (!obj) return undefined;
	const newObj = {};
	const keysToRename = keys ? keys : Object.keys(obj);
	keysToRename.forEach(key => {
		if (obj.hasOwnProperty(key)) {
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
export function makeCamelCaseArray(objArr: object[], keys?: string[]) {
	if (!objArr) return undefined;
	return objArr.map(obj => makeCamelCase(obj, keys));
}

/**
 * Converts blob to array buffer
 */
export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
	return new Promise((res, rej) => {
		const reader = new FileReader();
		reader.onload = _event => {
			res(reader.result as ArrayBuffer);
		};
		reader.onerror = err => {
			rej(err);
		};
		try {
			reader.readAsArrayBuffer(blob);
		} catch (err) {
			rej(err); // in case user gives invalid type
		}
	});
}

/**
 * Converts React Native file to array buffer
 */
export async function fileToRNArrayBuffer(uri) {
	return new Promise((res, reject) => {
		var request = new XMLHttpRequest();
		request.open('GET', uri, true);
		request.responseType = 'arraybuffer';
		request.onload = _event => {
			res(request.response);
		};
		request.onerror = err => {
			reject(err);
		};
		request.send(null);
	});
}
