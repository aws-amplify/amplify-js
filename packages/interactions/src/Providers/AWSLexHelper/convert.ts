import { Readable } from 'stream';
import { AcceptType } from '../../types';
export const convert = (
	stream: Readable | ReadableStream | Blob,
	accept: AcceptType
): Promise<ArrayBuffer | Blob | Uint8Array> => {
	if (stream instanceof Readable) {
		throw new Error('Node.js is not supported currently.');
	} else { // if stream instanceof ReadableStream | Blob
		const response = new Response(stream);
		if (accept === 'ArrayBuffer') {
			return response.arrayBuffer();
		} else if (accept === 'Blob') {
			return response.blob();
		} else {
			return response.arrayBuffer().then(buffer => new Uint8Array(buffer));
		}
	}
};
