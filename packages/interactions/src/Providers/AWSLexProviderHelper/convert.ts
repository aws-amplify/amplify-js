import { gunzipSync, strFromU8 } from 'fflate';
import { Readable } from 'stream';

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
	const binary_string = window.atob(base64);
	const len = binary_string.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes;
};

export const unGzipBase64AsJson = <T>(gzipBase64: string): T => {
	// base64 decode
	// gzip decompress and convert to string
	// string to obj
	return JSON.parse(
		strFromU8(gunzipSync(base64ToArrayBuffer(gzipBase64)))
	) as T;
};
