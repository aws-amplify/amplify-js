// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decode } from 'base-64';
import { ungzip } from 'pako';

export const convert = async (stream: object): Promise<Uint8Array> => {
	if (!(stream instanceof Blob)) {
		return Promise.reject('Invalid content type');
	}

	return new Promise(async (resolve, reject) => {
		try {
			const fileReaderInstance = new FileReader();
			fileReaderInstance.readAsDataURL(stream);
			fileReaderInstance.onload = async () => {
				const blobURL = fileReaderInstance.result as string;

				const base64Blob = blobURL.split(/,(.*)/s)[1];

				const decodedArrayBuffer = base64ToArrayBuffer(base64Blob);
				resolve(decodedArrayBuffer);
			};
		} catch (error) {
			reject('unable to convert blob to arrayBuffer: ' + error);
		}
	});
};

export const base64ToArrayBuffer = (base64: string): Uint8Array => {
	const binaryString: string = decode(base64);
	return Uint8Array.from(binaryString, c => c.charCodeAt(0));
};

export const gzipDecompressToString = async (
	data: Uint8Array
): Promise<string> => {
	return new Promise((resolve, reject) => {
		try {
			const result: string = ungzip(data, { to: 'string' });
			resolve(result);
		} catch (error) {
			reject('unable to decompress' + error);
		}
	});
};
