// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { KeyValueStorageMethodValidator } from '@aws-amplify/core/internals/adapter-core';
import { parseAmplifyConfig } from '@aws-amplify/core/internals/utils';

import { createRunWithAmplifyServerContext } from './utils';
import { NextServer } from './types';
import { createTokenValidator } from './utils/createTokenValidator';

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
}) => {
	const amplifyConfig = parseAmplifyConfig(config);

	let tokenValidator: KeyValueStorageMethodValidator | undefined;
	if (amplifyConfig?.Auth) {
		const { Cognito } = amplifyConfig.Auth;
		tokenValidator = createTokenValidator({
			userPoolId: Cognito?.userPoolId,
			userPoolClientId: Cognito?.userPoolClientId,
		});
	}

	return {
		runWithAmplifyServerContext: createRunWithAmplifyServerContext({
			config: amplifyConfig,
			tokenValidator,
		}),
	};
};
