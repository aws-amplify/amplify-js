// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { MemoryKeyValueStorage } from '@aws-amplify/core';
import { DefaultIdentityIdStore } from './IdentityIdStore';
import { CognitoAWSCredentialsAndIdentityIdProvider } from './credentialsProvider';

/**
 * Cognito specific implmentation of the CredentialsProvider interface
 * that manages setting and getting of AWS Credentials.
 *
 * @throws internal: {@link AuthError }
 *  - Auth errors that may arise from misconfiguration.
 *
 */
export const cognitoCredentialsProvider =
	new CognitoAWSCredentialsAndIdentityIdProvider();

export const defaultIdentityIdStore = new DefaultIdentityIdStore(
	MemoryKeyValueStorage
);
