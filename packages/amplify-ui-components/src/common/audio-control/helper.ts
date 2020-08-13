const mergeBuffers = (bufferArray: Float32Array[], recLength: number) => {
  const result = new Float32Array(recLength);
  let offset = 0;
  for (let i = 0; i < bufferArray.length; i++) {
    result.set(bufferArray[i], offset);
    offset += bufferArray[i].length;
  }
  return result;
};

const downsampleBuffer = (buffer: Float32Array, recordSampleRate: number, exportSampleRate: number) => {
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

const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
  let byteOffset = offset;
  for (let i = 0; i < input.length; i++, byteOffset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(byteOffset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const encodeWAV = (samples: Float32Array, exportSampleRate: number) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 32 + samples.length * 2, true); // chunk size
  writeString(view, 8, 'WAVE');

  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // subchunk size
  view.setUint16(20, 1, true); // audio format, pcm = 1
  view.setUint16(22, 1, true); // number of channels
  view.setUint32(24, exportSampleRate, true); // sample rate
  view.setUint32(28, exportSampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align, # of bytes per sample
  view.setUint16(34, 16, true); // bits per sample

  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true); // subchunk size
  floatTo16BitPCM(view, 44, samples); // pcm values here
  return view;
};

export const exportBuffer = (
  recBuffer: Float32Array[],
  recLength: number,
  recordSampleRate: number,
  exportSampleRate: number,
) => {
  const mergedBuffers = mergeBuffers(recBuffer, recLength);
  const downsampledBuffer = downsampleBuffer(mergedBuffers, recordSampleRate, exportSampleRate);
  const encodedWav = encodeWAV(downsampledBuffer, exportSampleRate);
  const audioBlob = new Blob([encodedWav], {
    type: 'application/octet-stream',
  });
  return audioBlob;
};
