import { Cache } from '../../../src';
import { getDeviceId } from '../../../src/utils';

describe('getDeviceId: ', () => {
	const testDeviceId = 'test-device-id';
	it('should return the device id if already present in Cache', async () => {
		jest.spyOn(Cache, 'getItem').mockImplementationOnce(key => {
			return Promise.resolve(testDeviceId);
		});
		const setItemSpy = jest.spyOn(Cache, 'setItem');
		expect(await getDeviceId()).toBe(testDeviceId);
		expect(setItemSpy).toHaveBeenCalledTimes(0);
	});
	it('should create a new device id if not available and store it in Cache', async () => {
		jest.spyOn(Cache, 'getItem').mockImplementationOnce(key => {
			return Promise.resolve(undefined);
		});
		const setItemSpy = jest.spyOn(Cache, 'setItem');
		await getDeviceId();
		expect(setItemSpy).toHaveBeenCalledTimes(1);
	});
});
