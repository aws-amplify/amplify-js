import BigInteger from '../src/BigInteger';
import AuthenticationHelper from '../src/AuthenticationHelper';

// Mock React Native
jest.mock('react-native', () => ({
	NativeModules: {
		RNAWSCognito: null
	}
}));

describe('enhance-rn fallbacks', () => {
	beforeAll(() => {
		global.RNAWSCognito = null;
		require('../enhance-rn');
	});

	it('should provide JavaScript fallback for modPow when native module is null', (done) => {
		const base = new BigInteger();
		base.fromInt(2);
		const exp = new BigInteger();
		exp.fromInt(3);
		const mod = new BigInteger();
		mod.fromInt(5);

		base.modPow(exp, mod, (err, result) => {
			expect(err).toBeNull();
			expect(result.toString(16)).toBe('3');
			done();
		});
	});

	it('should provide JavaScript fallback for calculateS when native module is null', (done) => {
		const instance = new AuthenticationHelper('TestPool');
		const xValue = new BigInteger('deadbeef', 16);
		const serverValue = new BigInteger('abcd1234', 16);

		// Set up required instance variables
		instance.k = new BigInteger('deadbeef', 16);
		instance.UValue = new BigInteger('abc', 16);

		instance.calculateS(xValue, serverValue, (err, result) => {
			expect(err).toBeNull();
			expect(result).toBeInstanceOf(BigInteger);
			done();
		});
	});
});
