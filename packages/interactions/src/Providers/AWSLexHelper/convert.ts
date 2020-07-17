import { Readable } from 'stream';
import { AcceptType } from '../../types';
export const convert = async (
	stream: Readable | ReadableStream | Blob
): Promise<Uint8Array> => {
	let audio = stream instanceof Readable ? await readReadable(stream) : stream;
	return new Response(audio)
		.arrayBuffer()
		.then(buffer => new Uint8Array(buffer));
};

const readReadable = (stream: Readable): Promise<Blob> => {
	if (!stream.isPaused()) stream.pause();
	let chunks: Array<string | Buffer> = [];
	return new Promise((res, rej) => {
		stream.on('data', chunk => {
			chunks.push(chunk);
		});
		stream.on('end', () => {
			return res(new Blob(chunks));
		});
		stream.on('error', rej);
	});
};
