export const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

export const SET_CONTENT_LENGTH_HEADER = 'contentLengthMiddleware';

export const localTestingStorageEndpoint = 'http://localhost:20005';

export const UPLOADS_STORAGE_KEY = '__uploadInProgress';

const MB = 1024 * 1024;
const GB = 1024 * MB;
const TB = 1024 * GB;

export const DEFAULT_PART_SIZE = 5 * MB;
export const MAX_OBJECT_SIZE = 5 * TB;
export const MAX_PARTS_COUNT = 10000;
export const DEFAULT_QUEUE_SIZE = 4;
