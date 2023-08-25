// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextServer } from './types';
import {
	createCookieStorageAdapterFromNextServerContext,
	getAmplifyConfig,
} from './utils';
import { MemoryKeyValueStorage } from '@aws-amplify/core';
import {
	createAWSCredentialsAndIdentityIdProvider,
	createKeyValueStorageFromCookieStorageAdapter,
	createUserPoolsTokenProvider,
	runWithAmplifyServerContext as runWithAmplifyServerContextCore,
} from 'aws-amplify/internals/adapter-core';

export const runWithAmplifyServerContext: NextServer.RunOperationWithContext =
	async ({ nextServerContext, operation }) => {
		// 1. get amplify config from env vars
		// 2. create key-value storage from nextServerContext
		// 3. create credentials provider
		// 4. create token provider
		// 5. call low level runWithAmplifyServerContext
		const amplifyConfig = getAmplifyConfig();

		// When the Auth config is presented, attempt to create a Amplify server
		// context with token and credentials provider.
		if (amplifyConfig.Auth) {
			const keyValueStorage =
				nextServerContext === null
					? // When `null` is passed as the value of `nextServerContext`, opt-in
					  // unauthenticated role (primarily for static rendering). It's
					  // safe to use the singleton `MemoryKeyValueStorage` here, as the
					  // static rendering uses the same unauthenticated role cross-sever.
					  MemoryKeyValueStorage
					: createKeyValueStorageFromCookieStorageAdapter(
							createCookieStorageAdapterFromNextServerContext(nextServerContext)
					  );
			const credentialsProvider = createAWSCredentialsAndIdentityIdProvider(
				amplifyConfig.Auth,
				keyValueStorage
			);
			const tokenProvider = createUserPoolsTokenProvider(
				amplifyConfig.Auth,
				keyValueStorage
			);

			return runWithAmplifyServerContextCore(
				amplifyConfig,
				{
					Auth: { credentialsProvider, tokenProvider },
				},
				operation
			);
		}

		// Otherwise it may be the case that auth is not used, e.g. API key.
		// Omitting the `Auth` in the second parameter.
		return runWithAmplifyServerContextCore(amplifyConfig, {}, operation);
	};
