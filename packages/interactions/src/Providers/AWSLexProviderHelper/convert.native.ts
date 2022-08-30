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
import { gunzipSync } from 'fflate';

export const convert = async (stream: Blob): Promise<Uint8Array> => {
	return new Promise(async (resolve, reject) => {
		try {
			console.log('stream', stream);

			// 1. use 'FileReader' to create blobUrl
			const fileReaderInstance = new FileReader();
			console.log('after 1');
			fileReaderInstance.readAsDataURL(stream);
			console.log('after 2');
			fileReaderInstance.onload = async () => {
				console.log('getting output');
				const blobURL = fileReaderInstance.result as string;

				// 2. slice base64 encoded string from blobUrl
				const base64Blob = blobURL.split(/,(.*)/s)[1];

				// 3. base64 to arrayBuffer
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

export const gzipDecompress = async (data: Uint8Array): Promise<Uint8Array> => {
	// gunzip uses web-workers which RN doesn't support
	// alternative; wrap gunzipSync in promise
	return new Promise(resolve => resolve(gunzipSync(data)));
};
