import { Readable } from 'stream';
export const convert = async (
	stream: Readable | ReadableStream | Blob
): Promise<Uint8Array> => {
	if (stream instanceof Readable) {
		return readOnNode(stream);
	} else {
		return readOnBrowser(stream);
	}
};

const readOnBrowser = (stream: ReadableStream | Blob) => {
	return new Response(stream)
		.arrayBuffer()
		.then(buffer => new Uint8Array(buffer));
};

// Node.js support
const readOnNode = (stream: Readable): Promise<Uint8Array> => {
	if (!stream.isPaused()) stream.pause();
	const chunks: Array<string | Buffer> = [];
	return new Promise((res, rej) => {
		stream.on('readable', () => {
			while (true) {
				const chunk = stream.read();
				if (!chunk) break;
				chunks.push(chunk);
			}
		});
		stream.on('end', () => {
			const blob = new Blob(chunks);
			const fileReader = new FileReader();
			fileReader.onload = event => {
				const buffer = event.target.result as ArrayBuffer;
				return res(new Uint8Array(buffer));
			};
			fileReader.onerror = rej;
			fileReader.readAsArrayBuffer(blob);
		});
		stream.on('error', rej);
	});
};
