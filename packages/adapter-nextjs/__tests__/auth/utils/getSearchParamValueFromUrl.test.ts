import { getSearchParamValueFromUrl } from '../../../src/auth/utils/getSearchParamValueFromUrl';

describe('getSearchParamValueFromUrl', () => {
	it('returns the value of the specified search parameter from a full url', () => {
		const url = 'https://example.com?param1=value1&param2=value2';
		const result = getSearchParamValueFromUrl(url, 'param1');

		expect(result).toBe('value1');
	});

	it('returns the value of the specified search parameter from a relative url', () => {
		const url = '/some-path?param1=value1&param2=value2';
		const result = getSearchParamValueFromUrl(url, 'param2');

		expect(result).toBe('value2');
	});

	it('returns null when there are no search parameter is not present in the url', () => {
		const url = '/some-path';
		const result = getSearchParamValueFromUrl(url, 'param3');

		expect(result).toBeNull();
	});
});
