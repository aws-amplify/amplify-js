import { getRedirectUrl } from '../../../../../src/providers/cognito/utils/oauth';
import {
	invalidOriginException,
	invalidRedirectException,
} from '../../../../../src/errors/constants';

describe('getRedirectUrl', () => {
	const mockRedirectUrls = ['https://example.com/app'];
	let windowSpy: jest.SpyInstance;

	beforeEach(() => {
		windowSpy = jest.spyOn(window, 'window', 'get');
	});

	afterEach(() => {
		windowSpy.mockRestore();
	});

	it('should return the redirect url that has the same origin and same pathName', () => {
		windowSpy.mockImplementation(() => ({
			location: {
				origin: 'https://example.com/',
				pathname: 'app',
			},
		}));
		expect(getRedirectUrl(mockRedirectUrls)).toStrictEqual(mockRedirectUrls[0]);
	});

	it('should throw an invalid origin exception if there is no url that is the same origin and pathname', () => {
		windowSpy.mockImplementation(() => ({
			location: {
				origin: 'https://differentOrigin.com/',
				pathname: 'differentApp',
			},
		}));
		expect(() => getRedirectUrl(mockRedirectUrls)).toThrow(
			invalidOriginException,
		);
	});

	it('should throw an invalid redirect exception if there is no url that is the same origin/pathname and is also not http or https', () => {
		const mockRedirectUrls = ['test-non-http-string'];
		windowSpy.mockImplementation(() => ({
			location: {
				origin: 'https://differentOrigin.com/',
				pathname: 'differentApp',
			},
		}));
		expect(() => getRedirectUrl(mockRedirectUrls)).toThrow(
			invalidRedirectException,
		);
	});

	it('should return the preferredRedirectUrl if it is provided and matches one of the redirectUrls from config', () => {
		expect(getRedirectUrl(mockRedirectUrls, mockRedirectUrls[0])).toStrictEqual(
			mockRedirectUrls[0],
		);
	});

	it('should throw an exception if preferredRedirectUrl is given but does not match any of the redirectUrls from config', () => {
		expect(() =>
			getRedirectUrl(mockRedirectUrls, 'https://unknownOrigin.com'),
		).toThrow(invalidRedirectException);
	});
});
