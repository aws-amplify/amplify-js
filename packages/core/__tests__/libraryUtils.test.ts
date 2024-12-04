import { isTokenExpired } from '../src/libraryUtils';

describe('isTokenExpired', () => {
	it('should return false when expiration time is within tolerance', () => {
		const result = isTokenExpired({
			expiresAt: Date.now() + 5000,
			clockDrift: 0,
			tolerance: 5000,
		});

		expect(result).toBe(false);
	});
	it('should return true when expiration time is outside tolerance', () => {
		const result = isTokenExpired({
			expiresAt: Date.now() + 5000,
			clockDrift: 1,
			tolerance: 5000,
		});
		expect(result).toBe(true);
	});
});
