// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { gunzip, strFromU8 } from 'fflate';

export const convert = async (stream: object): Promise<Uint8Array> => {
	if (stream instanceof Blob || stream instanceof ReadableStream) {
		return new Response(stream)
			.arrayBuffer()
			.then(buffer => new Uint8Array(buffer));
	} else {
		return Promise.reject('Invalid content type');
	}
};

export const base64ToArrayBuffer = (base64: string): Uint8Array => {
	return Uint8Array.from(window.atob(base64), c => c.charCodeAt(0));
};

export const gzipDecompressToString = async (
	data: Uint8Array
): Promise<string> => {
	return await new Promise((resolve, reject) => {
		gunzip(data, (err, resp) => {
			if (err) reject(err);
			else resolve(strFromU8(resp));
		});
	});
};
