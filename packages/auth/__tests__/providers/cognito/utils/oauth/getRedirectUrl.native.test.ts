import { invalidRedirectException } from '../../../../../src/errors/constants';
import { getRedirectUrl } from '../../../../../src/providers/cognito/utils/oauth/getRedirectUrl.native';

describe('getRedirectUrl (native)', () => {
	const mockRedirectUrls = [
		'myDevApp://',
		'myProdApp://',
		'https://intermidiateSite.com',
	];

	it('should return the first non http/s url from the array when preferredRedirectUrl is not provided', () => {
		expect(getRedirectUrl(mockRedirectUrls)).toStrictEqual(mockRedirectUrls[0]);
	});

	it('should return preferredRedirectUrl if it matches atleast one of the redirect urls from config', () => {
		expect(getRedirectUrl(mockRedirectUrls, mockRedirectUrls[2])).toStrictEqual(
			mockRedirectUrls[2],
		);
	});

	it('should throw an exception when there is no url with no http or https as prefix irrespective if a preferredSignOutUrl is given or not', () => {
		const mockRedirectUrls = ['https://intermidiateSite.com'];
		expect(() => getRedirectUrl(mockRedirectUrls, mockRedirectUrls[0])).toThrow(
			invalidRedirectException,
		);
		expect(() => getRedirectUrl(mockRedirectUrls)).toThrow(
			invalidRedirectException,
		);
	});
});
