import { JwtExpiredError } from 'aws-jwt-verify/error';

import { isValidCognitoToken } from '../../src/utils/isValidCognitoToken';
import { JwtVerifier } from '../../src/types';

describe('isValidCognitoToken', () => {
	const token = 'mocked-token';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return true for a valid token', async () => {
		// @ts-expect-error - partial mock
		const mockVerifier: JwtVerifier = {
			verify: jest.fn().mockResolvedValue(null),
		};

		expect(
			await isValidCognitoToken({
				token,
				verifier: mockVerifier,
			}),
		).toBe(true);
		expect(mockVerifier.verify).toHaveBeenCalledWith(token);
	});

	it('should return true for a token that has valid signature but is expired', async () => {
		// @ts-expect-error - partial mock
		const mockVerifier: JwtVerifier = {
			verify: jest
				.fn()
				.mockRejectedValue(new JwtExpiredError('Token expired', token)),
		};

		expect(
			await isValidCognitoToken({
				token,
				verifier: mockVerifier,
			}),
		).toBe(true);
	});

	it('should return false for an invalid token', async () => {
		// @ts-expect-error - partial mock
		const mockVerifier: JwtVerifier = {
			verify: jest.fn().mockRejectedValue(null),
		};

		expect(
			await isValidCognitoToken({
				token,
				verifier: mockVerifier,
			}),
		).toBe(false);
	});
});
