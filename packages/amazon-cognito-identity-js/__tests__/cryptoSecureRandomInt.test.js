const crypto = require('crypto');

jest.mock('crypto', () => ({
	getRandomValues: jest.fn(),
	randomBytes: jest.fn(() => ({
		readInt32LE: jest.fn().mockReturnValueOnce(54321),
	})),
}));

const mockCrypto = crypto;

describe('cryptoSecureRandomInt test', () => {
	let windowSpy;

	beforeEach(() => {
		jest.resetModules();
		windowSpy = jest.spyOn(window, 'window', 'get');
	});

	afterEach(() => {
		windowSpy.mockRestore();
	});

	test('crypto is set for window (browser)', () => {
		windowSpy.mockImplementation(() => ({
			crypto: {
				getRandomValues: () => [12345],
			},
		}));

		const cryptoSecureRandomInt =
			require('../src/utils/cryptoSecureRandomInt').default;
		expect(window.crypto).toBeTruthy();
		expect(cryptoSecureRandomInt()).toBe(12345);
	});

	test('crypto is set for window (IE 11)', () => {
		windowSpy.mockImplementation(() => ({
			crypto: undefined,
			msCrypto: {
				getRandomValues: () => [67890],
			},
		}));

		const cryptoSecureRandomInt =
			require('../src/utils/cryptoSecureRandomInt').default;
		expect(window.msCrypto).toBeTruthy();
		expect(cryptoSecureRandomInt()).toBe(67890);
	});

	test('crypto is set for Node (< 18)', () => {
		windowSpy.mockImplementationOnce(() => ({
			crypto: null,
		}));

		const originalGetRandomValues = mockCrypto.getRandomValues;

		mockCrypto.getRandomValues = undefined;

		const cryptoSecureRandomInt =
			require('../src/utils/cryptoSecureRandomInt').default;
		expect(cryptoSecureRandomInt()).toBe(54321);

		mockCrypto.getRandomValues = originalGetRandomValues;
	});

	test('crypto is set for Node (>= 18)', () => {
		windowSpy.mockImplementationOnce(() => ({
			crypto: null,
		}));

		mockCrypto.getRandomValues.mockReturnValueOnce([54321]);

		const cryptoSecureRandomInt =
			require('../src/utils/cryptoSecureRandomInt').default;
		expect(cryptoSecureRandomInt()).toBe(54321);
	});
});
