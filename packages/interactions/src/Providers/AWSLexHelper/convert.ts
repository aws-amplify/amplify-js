import { Readable } from 'stream';
export const convert = async (
	stream: Readable | ReadableStream | Blob
): Promise<Uint8Array> => {
	const audio = stream instanceof Readable ? await readReadable(stream) : stream;
	return new Response(audio)
		.arrayBuffer()
		.then(buffer => new Uint8Array(buffer));
};

const readReadable = (stream: Readable): Promise<Blob> => {
	if (!stream.isPaused()) stream.pause();
	const chunks: Array<string | Buffer> = [];
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
