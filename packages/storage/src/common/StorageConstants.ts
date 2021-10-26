export const AMPLIFY_SYMBOL = (typeof Symbol !== 'undefined' &&
typeof Symbol.for === 'function'
	? Symbol.for('amplify_default')
	: '@@amplify_default') as Symbol;

export const SET_CONTENT_LENGTH_HEADER = 'contentLengthMiddleware';

export const localTestingStorageEndpoint = 'http://localhost:20005';

export const UPLOADS_STORAGE_KEY = '__uploadInProgress';
