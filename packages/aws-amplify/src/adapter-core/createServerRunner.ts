// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	ResourcesConfig,
	sharedInMemoryStorage,
} from '@aws-amplify/core';
import {
	CookieStorage,
	KeyValueStorageMethodValidator,
} from '@aws-amplify/core/internals/adapter-core';
import { parseAmplifyConfig } from '@aws-amplify/core/internals/utils';

import { configure } from '../configure';

import {
	createAWSCredentialsAndIdentityIdProvider,
	createUserPoolsTokenProvider,
} from './authProvidersFactories/cognito';
import { createKeyValueStorageFromCookieStorageAdapter } from './storageFactories';
import { createTokenValidator } from './createTokenValidator';
import { createGlobalSettings } from './globalSettings';
import { isSSLOrigin, isValidOrigin } from './origin';

const DEFAULT_SERVER_SIDE_AUTH_SET_COOKIE_OPTIONS = {
	sameSite: 'strict' as const,
};
const ENFORCED_SERVER_SIDE_AUTH_SET_COOKIE_OPTIONS = {
	httpOnly: true,
};

export interface CreateServerRunnerInput {
	config: ResourcesConfig | Record<string, unknown>;
	runtimeOptions?: { cookies?: CookieStorage.SetCookieOptions } & Record<
		string,
		unknown
	>;
	/**
	 * Framework-specific function that creates a `CookieStorage.Adapter`
	 * from whatever server context the framework provides.
	 * Return `null` for unauthenticated / static rendering.
	 */
	createCookieStorageAdapter(
		serverContext: unknown,
	): CookieStorage.Adapter | Promise<CookieStorage.Adapter>;
}

export interface RunWithContextInput<Result> {
	serverContext: unknown | null;
	operation(ctx: AmplifyContext): Result | Promise<Result>;
}

export function createServerRunner({
	config,
	runtimeOptions,
	createCookieStorageAdapter,
}: CreateServerRunnerInput) {
	const amplifyConfig = parseAmplifyConfig(config);
	const globalSettings = createGlobalSettings();
	const amplifyAppOrigin =
		typeof process !== 'undefined'
			? process.env?.AMPLIFY_APP_ORIGIN
			: undefined;

	globalSettings.setRuntimeOptions(runtimeOptions ?? {});

	if (isValidOrigin(amplifyAppOrigin)) {
		globalSettings.setIsSSLOrigin(isSSLOrigin(amplifyAppOrigin));
		globalSettings.enableServerSideAuth();
	}

	let tokenValidator: KeyValueStorageMethodValidator | undefined;
	if (amplifyConfig?.Auth) {
		const { Cognito } = amplifyConfig.Auth;
		tokenValidator = createTokenValidator({
			userPoolId: Cognito?.userPoolId,
			userPoolClientId: Cognito?.userPoolClientId,
		});
	}

	const isServerSideAuthEnabled = globalSettings.isServerSideAuthEnabled();
	const isSSL = globalSettings.isSSLOrigin();
	const setCookieOptions =
		(runtimeOptions?.cookies as CookieStorage.SetCookieOptions) ?? {};

	const mergedSetCookieOptions: CookieStorage.SetCookieOptions = {
		...(isServerSideAuthEnabled && DEFAULT_SERVER_SIDE_AUTH_SET_COOKIE_OPTIONS),
		...setCookieOptions,
		...(isServerSideAuthEnabled && {
			...ENFORCED_SERVER_SIDE_AUTH_SET_COOKIE_OPTIONS,
			secure: isSSL,
		}),
		path: '/',
	};

	const runWithAmplifyServerContext = async <Result>(
		input: RunWithContextInput<Result>,
	): Promise<Result> => {
		const { serverContext, operation } = input;

		if (amplifyConfig.Auth) {
			const keyValueStorage =
				serverContext === null
					? sharedInMemoryStorage
					: createKeyValueStorageFromCookieStorageAdapter(
							await createCookieStorageAdapter(serverContext),
							tokenValidator,
							mergedSetCookieOptions,
						);

			const credentialsProvider = createAWSCredentialsAndIdentityIdProvider(
				amplifyConfig.Auth,
				keyValueStorage,
			);
			const tokenProvider = createUserPoolsTokenProvider(
				amplifyConfig.Auth,
				keyValueStorage,
			);

			const ctx = configure(amplifyConfig, {
				Auth: { credentialsProvider, tokenProvider },
			});

			return operation(ctx);
		}

		return operation(configure(amplifyConfig, {}));
	};

	return {
		runWithAmplifyServerContext,
		resourcesConfig: amplifyConfig,
		globalSettings,
	};
}
