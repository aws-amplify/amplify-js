// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { KeyValueStorageMethodValidator } from 'aws-amplify/adapter-core/internals';
import { parseAmplifyConfig } from 'aws-amplify/utils';

import {
	createRunWithAmplifyServerContext,
	globalRuntimeContext,
} from './utils';
import { NextServer } from './types';
import { createTokenValidator } from './utils/createTokenValidator';
import { createAuthRouteHandlersFactory } from './auth';
import { isSSLOrigin, isValidOrigin } from './auth/utils';

/**
 * Creates the `runWithAmplifyServerContext` function to run Amplify server side APIs in an isolated request context.
 *
 * @remarks
 * This function should be called only once; you can use the returned `runWithAmplifyServerContext` across
 * your codebase.
 *
 * @param input The input used to create the `runWithAmplifyServerContext` function.
 * @param input.config The {@link ResourcesConfig} imported from the `amplifyconfiguration.json` file or manually
 * created.
 * @returns An object that contains the `runWithAmplifyServerContext` function.
 *
 * @example
 * import { createServerRunner } from '@aws-amplify/adapter-nextjs';
 * import config from './amplifyconfiguration.json';
 *
 * export const { runWithAmplifyServerContext } = createServerRunner({ config })
 */
export const createServerRunner: NextServer.CreateServerRunner = ({
	config,
	runtimeOptions,
}) => {
	const amplifyConfig = parseAmplifyConfig(config);
	const amplifyAppOrigin = process.env.AMPLIFY_APP_ORIGIN;

	globalRuntimeContext.setRuntimeOptions(runtimeOptions || {});

	if (amplifyAppOrigin !== undefined && isValidOrigin(amplifyAppOrigin)) {
		globalRuntimeContext.setIsSSLOrigin(isSSLOrigin(amplifyAppOrigin));

		// update the serverSideAuthEnabled flag that exists in the closure of createServerRunner() to true
		globalRuntimeContext.enableServerSideAuth();
	}

	let tokenValidator: KeyValueStorageMethodValidator | undefined;
	if (amplifyConfig?.Auth) {
		const { Cognito } = amplifyConfig.Auth;
		tokenValidator = createTokenValidator({
			userPoolId: Cognito?.userPoolId,
			userPoolClientId: Cognito?.userPoolClientId,
		});
	}

	const runWithAmplifyServerContext = createRunWithAmplifyServerContext({
		config: amplifyConfig,
		tokenValidator,
		globalRuntimeContext,
	});

	return {
		runWithAmplifyServerContext,
		createAuthRouteHandlers: createAuthRouteHandlersFactory({
			config: amplifyConfig,
			amplifyAppOrigin,
			globalRuntimeContext,
			runWithAmplifyServerContext,
		}),
	};
};
