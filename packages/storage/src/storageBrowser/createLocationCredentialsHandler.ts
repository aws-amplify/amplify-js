// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CredentialsProvider, GetLocationCredentials } from './types';

interface CreateLocationCredentialsHandlerInput {
	accountId: string;
	credentialsProvider: CredentialsProvider;
	region: string;
}

export const createLocationCredentialsHandler = (
	// eslint-disable-next-line unused-imports/no-unused-vars
	input: CreateLocationCredentialsHandlerInput,
): GetLocationCredentials => {
	// TODO(@AllanZhengYP)
	throw new Error('Not Implemented');
};
