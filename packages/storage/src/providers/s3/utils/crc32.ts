import crc32 from "crc-32";

export interface CRC32Checksum {
  checksum: string;
  seed: number;
}

export const calculateContentCRC32 = async (
  content: Blob | string | ArrayBuffer | ArrayBufferView,
  seed = 0
): Promise<CRC32Checksum> => {
  let internalSeed = seed;
  if (typeof content === 'string') {
    internalSeed = crc32.str(content, internalSeed);
  }
  else if (ArrayBuffer.isView(content)) {
    internalSeed = crc32.buf(new Uint8Array(content.buffer), internalSeed) >>> 0;
  } else if (content instanceof ArrayBuffer) {
    internalSeed = crc32.buf(new Uint8Array(content), internalSeed) >>> 0;
  } else {
    await content.stream().pipeTo(new WritableStream<Uint8Array>({
      write(chunk) {
        internalSeed = crc32.buf(chunk, internalSeed) >>> 0;
      },
    }));
  }

  return {
    checksum: hexToBase64(padZeros(internalSeed.toString(16))),
    seed: internalSeed,
  };
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
