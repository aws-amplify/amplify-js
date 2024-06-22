import crc32 from 'crc-32';

export interface CRC32Checksum {
	checksumArrayBuffer: ArrayBuffer;
	checksum: string;
	seed: number;
}

export const calculateContentCRC32 = async (
	content: Blob | string | ArrayBuffer | ArrayBufferView,
	seed = 0,
): Promise<CRC32Checksum> => {
	let internalSeed = seed;

	if (typeof content === 'string') {
		internalSeed = crc32.str(content, internalSeed);
	} else if (ArrayBuffer.isView(content)) {
		internalSeed =
			crc32.buf(new Uint8Array(content.buffer), internalSeed) >>> 0;
	} else if (content instanceof ArrayBuffer) {
		internalSeed = crc32.buf(new Uint8Array(content), internalSeed) >>> 0;
	} else {
		await content.stream().pipeTo(
			new WritableStream<Uint8Array>({
				write(chunk) {
					internalSeed = crc32.buf(chunk, internalSeed) >>> 0;
				},
			}),
		);
	}
	const hex = padZeros(internalSeed.toString(16));

	return {
		checksumArrayBuffer: hexToArrayBuffer(hex),
		checksum: hexToBase64(hex),
		seed: internalSeed,
	};
};

const padZeros = (input: string) => {
	let output = input;
	while (output.length < 8) {
		output = `0${output}`;
	}

	return output;
};

const hexToArrayBuffer = (hexString: string) =>
	new Uint8Array((hexString.match(/\w{2}/g)! ?? []).map(h => parseInt(h, 16)))
		.buffer;

const hexToBase64 = (hexString: string) =>
	btoa(
		hexString
			.match(/\w{2}/g)!
			.map((a: string) => String.fromCharCode(parseInt(a, 16)))
			.join(''),
	);
