/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

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
