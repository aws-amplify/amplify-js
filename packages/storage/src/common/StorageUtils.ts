import { Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from './StorageConstants';

export const byteLength = (x: unknown) => {
	if (typeof x === 'string') {
		return x.length;
	} else if (isArrayBuffer(x)) {
		return x.byteLength;
	} else if (isBlob(x)) {
		return x.size;
	} else {
		throw new Error('Cannot determine byte length of ' + x);
	}
};

export const dispatchStorageEvent = (
	track: boolean,
	event: string,
	attrs: any,
	metrics: any,
	message: string
): void => {
	if (track) {
		const data = { attrs };
		if (metrics) {
			data['metrics'] = metrics;
		}
		Hub.dispatch(
			'storage',
			{
				event,
				data,
				message,
			},
			'Storage',
			AMPLIFY_SYMBOL
		);
	}
};

export const isFile = (x: unknown): x is File => {
	return typeof x !== 'undefined' && x instanceof File;
};

export const isBlob = (x: unknown): x is Blob => {
	return typeof x !== 'undefined' && x instanceof Blob;
};

const isArrayBuffer = (x: unknown): x is ArrayBuffer => {
	return typeof x !== 'undefined' && x instanceof ArrayBuffer;
};
