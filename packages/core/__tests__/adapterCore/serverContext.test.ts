// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	createAmplifyServerContext,
	getAmplifyServerContext,
	destroyAmplifyServerContext,
} from '../../src/adapterCore';

const mockConfigure = jest.fn();
jest.mock('../../src/singleton', () => ({
	AmplifyClass: jest.fn().mockImplementation(() => ({
		configure: mockConfigure,
	})),
}));

const mockAmplifyConfig = {};
const mockTokenProvider = {
	getTokens: jest.fn(),
};
const mockCredentialAndIdentityProvider = {
	getCredentialsAndIdentityId: jest.fn(),
	clearCredentialsAndIdentityId: jest.fn(),
};

describe('serverContext', () => {
	describe('createAmplifyServerContext', () => {
		it('should invoke AmplifyClassV6.configure', () => {
			createAmplifyServerContext(mockAmplifyConfig, {
				Auth: {
					tokenProvider: mockTokenProvider,
					credentialsProvider: mockCredentialAndIdentityProvider,
				},
			});

			expect(mockConfigure).toBeCalledWith(mockAmplifyConfig, {
				Auth: {
					tokenProvider: mockTokenProvider,
					credentialsProvider: mockCredentialAndIdentityProvider,
				},
			});
		});

		it('should return a context spec', () => {
			const contextSpec = createAmplifyServerContext(mockAmplifyConfig, {
				Auth: {
					tokenProvider: mockTokenProvider,
					credentialsProvider: mockCredentialAndIdentityProvider,
				},
			});

			expect(typeof contextSpec.token.value).toBe('symbol');
		});
	});

	describe('getAmplifyServerContext', () => {
		it('should return the context', () => {
			const contextSpec = createAmplifyServerContext(mockAmplifyConfig, {
				Auth: {
					tokenProvider: mockTokenProvider,
					credentialsProvider: mockCredentialAndIdentityProvider,
				},
			});
			const context = getAmplifyServerContext(contextSpec);

			expect(context).toBeDefined();
		});

		it('should throw an error if the context is not found', () => {
			expect(() =>
				getAmplifyServerContext({ token: { value: Symbol('test') } })
			).toThrowError(
				'Attempted to get the Amplify Server Context that may have been destroyed.'
			);
		});
	});

	describe('destroyAmplifyServerContext', () => {
		it('should destroy the context', () => {
			const contextSpec = createAmplifyServerContext(mockAmplifyConfig, {
				Auth: {
					tokenProvider: mockTokenProvider,
					credentialsProvider: mockCredentialAndIdentityProvider,
				},
			});

			destroyAmplifyServerContext(contextSpec);

			expect(() => getAmplifyServerContext(contextSpec)).toThrowError(
				'Attempted to get the Amplify Server Context that may have been destroyed.'
			);
		});
	});

	describe('passing invalid contextSpec', () => {
		it('should throw exception if the contextSpec is invalid', () => {
			[
				{ bad: 'token' },
				{ token: { bad: 'value' } },
				{ token: { value: 'bad-value' } },
			].forEach(invalidContextSpec => {
				expect(() =>
					getAmplifyServerContext(invalidContextSpec as any)
				).toThrowError('Invalid `contextSpec`.');
			});
		});
	});
});
