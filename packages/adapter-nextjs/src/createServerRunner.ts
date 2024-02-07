// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LibraryOptions, ResourcesConfig } from 'aws-amplify';

import { createRunWithAmplifyServerContext, getAmplifyConfig } from './utils';
import { NextServer } from './types';

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
 * @param input.libraryOptions The {@link LibraryOptions} additional options for the library.
 * @returns An object that contains the `runWithAmplifyServerContext` function.
 *
 * @example
 * import { createServerRunner } from '@aws-amplify/adapter-nextjs';
 * import config from './amplifyconfiguration.json';
 *
 * export const { runWithAmplifyServerContext } = createServerRunner({ config })
 *
 */
export const createServerRunner: NextServer.CreateServerRunner = ({
	config,
	libraryOptions,
}) => {
	const amplifyConfig = getAmplifyConfig(config);

	return {
		runWithAmplifyServerContext: createRunWithAmplifyServerContext({
			config: amplifyConfig,
			libraryOptions,
		}),
	};
};
