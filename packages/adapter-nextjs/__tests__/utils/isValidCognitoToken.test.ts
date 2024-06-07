import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { JwtExpiredError } from 'aws-jwt-verify/error';

import { isValidCognitoToken } from '../../src/utils/isValidCognitoToken';

jest.mock('aws-jwt-verify', () => {
	return {
		CognitoJwtVerifier: {
			create: jest.fn(),
		},
	};
});

const mockedCreate = CognitoJwtVerifier.create as jest.MockedFunction<
	typeof CognitoJwtVerifier.create
>;

describe('isValidCognitoToken', () => {
	const token = 'mocked-token';
	const userPoolId = 'us-east-1_test';
	const clientId = 'client-id-test';
	const tokenType = 'id';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return true for a valid token', async () => {
		const mockVerifier: any = {
			verify: jest.fn().mockResolvedValue({}),
		};
		mockedCreate.mockReturnValue(mockVerifier);

		const isValid = await isValidCognitoToken({
			token,
			userPoolId,
			clientId,
			tokenType,
		});
		expect(isValid).toBe(true);
		expect(CognitoJwtVerifier.create).toHaveBeenCalledWith({
			userPoolId,
			clientId,
			tokenUse: tokenType,
		});
		expect(mockVerifier.verify).toHaveBeenCalledWith(token);
	});

	it('should return true for a token that has valid signature and expired', async () => {
		const mockVerifier: any = {
			verify: jest
				.fn()
				.mockRejectedValue(
					new JwtExpiredError('Token expired', 'mocked-token'),
				),
		};
		mockedCreate.mockReturnValue(mockVerifier);

		const isValid = await isValidCognitoToken({
			token,
			userPoolId,
			clientId,
			tokenType,
		});
		expect(isValid).toBe(true);
		expect(CognitoJwtVerifier.create).toHaveBeenCalledWith({
			userPoolId,
			clientId,
			tokenUse: tokenType,
		});
		expect(mockVerifier.verify).toHaveBeenCalledWith(token);
	});

	it('should return false for an invalid token', async () => {
		const mockVerifier: any = {
			verify: jest.fn().mockRejectedValue(new Error('Invalid token')),
		};
		mockedCreate.mockReturnValue(mockVerifier);

		const isValid = await isValidCognitoToken({
			token,
			userPoolId,
			clientId,
			tokenType,
		});
		expect(isValid).toBe(false);
		expect(CognitoJwtVerifier.create).toHaveBeenCalledWith({
			userPoolId,
			clientId,
			tokenUse: tokenType,
		});
		expect(mockVerifier.verify).toHaveBeenCalledWith(token);
	});
});
