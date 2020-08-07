export const exportBuffer = (
	recBuffer: Array<Float32Array>,
	recLength: number,
	recordSampleRate: number,
	exportSampleRate: number
): Blob => {
	const mergedBuffers = mergeBuffers(recBuffer, recLength);
	const downsampledBuffer = downsampleBuffer(
		mergedBuffers,
		recordSampleRate,
		exportSampleRate
	);
	const encodedWav = encodeWAV(downsampledBuffer, recordSampleRate);
	const audioBlob = new Blob([encodedWav], {
		type: 'application/octet-stream',
	});
	return audioBlob;
};

const mergeBuffers = (
	bufferArray: Array<Float32Array>,
	recLength: number
): Float32Array => {
	var result = new Float32Array(recLength);
	var offset = 0;
	for (var i = 0; i < bufferArray.length; i++) {
		result.set(bufferArray[i], offset);
		offset += bufferArray[i].length;
	}
	return result;
};

const downsampleBuffer = (
	buffer: Float32Array,
	recordSampleRate: number,
	exportSampleRate: number
): Float32Array => {
	if (exportSampleRate === recordSampleRate) {
		return buffer;
	}
	var sampleRateRatio = recordSampleRate / exportSampleRate;
	var newLength = Math.round(buffer.length / sampleRateRatio);
	var result = new Float32Array(newLength);
	var offsetResult = 0;
	var offsetBuffer = 0;
	while (offsetResult < result.length) {
		var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
		var accum = 0,
			count = 0;
		for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
			accum += buffer[i];
			count++;
		}
		result[offsetResult] = accum / count;
		offsetResult++;
		offsetBuffer = nextOffsetBuffer;
	}
	return result;
};

const encodeWAV = (samples: Float32Array, recordSampleRate: number) => {
	var buffer = new ArrayBuffer(44 + samples.length * 2);
	var view = new DataView(buffer);

	writeString(view, 0, 'RIFF');
	view.setUint32(4, 32 + samples.length * 2, true);
	writeString(view, 8, 'WAVE');
	writeString(view, 12, 'fmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, recordSampleRate, true);
	view.setUint32(28, recordSampleRate * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	writeString(view, 36, 'data');
	view.setUint32(40, samples.length * 2, true);
	floatTo16BitPCM(view, 44, samples);

	return view;
};

const writeString = (view: DataView, offset: number, string: string): void => {
	for (var i = 0; i < string.length; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
};

const floatTo16BitPCM = (
	output: DataView,
	offset: number,
	input: Float32Array
): void => {
	for (var i = 0; i < input.length; i++, offset += 2) {
		var s = Math.max(-1, Math.min(1, input[i]));
		output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}
};
