// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CognitoAWSCredentialsAndIdentityIdProvider,
	DefaultIdentityIdStore,
} from '@aws-amplify/auth/cognito';
import {
	CredentialsAndIdentityIdProvider,
	AuthConfig,
	KeyValueStorageInterface,
} from '@aws-amplify/core';
import { createAWSCredentialsAndIdentityIdProvider } from '../../../../src/adapter-core';

jest.mock('@aws-amplify/auth/cognito');

const MockCognitoAWSCredentialsAndIdentityIdProvider =
	CognitoAWSCredentialsAndIdentityIdProvider as jest.Mock;
const MockDefaultIdentityIdStore = DefaultIdentityIdStore as jest.Mock;

const mockKeyValueStorage: KeyValueStorageInterface = {
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};
const mockAuthConfig: AuthConfig = {
	Cognito: {
		identityPoolId: '123',
		userPoolId: 'abc',
		userPoolClientId: 'def',
	},
};

describe('createAWSCredentialsAndIdentityIdProvider', () => {
	it('should create a credentials provider', () => {
		const credentialsProvider = createAWSCredentialsAndIdentityIdProvider(
			mockAuthConfig,
			mockKeyValueStorage,
		);

		expect(MockDefaultIdentityIdStore).toHaveBeenCalledWith(
			mockKeyValueStorage,
		);
		expect(
			MockCognitoAWSCredentialsAndIdentityIdProvider,
		).toHaveBeenCalledTimes(1);
		const mockCredentialsProviderInstance =
			MockCognitoAWSCredentialsAndIdentityIdProvider.mock.instances[0];

		expect(credentialsProvider).toEqual(mockCredentialsProviderInstance);
	});
});
