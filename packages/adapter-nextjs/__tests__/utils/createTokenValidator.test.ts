// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as coreUtils from '@aws-amplify/core/internals/utils';

import { createTokenValidator } from '../../src/utils/createTokenValidator';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	isValidCognitoToken: jest.fn(),
}));

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
		const isValidCognitoTokenSpy = jest.spyOn(coreUtils, 'isValidCognitoToken');

		const result = await tokenValidator?.getItem?.('mockKey', 'mockValue');
		expect(result).toBe(true);
		expect(isValidCognitoTokenSpy).toHaveBeenCalledTimes(0);
	});

	it('should return true for valid accessToken', async () => {
		const isValidCognitoTokenSpy = jest
			.spyOn(coreUtils, 'isValidCognitoToken')
			.mockReturnValue(Promise.resolve(true));

		const result = await tokenValidator?.getItem?.(
			accessToken.key,
			accessToken.value,
		);

		expect(result).toBe(true);
		expect(isValidCognitoTokenSpy).toHaveBeenCalledTimes(1);
		expect(isValidCognitoTokenSpy).toHaveBeenCalledWith({
			userPoolId,
			clientId: userPoolClientId,
			token: accessToken.value,
			tokenType: 'access',
		});
	});

	it('should return true for valid idToken', async () => {
		const isValidCognitoTokenSpy = jest
			.spyOn(coreUtils, 'isValidCognitoToken')
			.mockReturnValue(Promise.resolve(true));

		const result = await tokenValidator?.getItem?.(idToken.key, idToken.value);
		expect(result).toBe(true);
		expect(isValidCognitoTokenSpy).toHaveBeenCalledTimes(1);
		expect(isValidCognitoTokenSpy).toHaveBeenCalledWith({
			userPoolId,
			clientId: userPoolClientId,
			token: idToken.value,
			tokenType: 'id',
		});
	});

	it('should return false if invalid tokenType is access', async () => {
		const isValidCognitoTokenSpy = jest
			.spyOn(coreUtils, 'isValidCognitoToken')
			.mockReturnValue(Promise.resolve(false));

		const result = await tokenValidator?.getItem?.(idToken.key, idToken.value);
		expect(result).toBe(false);
		expect(isValidCognitoTokenSpy).toHaveBeenCalledTimes(1);
	});
});
