// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DefaultIdentityIdStore } from './IdentityIdStore';
import { CognitoAWSCredentialsAndIdentityIdProvider } from './credentialsProvider';
import { defaultStorage } from '@aws-amplify/core';

/**
 * Cognito specific implmentation of the CredentialsProvider interface
 * that manages setting and getting of AWS Credentials.
 *
 * @throws configuration expections: {@link InvalidIdentityPoolIdException }
 *  - Auth errors that may arise from misconfiguration.
 * @throws service expections: {@link GetCredentialsForIdentityException}, {@link GetIdException}
 *
 */
export const cognitoCredentialsProvider =
	new CognitoAWSCredentialsAndIdentityIdProvider(
		new DefaultIdentityIdStore(defaultStorage)
	);

export { CognitoAWSCredentialsAndIdentityIdProvider, DefaultIdentityIdStore };
