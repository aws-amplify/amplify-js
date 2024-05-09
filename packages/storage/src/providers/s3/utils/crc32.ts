import crc32 from "crc-32";

export const calculateContentCRC32 = async (
  content: Blob | string | ArrayBuffer | ArrayBufferView,
): Promise<string> => {
  if (typeof content === 'string') {
    return hexToBase64(padZeros(crc32.str(content).toString(16)));
  } else {
    let buffer: ArrayBuffer;
    if (content instanceof ArrayBuffer) {
      buffer = content;
    } else if (ArrayBuffer.isView(content)) {
      buffer = content.buffer;
    } else {
      buffer = await readFileToArrayBuffer(content);
    }

    return hexToBase64(padZeros((crc32.buf(new Uint8Array(buffer)) >>> 0).toString(16)));
  }
};

const readFileToArrayBuffer = (file: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as ArrayBuffer);
      }
      reader.onabort = () => {
        reject(new Error('Read aborted'));
      };
      reader.onerror = () => {
        reject(reader.error);
      };
    };
    if (file !== undefined) reader.readAsArrayBuffer(file);
  });
};

const padZeros = (input: string) => {
  while (input.length < 8) {
    input = `0${input}`
  }
  return input;
};

const hexToBase64 = (hexstring: string) =>
  btoa(
    hexstring
      .match(/\w{2}/g)!
      .map((a: string) => String.fromCharCode(parseInt(a, 16)))
      .join("")
  );
