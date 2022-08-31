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

import { gunzip } from 'fflate';

export const convert = async (stream: object): Promise<Uint8Array> => {
	if (!(stream instanceof Blob) && !(stream instanceof ReadableStream)) {
		return Promise.reject('Invalid content type');
	}

	return new Response(stream)
		.arrayBuffer()
		.then(buffer => new Uint8Array(buffer));
};

export const base64ToArrayBuffer = (base64: string): Uint8Array => {
	return Uint8Array.from(window.atob(base64), c => c.charCodeAt(0));
};

export const gzipDecompress = async (data: Uint8Array): Promise<Uint8Array> => {
	return await new Promise((resolve, reject) => {
		gunzip(data, (err, resp) => {
			if (err) reject(err);
			else resolve(resp);
		});
	});
};
