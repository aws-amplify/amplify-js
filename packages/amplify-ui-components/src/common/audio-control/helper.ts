import { RECORDER_EXPORT_MIME_TYPE } from './settings';

/**
 * Merges multiple buffers into one.
 */
const mergeBuffers = (bufferArray: Float32Array[], recLength: number) => {
	const result = new Float32Array(recLength);
	let offset = 0;
	for (let i = 0; i < bufferArray.length; i++) {
		result.set(bufferArray[i], offset);
		offset += bufferArray[i].length;
	}
	return result;
};

/**
 * Downsamples audio to desired export sample rate.
 */
const downsampleBuffer = (
	buffer: Float32Array,
	recordSampleRate: number,
	exportSampleRate: number
) => {
	if (exportSampleRate === recordSampleRate) {
		return buffer;
	}
	const sampleRateRatio = recordSampleRate / exportSampleRate;
	const newLength = Math.round(buffer.length / sampleRateRatio);
	const result = new Float32Array(newLength);
	let offsetResult = 0;
	let offsetBuffer = 0;
	while (offsetResult < result.length) {
		const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
		let accum = 0,
			count = 0;
		for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
			accum += buffer[i];
			count++;
		}
		result[offsetResult] = accum / count;
		offsetResult++;
		offsetBuffer = nextOffsetBuffer;
	}
	return result;
};

/**
 * converts raw audio values to 16 bit pcm.
 */
const floatTo16BitPCM = (
	output: DataView,
	offset: number,
	input: Float32Array
) => {
	let byteOffset = offset;
	for (let i = 0; i < input.length; i++, byteOffset += 2) {
		const s = Math.max(-1, Math.min(1, input[i]));
		output.setInt16(byteOffset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}
};

/**
 * Write given strings in big-endian order.
 */
const writeString = (view: DataView, offset: number, string: string) => {
	for (let i = 0; i < string.length; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
};

/**
 * Encodes raw pcm audio into a wav file.
 */
const encodeWAV = (samples: Float32Array, exportSampleRate?: number) => {
	/**
	 * WAV file consists of three parts: RIFF header, WAVE subchunk, and data subchunk. We precompute the size of them.
	 */

	const audioSize = samples.length * 2; // We use 16-bit samples, so we have (2 * sampleLength) bytes.
	const fmtSize = 24; // Byte size of the fmt subchunk: 24 bytes that the audio information that we'll set below.
	const dataSize = 8 + audioSize; // Byte size of the data subchunk: raw sound data plus 8 bytes for the subchunk descriptions.

	const totalByteSize = 12 + fmtSize + dataSize; // Byte size of the whole file, including the chunk header / descriptor.

	// create DataView object to write byte values into
	const buffer = new ArrayBuffer(totalByteSize); // buffer to write the chunk values in.
	const view = new DataView(buffer);

	/**
	 * Start writing the .wav file. We write top to bottom, so byte offset (first numeric argument) increases strictly.
	 */
	// RIFF header
	writeString(view, 0, 'RIFF'); // At offset 0, write the letters "RIFF"
	view.setUint32(4, fmtSize + dataSize, true); // At offset 4, write the size of fmt and data chunk size combined.
	writeString(view, 8, 'WAVE'); // At offset 8, write the format type "WAVE"

	// fmt subchunk
	writeString(view, 12, 'fmt '); //chunkdId 'fmt '
	view.setUint32(16, fmtSize - 8, true); // fmt subchunk size below this value. We set 8 bytes already, so subtract 8 bytes from fmtSize.
	view.setUint16(20, 1, true); // Audio format code, which is 1 for PCM.
	view.setUint16(22, 1, true); // Number of audio channels. We use mono, ie 1.
	view.setUint32(24, exportSampleRate, true); // Sample rate of the audio file.
	view.setUint32(28, exportSampleRate * 2, true); // Data rate, or # of data bytes per second. Since each sample is 2 bytes, this is 2 * sampleRate.
	view.setUint16(32, 2, true); // block align, # of bytes per sample including all channels, ie. 2 bytes.
	view.setUint16(34, 16, true); // bits per sample, ie. 16 bits

	// data subchunk
	writeString(view, 36, 'data'); // write the chunkId 'data'
	view.setUint32(40, audioSize, true); // Audio byte size
	floatTo16BitPCM(view, 44, samples); // raw pcm values then go here.
	return view;
};

/**
 * Given arrays of raw pcm audio, downsamples the audio to desired sample rate and encodes it to a wav audio file.
 *
 * @param recBuffer {Float32Array[]} - 2d float array containing the recorded raw audio
 * @param recLength {number} - total length of recorded audio
 * @param recordSampleRate {number} - sample rate of the recorded audio
 * @param exportSampleRate {number} - desired sample rate of the exported file
 */
export const exportBuffer = (
	recBuffer: Float32Array[],
	recLength: number,
	recordSampleRate: number,
	exportSampleRate: number
) => {
	const mergedBuffers = mergeBuffers(recBuffer, recLength);
	const downsampledBuffer = downsampleBuffer(
		mergedBuffers,
		recordSampleRate,
		exportSampleRate
	);
	const encodedWav = encodeWAV(downsampledBuffer, exportSampleRate);
	const audioBlob = new Blob([encodedWav], {
		type: RECORDER_EXPORT_MIME_TYPE,
	});
	return audioBlob;
};
