// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const LOCAL_TESTING_S3_ENDPOINT = 'http://localhost:20005';

export const DEFAULT_ACCESS_LEVEL = 'guest';

export const DEFAULT_PRESIGN_EXPIRATION = 900;

export const MAX_URL_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

const MiB = 1024 * 1024;
const GiB = 1024 * MiB;
const TiB = 1024 * GiB;

/**
 * Default part size in MB that is used to determine if an upload task is single part or multi part.
 */
export const DEFAULT_PART_SIZE = 5 * MiB;
export const MAX_OBJECT_SIZE = 5 * TiB;
export const MAX_PARTS_COUNT = 10000;
export const DEFAULT_QUEUE_SIZE = 4;

export const UPLOADS_STORAGE_KEY = '__uploadInProgress';

export const STORAGE_INPUT_PREFIX = 'prefix';
export const STORAGE_INPUT_KEY = 'key';
export const STORAGE_INPUT_PATH = 'path';

export const DEFAULT_DELIMITER = '/';

export const CHECKSUM_ALGORITHM_CRC32 = 'crc-32';
