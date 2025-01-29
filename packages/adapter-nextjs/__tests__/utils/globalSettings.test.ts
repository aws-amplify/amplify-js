import { globalSettings } from '../../src/utils/globalSettings';

describe('globalSettings', () => {
	describe('with default globalSettings', () => {
		test('isServerSideAuthEnabled should return false', () => {
			expect(globalSettings.isServerSideAuthEnabled()).toBe(false);
		});

		test('isSSLOrigin should return false', () => {
			expect(globalSettings.isSSLOrigin()).toBe(false);
		});

		test('getRuntimeOptions should return empty object', () => {
			expect(globalSettings.getRuntimeOptions()).toEqual({});
		});
	});

	test('enableServerSideAuth should set isServerSideAuthEnabled to true', () => {
		globalSettings.enableServerSideAuth();
		expect(globalSettings.isServerSideAuthEnabled()).toBe(true);
	});

	test('setIsSSLOrigin should set isSSLOrigin to true', () => {
		globalSettings.setIsSSLOrigin(true);
		expect(globalSettings.isSSLOrigin()).toBe(true);
	});

	test('setRuntimeOptions should set runtimeOptions', () => {
		const runtimeOptions = { cookies: { domain: 'example.com' } };
		globalSettings.setRuntimeOptions(runtimeOptions);
		expect(globalSettings.getRuntimeOptions()).toEqual(runtimeOptions);
	});
});
