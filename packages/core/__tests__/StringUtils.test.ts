import { TextDecoder, TextEncoder } from 'util';

import { urlSafeDecode, urlSafeEncode } from '../src/utils';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

const complexCustomState = 'https://amplify-app:300/?empty=&list=1,a,%,@';

describe('StringUtils', () => {
	test('urlSafe encoding', () => {
		const urlSafeState = urlSafeEncode(complexCustomState);
		expect(encodeURIComponent(urlSafeState)).toEqual(urlSafeState);
	});
	test('urlSafe decoding', () => {
		const urlSafeState = urlSafeEncode(complexCustomState);
		const encodedState = encodeURIComponent(urlSafeState);

		expect(decodeURIComponent(encodedState)).toEqual(encodedState);
	});
	test('URI encode/decode with url safe state', () => {
		const urlSafeState = urlSafeEncode(complexCustomState);
		const encodedState = encodeURIComponent(urlSafeState);

		expect(urlSafeDecode(decodeURIComponent(encodedState))).toEqual(
			complexCustomState,
		);
	});
});
