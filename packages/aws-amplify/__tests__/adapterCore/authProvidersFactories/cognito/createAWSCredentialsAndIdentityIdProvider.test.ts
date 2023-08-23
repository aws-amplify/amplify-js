// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AWSCredentialsAndIdentityIdProvider,
	KeyValueStorageInterface,
} from '@aws-amplify/core';
import { createAWSCredentialsAndIdentityIdProvider } from '../../../../src/adapterCore';

const mockKeyValueStorage: KeyValueStorageInterface = {
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};

describe('createAWSCredentialsAndIdentityIdProvider', () => {
	let credentialsProvider: AWSCredentialsAndIdentityIdProvider;

	it('should create a credentials provider', () => {
		credentialsProvider =
			createAWSCredentialsAndIdentityIdProvider(mockKeyValueStorage);
		expect(credentialsProvider).toBeDefined();
	});
});
