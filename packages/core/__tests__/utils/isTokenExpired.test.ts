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

	describe('clockDrift edge cases', () => {
		it('should treat NaN clockDrift as 0 and correctly detect expired token', () => {
			const result = isTokenExpired({
				expiresAt: Date.now() - 1000, // expired 1 second ago
				clockDrift: NaN,
				tolerance: 0,
			});

			expect(result).toBe(true);
		});

		it('should treat NaN clockDrift as 0 and correctly detect valid token', () => {
			const result = isTokenExpired({
				expiresAt: Date.now() + 10000, // expires in 10 seconds
				clockDrift: NaN,
				tolerance: 0,
			});

			expect(result).toBe(false);
		});

		it('should handle positive clockDrift correctly', () => {
			// With positive clockDrift, effective time is ahead
			const result = isTokenExpired({
				expiresAt: Date.now() + 1000, // expires in 1 second
				clockDrift: 2000, // but we're 2 seconds ahead
				tolerance: 0,
			});

			expect(result).toBe(true);
		});

		it('should handle negative clockDrift correctly', () => {
			// With negative clockDrift, effective time is behind
			const result = isTokenExpired({
				expiresAt: Date.now() - 1000, // expired 1 second ago
				clockDrift: -2000, // but we're 2 seconds behind
				tolerance: 0,
			});

			expect(result).toBe(false);
		});

		it('should handle zero clockDrift correctly', () => {
			const result = isTokenExpired({
				expiresAt: Date.now() + 1000,
				clockDrift: 0,
				tolerance: 0,
			});

			expect(result).toBe(false);
		});
	});
});
