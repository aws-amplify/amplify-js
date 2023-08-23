// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CognitoAWSCredentialsAndIdentityIdProvider,
	DefaultIdentityIdStore,
} from '@aws-amplify/auth/cognito';
import {
	AWSCredentialsAndIdentityIdProvider,
	KeyValueStorageInterface,
} from '@aws-amplify/core';

/**
 * Creates a instance of {@link CognitoAWSCredentialsAndIdentityIdProvider} using
 * the provided `keyValueStorage`.
 * @param keyValueStorage An object that implements the {@link KeyValueStorageInterface}.
 * @returns An instance of {@link CognitoAWSCredentialsAndIdentityIdProvider}.
 */
export const createAWSCredentialsAndIdentityIdProvider = (
	keyValueStorage: KeyValueStorageInterface
): AWSCredentialsAndIdentityIdProvider => {
	return new CognitoAWSCredentialsAndIdentityIdProvider(
		new DefaultIdentityIdStore(keyValueStorage)
	);
};
