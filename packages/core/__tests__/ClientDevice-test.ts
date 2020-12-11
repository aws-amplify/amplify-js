import { ClientDevice } from '../src/ClientDevice';

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
