// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultStorage } from '@aws-amplify/core';
import { GetCredentialsForIdentityException } from '~/src/providers/cognito/types/errors';

import { DefaultIdentityIdStore } from './IdentityIdStore';
import { CognitoAWSCredentialsAndIdentityIdProvider } from './credentialsProvider';

/**
 * Cognito specific implementation of the CredentialsProvider interface
 * that manages setting and getting of AWS Credentials.
 *
 * @throws configuration exceptions: {@link InvalidIdentityPoolIdException }
 *  - Auth errors that may arise from misconfiguration.
 * @throws service exception: {@link GetCredentialsForIdentityException}, {@link GetIdException}
 *
 */
export const cognitoCredentialsProvider =
	new CognitoAWSCredentialsAndIdentityIdProvider(
		new DefaultIdentityIdStore(defaultStorage),
	);

export { CognitoAWSCredentialsAndIdentityIdProvider, DefaultIdentityIdStore };
