// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig, sharedInMemoryStorage } from '@aws-amplify/core';
import {
	createAWSCredentialsAndIdentityIdProvider,
	createKeyValueStorageFromCookieStorageAdapter,
	createUserPoolsTokenProvider,
	runWithAmplifyServerContext as runWithAmplifyServerContextCore,
} from 'aws-amplify/adapter-core';

import { NextServer } from '../types';

import { createTokenValidator } from './createTokenValidator';
import { createCookieStorageAdapterFromNextServerContext } from './createCookieStorageAdapterFromNextServerContext';

export const createRunWithAmplifyServerContext = ({
	config: resourcesConfig,
}: {
	config: ResourcesConfig;
}) => {
	const runWithAmplifyServerContext: NextServer.RunOperationWithContext =
		async ({ nextServerContext, operation }) => {
			// When the Auth config is presented, attempt to create a Amplify server
			// context with token and credentials provider.
			if (resourcesConfig.Auth) {
				const keyValueStorage =
					// When `null` is passed as the value of `nextServerContext`, opt-in
					// unauthenticated role (primarily for static rendering). It's
					// safe to use the singleton `MemoryKeyValueStorage` here, as the
					// static rendering uses the same unauthenticated role cross-sever.
					nextServerContext === null
						? sharedInMemoryStorage
						: createKeyValueStorageFromCookieStorageAdapter(
								await createCookieStorageAdapterFromNextServerContext(
									nextServerContext,
								),
								createTokenValidator({
									userPoolId: resourcesConfig?.Auth.Cognito?.userPoolId,
									userPoolClientId:
										resourcesConfig?.Auth.Cognito?.userPoolClientId,
								}),
							);
				const credentialsProvider = createAWSCredentialsAndIdentityIdProvider(
					resourcesConfig.Auth,
					keyValueStorage,
				);
				const tokenProvider = createUserPoolsTokenProvider(
					resourcesConfig.Auth,
					keyValueStorage,
				);

				return runWithAmplifyServerContextCore(
					resourcesConfig,
					{
						Auth: { credentialsProvider, tokenProvider },
					},
					operation,
				);
			}

			// Otherwise it may be the case that auth is not used, e.g. API key.
			// Omitting the `Auth` in the second parameter.
			return runWithAmplifyServerContextCore(resourcesConfig, {}, operation);
		};

	return runWithAmplifyServerContext;
};
