// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isValidCognitoToken } from '@aws-amplify/core/internals/utils';

import { createTokenValidator } from '../../src/utils/createTokenValidator';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isValidCognitoToken: jest.fn(),
}));
const mockIsValidCognitoToken = isValidCognitoToken as jest.Mock;

const userPoolId = 'userPoolId';
const userPoolClientId = 'clientId';
const tokenValidatorInput = {
	userPoolId,
	userPoolClientId,
};
const accessToken = {
	key: 'CognitoIdentityServiceProvider.clientId.usersub.accessToken',
	value:
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTEiLCJpc3MiOiJodHRwc',
};
const idToken = {
	key: 'CognitoIdentityServiceProvider.clientId.usersub.idToken',
	value: 'eyJzdWIiOiIxMTEiLCJpc3MiOiJodHRwc.XAiOiJKV1QiLCJhbGciOiJIUzI1NiJ',
};

const tokenValidator = createTokenValidator({
	userPoolId,
	userPoolClientId,
});

describe('Validator', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});
	it('should return a validator', () => {
		expect(createTokenValidator(tokenValidatorInput)).toBeDefined();
	});

	it('should return true for non-token keys', async () => {
		const result = await tokenValidator.getItem?.('mockKey', 'mockValue');
		expect(result).toBe(true);
		expect(mockIsValidCognitoToken).toHaveBeenCalledTimes(0);
	});

	it('should return true for valid accessToken', async () => {
		mockIsValidCognitoToken.mockImplementation(() => Promise.resolve(true));

		const result = await tokenValidator.getItem?.(
			accessToken.key,
			accessToken.value,
		);

		expect(result).toBe(true);
		expect(mockIsValidCognitoToken).toHaveBeenCalledTimes(1);
		expect(mockIsValidCognitoToken).toHaveBeenCalledWith({
			userPoolId,
			clientId: userPoolClientId,
			token: accessToken.value,
			tokenType: 'access',
		});
	});

	it('should return true for valid idToken', async () => {
		mockIsValidCognitoToken.mockImplementation(() => Promise.resolve(true));

		const result = await tokenValidator.getItem?.(idToken.key, idToken.value);
		expect(result).toBe(true);
		expect(mockIsValidCognitoToken).toHaveBeenCalledTimes(1);
		expect(mockIsValidCognitoToken).toHaveBeenCalledWith({
			userPoolId,
			clientId: userPoolClientId,
			token: idToken.value,
			tokenType: 'id',
		});
	});

	it('should return false if invalid tokenType is access', async () => {
		mockIsValidCognitoToken.mockImplementation(() => Promise.resolve(false));

		const result = await tokenValidator.getItem?.(idToken.key, idToken.value);
		expect(result).toBe(false);
		expect(mockIsValidCognitoToken).toHaveBeenCalledTimes(1);
	});
});
