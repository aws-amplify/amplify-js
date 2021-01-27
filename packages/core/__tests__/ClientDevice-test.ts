import { ClientDevice } from '../src/ClientDevice';
import { browserType } from '../src/ClientDevice/browser';

describe('ClientDevice', () => {
	test('clientInfo', () => {
		expect(ClientDevice.clientInfo()).toBeInstanceOf(Object);
	});

	test('clientInfo', () => {
		const dimensions = ClientDevice.dimension();
		expect(typeof dimensions.width).toBe('number');
		expect(typeof dimensions.height).toBe('number');
	});
});

describe('browserType', () => {
	test('opera', () => {
		expect(
			browserType(
				'Opera/9.80 (Macintosh; Intel Mac OS X; U; en) Presto/2.2.15 Version/10.00'
			)
		).toStrictEqual({
			type: 'n',
			version: '10.00',
		});
	});

	test('ie', () => {
		expect(
			browserType(`Internet Explorer 10
Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)`)
		).toStrictEqual({
			type: 'Trident',
			version: '6.0',
		});
	});

	test('safari', () => {
		expect(
			browserType(
				`Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1`
			)
		).toStrictEqual({
			type: 'Safari',
			version: '604.1',
		});
	});

	test('chrome', () => {
		expect(
			browserType(
				`Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36`
			)
		).toStrictEqual({
			type: 'Chrome',
			version: '51.0.2704.103',
		});
	});
});
