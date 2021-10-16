import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Hub } from '@aws-amplify/core';

export const listSingleFile = async ({
	s3Client,
	key,
	bucket,
}: {
	s3Client: S3Client;
	key: string;
	bucket: string;
}) => {
	const listObjectRes = await s3Client.send(
		new ListObjectsV2Command({
			Bucket: bucket,
			Prefix: key,
		})
	);
	const { Contents = [] } = listObjectRes;
	const obj = Contents.find(o => o.Key === key);
	return obj;
};

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

const AMPLIFY_SYMBOL = (typeof Symbol !== 'undefined' &&
typeof Symbol.for === 'function'
	? Symbol.for('amplify_default')
	: '@@amplify_default') as Symbol;

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
