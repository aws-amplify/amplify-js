import Signer from '../src/Signer';
import { DateUtils } from '../src';

jest.mock('@aws-sdk/util-hex-encoding', () => ({
	...jest.requireActual('@aws-sdk/util-hex-encoding'),
	toHex: () => {
		return 'encrypt';
	},
}));

describe('Signer test', () => {
	test('Should throw an Error if body attribute is passed to sign method', () => {
		const url = 'https://host/some/path';

		const request_body = {
			url,
			headers: {},
			body: {},
		};

		const access_info = {
			session_token: 'session_token',
		};

		const spyon = jest
			.spyOn(Date.prototype, 'toISOString')
			.mockReturnValueOnce('0');

		const getDateSpy = jest.spyOn(DateUtils, 'getDateWithClockOffset');

		expect(() => {
			Signer.sign(request_body, access_info, {
				service: 'aservice',
				region: 'aregion',
			});
		}).toThrowError(
			'The attribute "body" was found on the request object. Please use the attribute "data" instead.'
		);

		expect(getDateSpy).toHaveBeenCalledTimes(0);
		spyon.mockClear();
	});

	test('Should NOT throw an Error if data attribute is passed to sign method', () => {
		const url = 'https://host/some/path';

		const request_data = {
			url,
			headers: {},
			data: {},
		};

		const access_info = {
			session_token: 'session_token',
		};

		const spyon = jest
			.spyOn(Date.prototype, 'toISOString')
			.mockReturnValueOnce('0');

		const getDateSpy = jest.spyOn(DateUtils, 'getDateWithClockOffset');

		expect(() => {
			Signer.sign(request_data, access_info, {
				service: 'aservice',
				region: 'aregion',
			});
		}).not.toThrowError();

		expect(getDateSpy).toHaveBeenCalledTimes(1);
		spyon.mockClear();
	});
});
