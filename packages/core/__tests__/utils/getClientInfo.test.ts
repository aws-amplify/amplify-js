import { getClientInfo } from '../../src/utils/getClientInfo';

describe('getClientInfo', () => {
	// create spies
	const userAgentSpy = jest.spyOn(window.navigator, 'userAgent', 'get');

	afterEach(() => {
		userAgentSpy.mockReset();
	});

	it('gets opera info', () => {
		userAgentSpy.mockReturnValue(
			'Opera/9.80 (Macintosh; Intel Mac OS X; U; en) Presto/2.2.15 Version/10.00'
		);
		expect(getClientInfo().model).toBe('n');
		expect(getClientInfo().version).toBe('10.00');
	});

	it('gets ie info', () => {
		userAgentSpy.mockReturnValue(
			'Internet Explorer 10 Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)'
		);
		expect(getClientInfo().model).toBe('Trident');
		expect(getClientInfo().version).toBe('6.0');
	});

	it('gets safari info', () => {
		userAgentSpy.mockReturnValue(
			'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1'
		);
		expect(getClientInfo().model).toBe('Safari');
		expect(getClientInfo().version).toBe('604.1');
	});

	it('gets safari info', () => {
		userAgentSpy.mockReturnValue(
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
		);
		expect(getClientInfo().model).toBe('Chrome');
		expect(getClientInfo().version).toBe('51.0.2704.103');
	});
});
