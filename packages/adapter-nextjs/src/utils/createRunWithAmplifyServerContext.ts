// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { sharedInMemoryStorage } from 'aws-amplify/utils';
import { KeyValueStorageMethodValidator } from 'aws-amplify/adapter-core/internals';
import {
	createAWSCredentialsAndIdentityIdProvider,
	createKeyValueStorageFromCookieStorageAdapter,
	createUserPoolsTokenProvider,
	runWithAmplifyServerContext as runWithAmplifyServerContextCore,
} from 'aws-amplify/adapter-core';

import { NextServer } from '../types';
import {
	DEFAULT_SERVER_SIDE_AUTH_SET_COOKIE_OPTIONS,
	ENFORCED_SERVER_SIDE_AUTH_SET_COOKIE_OPTIONS,
} from '../auth/constant';

import { createCookieStorageAdapterFromNextServerContext } from './createCookieStorageAdapterFromNextServerContext';

export const createRunWithAmplifyServerContext = ({
	config: resourcesConfig,
	tokenValidator,
	globalSettings,
}: {
	config: ResourcesConfig;
	tokenValidator?: KeyValueStorageMethodValidator;
	globalSettings: NextServer.GlobalSettings;
}) => {
	const isServerSideAuthEnabled = globalSettings.isServerSideAuthEnabled();
	const isSSLOrigin = globalSettings.isSSLOrigin();
	const setCookieOptions = globalSettings.getRuntimeOptions().cookies ?? {};

	const mergedSetCookieOptions = {
		// default options when not specified
		...(isServerSideAuthEnabled && DEFAULT_SERVER_SIDE_AUTH_SET_COOKIE_OPTIONS),
		// user-specified options
		...setCookieOptions,
		// enforced options when server-side auth is enabled
		...(isServerSideAuthEnabled && {
			...ENFORCED_SERVER_SIDE_AUTH_SET_COOKIE_OPTIONS,
			secure: isSSLOrigin,
		}),
		// only support root path
		path: '/',
	};

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
									isServerSideAuthEnabled,
								),
								tokenValidator,
								mergedSetCookieOptions,
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
