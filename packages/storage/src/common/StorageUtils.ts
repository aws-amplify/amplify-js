import { Hub } from '@aws-amplify/core';
import {
	AMPLIFY_SYMBOL,
	DEFAULT_PART_SIZE,
	MAX_PARTS_COUNT,
} from './StorageConstants';

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

export const calculatePartSize = (totalSize: number): number => {
	let partSize = DEFAULT_PART_SIZE;
	let partsCount = Math.ceil(totalSize / partSize);
	while (partsCount > MAX_PARTS_COUNT) {
		partSize *= 2;
		partsCount = Math.ceil(totalSize / partSize);
	}
	return partSize;
};
