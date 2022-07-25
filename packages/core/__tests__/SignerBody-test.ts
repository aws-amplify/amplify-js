import Signer from '../src/Signer';
import { DateUtils } from '../src';

jest.mock('@aws-sdk/util-hex-encoding', () => ({
	...jest.requireActual('@aws-sdk/util-hex-encoding'),
	toHex: () => {
		return 'encrypt';
	},
}));

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

			const getDateSpy = jest.spyOn(DateUtils, 'getDateWithClockOffset');

			const res = {
				headers: {
					Authorization:
						'AWS4-HMAC-SHA256 Credential=undefined/0/aregion/aservice/aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token, Signature=encrypt',
					'X-Amz-Security-Token': 'session_token',
					host: 'host',
					'x-amz-date': '0',
				},
				url: url,
			};
			expect(
				Signer.sign(request, access_info, {
					service: 'aservice',
					region: 'aregion',
				})
			).toEqual(res);
			expect(getDateSpy).toHaveBeenCalledTimes(1);

			spyon.mockClear();
		});
	});
});
