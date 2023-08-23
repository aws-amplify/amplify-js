// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyServer } from './types';
import { serverContextRegistry } from './serverContextRegistry';
import { AmplifyClass } from '../../singleton';
import { LibraryOptions, ResourcesConfig } from '../../singleton/types';

/**
 * Creates an Amplify server context.
 * @param amplifyConfig The Amplify resource config.
 * @param libraryOptions The Amplify library options.
 * @returns The Amplify server context spec.
 */
export const createAmplifyServerContext = (
	amplifyConfig: ResourcesConfig,
	libraryOptions: LibraryOptions
): AmplifyServer.ContextSpec => {
	const amplify = new AmplifyClass();
	amplify.configure(amplifyConfig, libraryOptions);

	return serverContextRegistry.register({
		amplify,
	});
};

/**
 * Returns an Amplify server context.
 * @param contextSpec The context spec used to get the Amplify server context.
 * @returns The Amplify server context.
 */
export const getAmplifyServerContext = (
	contextSpec: AmplifyServer.ContextSpec
): AmplifyServer.Context => {
	const context = serverContextRegistry.get(contextSpec);

	if (context) {
		return context;
	}

	throw new Error(
		'Attempted to get the Amplify Server Context that may have been destroyed.'
	);
};

/**
 * Destroys an Amplify server context.
 * @param contextSpec The context spec used to destroy the Amplify server context.
 */
export const destroyAmplifyServerContext = (
	contextSpec: AmplifyServer.ContextSpec
): void => {
	serverContextRegistry.deregister(contextSpec);
};
