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

import { Readable } from 'stream';
import { gunzip, strFromU8 } from 'fflate';

export const convert = (
	stream: Blob | Readable | ReadableStream
): Promise<Uint8Array> => {
	if (stream instanceof Blob || stream instanceof ReadableStream) {
		return new Response(stream)
			.arrayBuffer()
			.then(buffer => new Uint8Array(buffer));
	} else {
		throw new Error('Readable is not supported.');
	}
};

export const base64ToArrayBuffer = (base64: string): Uint8Array => {
	return Uint8Array.from(window.atob(base64), c => c.charCodeAt(0));
};

export const unGzipBase64AsJson = async (gzipBase64: string | undefined) => {
	if (typeof gzipBase64 === 'undefined') return undefined;

	try {
		// 1. base64 decode
		const decodedArrayBuffer = base64ToArrayBuffer(gzipBase64);

		// 2. gzip decompress
		const decompressedData: Uint8Array = await new Promise(
			(resolve, reject) => {
				gunzip(decodedArrayBuffer, (err, data) => {
					if (err) reject('Unable to decompress ' + err);
					else resolve(data);
				});
			}
		);

		// 3. decompressedData to string
		const objString = strFromU8(decompressedData);

		// 4. string to obj
		return JSON.parse(objString);
	} catch (error) {
		return Promise.reject('unable to decode and decompress ' + error);
	}
};
