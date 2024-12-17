// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoJwtVerifier } from 'aws-jwt-verify';

import { isValidCognitoToken } from '../../src/utils/isValidCognitoToken';
import { createTokenValidator } from '../../src/utils/createTokenValidator';
import { JwtVerifier } from '../../src/types';

jest.mock('aws-jwt-verify');
jest.mock('../../src/utils/isValidCognitoToken');

describe('createTokenValidator', () => {
	const userPoolId = 'userPoolId';
	const userPoolClientId = 'clientId';
	const accessToken = {
		key: 'CognitoIdentityServiceProvider.clientId.usersub.accessToken',
		value: 'access-token-value',
	};
	const idToken = {
		key: 'CognitoIdentityServiceProvider.clientId.usersub.idToken',
		value: 'id-token-value',
	};

	const mockIsValidCognitoToken = jest.mocked(isValidCognitoToken);
	const mockCognitoJwtVerifier = {
		create: jest.mocked(CognitoJwtVerifier.create),
	};

	afterEach(() => {
		mockIsValidCognitoToken.mockClear();
	});

	it('should return a token validator', () => {
		expect(
			createTokenValidator({
				userPoolId,
				userPoolClientId,
			}),
		).toStrictEqual({
			getItem: expect.any(Function),
		});
	});

	describe('created token validator', () => {
		afterEach(() => {
			mockCognitoJwtVerifier.create.mockReset();
		});

		it('should return true if key is not for access or id tokens', async () => {
			const tokenValidator = createTokenValidator({
				userPoolId,
				userPoolClientId,
			});

			expect(await tokenValidator.getItem?.('key', 'value')).toBe(true);
			expect(mockIsValidCognitoToken).not.toHaveBeenCalled();
		});

		it('should return false if validator created without user pool or client ids', async () => {
			const tokenValidator = createTokenValidator({});

			expect(
				await tokenValidator.getItem?.(accessToken.key, accessToken.value),
			).toBe(false);
			expect(await tokenValidator.getItem?.(idToken.key, idToken.value)).toBe(
				false,
			);
			expect(mockIsValidCognitoToken).not.toHaveBeenCalled();
		});

		describe.each([
			{ tokenUse: 'access', token: accessToken },
			{ tokenUse: 'id', token: idToken },
		])('$tokenUse token verifier', ({ tokenUse, token }) => {
			const mockTokenVerifier = {} as JwtVerifier;
			const tokenValidator = createTokenValidator({
				userPoolId,
				userPoolClientId,
			});

			beforeAll(() => {
				mockCognitoJwtVerifier.create.mockReturnValue(mockTokenVerifier);
			});

			it('should create a jwt verifier and use it to validate', async () => {
				await tokenValidator.getItem?.(token.key, token.value);

				expect(mockCognitoJwtVerifier.create).toHaveBeenCalledWith({
					userPoolId,
					clientId: userPoolClientId,
					tokenUse,
				});
				expect(mockIsValidCognitoToken).toHaveBeenCalledWith({
					token: token.value,
					verifier: mockTokenVerifier,
				});
			});

			it('should not re-create the jwt verifier', async () => {
				await tokenValidator.getItem?.(token.key, token.value);

				expect(mockCognitoJwtVerifier.create).not.toHaveBeenCalled();
				expect(mockIsValidCognitoToken).toHaveBeenCalled();
			});
		});
	});
});
