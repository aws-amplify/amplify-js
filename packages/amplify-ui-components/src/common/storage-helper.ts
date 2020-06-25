import { Storage } from '@aws-amplify/storage';
import { NO_STORAGE_MODULE_FOUND } from './constants';
import { Logger } from '@aws-amplify/core';

export const imageFileType = [
  'apng',
  'bmp',
  'gif',
  'ico',
  'cur',
  'jpg',
  'jpeg',
  'jfif',
  'pjpeg',
  'pjp',
  'png',
  'svg',
  'tif',
  'tiff',
  'webp',
];

export const calcKey = (file: File, fileToKey: string | Function) => {
  const { name, size, type } = file;
  let key = encodeURI(name);
  if (fileToKey) {
    if (typeof fileToKey === 'string') {
      key = fileToKey;
    } else if (typeof fileToKey === 'function') {
      key = fileToKey({ name, size, type });
    } else {
      key = encodeURI(JSON.stringify(fileToKey));
    }
    if (!key) {
      key = 'empty_key';
    }
  }

  return key.replace(/\s/g, '_');
};

export const getStorageObject = async (
  key: string,
  level: string,
  track: boolean,
  identityId: string,
  logger: Logger,
) => {
  if (!Storage || typeof Storage.get !== 'function') {
    throw new Error(NO_STORAGE_MODULE_FOUND);
  }

  try {
    const src = await Storage.get(key, { level, track, identityId });
    return src;
  } catch (error) {
    logger.error(error);
    throw new Error(error);
  }
};
