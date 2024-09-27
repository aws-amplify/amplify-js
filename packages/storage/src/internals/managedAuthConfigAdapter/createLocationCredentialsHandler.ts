// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDataAccess } from '../apis/getDataAccess';
import {
	CredentialsProvider,
	GetLocationCredentials,
	GetLocationCredentialsInput,
} from '../types/credentials';

interface CreateLocationCredentialsHandlerInput {
	accountId: string;
	credentialsProvider: CredentialsProvider;
	region: string;
}

export const createLocationCredentialsHandler = (
	handlerInput: CreateLocationCredentialsHandlerInput,
): GetLocationCredentials => {
	const { accountId, region, credentialsProvider } = handlerInput;

	/**
	 * Retrieves credentials for the specified scope & permission.
	 *
	 * @param input - An object specifying the requested scope & permission.
	 *
	 * @returns A promise which will resolve with the requested credentials.
	 */
	return (input: GetLocationCredentialsInput) => {
		const { scope, permission } = input;

		return getDataAccess({
			accountId,
			credentialsProvider,
			permission,
			region,
			scope,
		});
	};
};
