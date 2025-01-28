import { globalRuntimeContext } from '../../src/utils/globalRuntimeContext';

describe('globalRuntimeContext', () => {
	describe('with default globalRuntimeContext', () => {
		test('isServerSideAuthEnabled should return false', () => {
			expect(globalRuntimeContext.isServerSideAuthEnabled()).toBe(false);
		});

		test('isSSLOrigin should return false', () => {
			expect(globalRuntimeContext.isSSLOrigin()).toBe(false);
		});

		test('getRuntimeOptions should return empty object', () => {
			expect(globalRuntimeContext.getRuntimeOptions()).toEqual({});
		});
	});

	test('enableServerSideAuth should set isServerSideAuthEnabled to true', () => {
		globalRuntimeContext.enableServerSideAuth();
		expect(globalRuntimeContext.isServerSideAuthEnabled()).toBe(true);
	});

	test('setIsSSLOrigin should set isSSLOrigin to true', () => {
		globalRuntimeContext.setIsSSLOrigin(true);
		expect(globalRuntimeContext.isSSLOrigin()).toBe(true);
	});

	test('setRuntimeOptions should set runtimeOptions', () => {
		const runtimeOptions = { cookies: { domain: 'example.com' } };
		globalRuntimeContext.setRuntimeOptions(runtimeOptions);
		expect(globalRuntimeContext.getRuntimeOptions()).toEqual(runtimeOptions);
	});
});
