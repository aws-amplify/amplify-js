export const exportBuffer = (
	recBuffer,
	recLength,
	recordSampleRate: number,
	exportSampleRate: number
) => {
	console.log(recBuffer, recLength, recordSampleRate, exportSampleRate);
	var mergedBuffers = mergeBuffers(recBuffer, recLength);
	var downsampledBuffer = downsampleBuffer(
		mergedBuffers,
		recordSampleRate,
		16000
	);
	var encodedWav = encodeWAV(downsampledBuffer, recordSampleRate);
	var audioBlob = new Blob([encodedWav], { type: 'application/octet-stream' });
	return audioBlob;
};

const mergeBuffers = (bufferArray, recLength) => {
	var result = new Float32Array(recLength);
	var offset = 0;
	for (var i = 0; i < bufferArray.length; i++) {
		result.set(bufferArray[i], offset);
		offset += bufferArray[i].length;
	}
	return result;
};

const downsampleBuffer = (buffer, recordSampleRate, exportSampleRate) => {
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

const floatTo16BitPCM = (output, offset, input) => {
	for (var i = 0; i < input.length; i++, offset += 2) {
		var s = Math.max(-1, Math.min(1, input[i]));
		output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}
};

const writeString = (view, offset, string) => {
	for (var i = 0; i < string.length; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
};

function buf2hex(buffer) {
	// buffer is an ArrayBuffer
	return Array.prototype.map
		.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2))
		.join('');
}

const encodeWAV = (samples, recordSampleRate) => {
	var buffer = new ArrayBuffer(44 + samples.length * 2);
	var view = new DataView(buffer);
	console.log(samples);
	writeString(view, 0, 'RIFF');
	view.setUint32(4, 32 + samples.length * 2, true);
	writeString(view, 8, 'WAVE');

	// fmt subchunk
	writeString(view, 12, 'fmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, 16000, true);
	view.setUint32(28, 16000 * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);

	// data subchunk
	writeString(view, 36, 'data');
	view.setUint32(40, samples.length * 2, true);
	floatTo16BitPCM(view, 44, samples);
	console.log(buf2hex(view.buffer));
	return view;
};
