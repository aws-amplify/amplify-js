import { isTokenExpired } from '../../src/libraryUtils';

describe('isTokenExpired', () => {
	const mockDate = Date.now();
	jest.spyOn(Date, 'now').mockImplementation(() => mockDate);

	it('should return true when token is expired', () => {
		const result = isTokenExpired({
			expiresAt: Date.now() - 1,
			clockDrift: 0,
			tolerance: 0,
		});

		expect(result).toBe(true);
	});

	it('should return false when token is not expired', () => {
		const result = isTokenExpired({
			expiresAt: Date.now() + 1,
			clockDrift: 0,
			tolerance: 0,
		});

		expect(result).toBe(false);
	});

	it('should return false when expiration time is within tolerance', () => {
		const result = isTokenExpired({
			expiresAt: Date.now() + 5001, // more than 5 seconds remaining until expiration
			clockDrift: 0,
			tolerance: 5000,
		});

		expect(result).toBe(false);
	});

	it('should return true when expiration time is outside tolerance', () => {
		const result = isTokenExpired({
			expiresAt: Date.now() + 4999, // less than 5 seconds remaining until expiration
			clockDrift: 0,
			tolerance: 5000,
		});

		expect(result).toBe(true);
	});

	it('should return false when expiration time is equal to tolerance', () => {
		const result = isTokenExpired({
			expiresAt: Date.now() + 5000, // exactly 5 seconds remaining until expiration
			clockDrift: 0,
			tolerance: 5000,
		});

		expect(result).toBe(false);
	});
});
