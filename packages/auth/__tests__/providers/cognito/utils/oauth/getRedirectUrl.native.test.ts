import { invalidAppSchemeException } from '../../../../../src/errors/constants';
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

	it('should return preferredRedirectUrl if it matches at least one of the redirect urls from config', () => {
		const configRedirectUrl = mockRedirectUrls[2];

		expect(getRedirectUrl(mockRedirectUrls, configRedirectUrl)).toStrictEqual(
			configRedirectUrl,
		);
	});

	it('should throw an exception when there is no url with no http or https as prefix irrespective if a preferredSignOutUrl is given or not', () => {
		const mockRedirectUrlsWithNoAppScheme = ['https://intermidiateSite.com'];
		expect(() =>
			getRedirectUrl(
				mockRedirectUrlsWithNoAppScheme,
				mockRedirectUrlsWithNoAppScheme[0],
			),
		).toThrow(invalidAppSchemeException);
		expect(() => getRedirectUrl(mockRedirectUrlsWithNoAppScheme)).toThrow(
			invalidAppSchemeException,
		);
	});
});
