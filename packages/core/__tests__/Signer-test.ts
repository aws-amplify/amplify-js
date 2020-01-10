jest.mock('../src/Facet', () => {
	let ret = { util: { crypto: { lib: {} } } };
	ret['util']['crypto']['lib']['createHmac'] = () => {
		const update = () => {
			return {
				digest() {
					return 'encrypt';
				},
			};
		};
		return { update };
	};
	ret['util']['crypto']['createHash'] = () => {
		const update = () => {
			return {
				digest() {
					return 'hash';
				},
			};
		};
		return { update };
	};
	return {
		AWS: ret,
	};
});

import Signer from '../src/Signer';
import AWS from '../src';

describe('Signer test', () => {
	describe('sign test', () => {
		test('happy case', () => {
			const url = 'https://host/some/path';

			const request = {
				url,
				headers: {},
			};
			const access_info = {
				session_token: 'session_token',
			};

			const spyon = jest
				.spyOn(Date.prototype, 'toISOString')
				.mockReturnValueOnce('0');

			const res = {
				headers: {
					Authorization:
						'AWS4-HMAC-SHA256 Credential=undefined/0///aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token, Signature=encrypt',
					'X-Amz-Security-Token': 'session_token',
					host: 'host',
					'x-amz-date': '0',
				},
				url: url,
			};
			expect(Signer.sign(request, access_info)).toEqual(res);

			spyon.mockClear();
		});

		test('happy case signUrl', () => {
			const url = 'https://example.com:1234/some/path';

			const access_info = {
				session_token: 'session_token',
			};

			const spyon = jest
				.spyOn(Date.prototype, 'toISOString')
				.mockReturnValueOnce('0');

			const expectedUrl =
				'https://example.com:1234/some/path?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=%2F0%2Faregion%2Faservice%2Faws4_request&X-Amz-Date=0&X-Amz-Security-Token=session_token&X-Amz-SignedHeaders=host&X-Amz-Signature=encrypt';

			const signedUrl = Signer.signUrl(url, access_info, {
				service: 'aservice',
				region: 'aregion',
			});

			expect(signedUrl).toEqual(expectedUrl);

			spyon.mockClear();
		});
	});
});
