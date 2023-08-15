import base64Decode from 'fast-base64-decode';
import getRandomBase64 from './getRandomBase64';
import { AmplifyError } from '@aws-amplify/core';

/**
 * @param {Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array|Uint8ClampedArray} array
 */
export default function getRandomValues(
	array:
		| Int8Array
		| Uint8Array
		| Int16Array
		| Uint16Array
		| Int32Array
		| Uint32Array
		| Uint8ClampedArray
) {
	if (array.byteLength > 65536) {
		throw new AmplifyError({
			message: 'Can only request a maximum of 65536 bytes',
			name: 'RandomValuesMaxBytesError',
			recoverySuggestion: 'Use less than 65536 bytes',
		});
	}

	base64Decode(
		getRandomBase64(array.byteLength),
		new Uint8Array(array.buffer, array.byteOffset, array.byteLength)
	);

	return array;
}
