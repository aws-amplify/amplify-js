// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClass } from '../../singleton';
import { LibraryOptions, ResourcesConfig } from '../../singleton/types';
import { AmplifyServerContextError } from '../error';

import { serverContextRegistry } from './serverContextRegistry';
import { AmplifyServer } from './types';

/**
 * Creates an Amplify server context.
 * @param amplifyConfig The Amplify resource config.
 * @param libraryOptions The Amplify library options.
 * @returns The Amplify server context spec.
 */
export const createAmplifyServerContext = (
	amplifyConfig: ResourcesConfig,
	libraryOptions: LibraryOptions,
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
	contextSpec: AmplifyServer.ContextSpec,
): AmplifyServer.Context => {
	assertContextSpec(contextSpec);
	const context = serverContextRegistry.get(contextSpec);

	if (context) {
		return context;
	}

	throw new AmplifyServerContextError({
		message:
			'Attempted to get the Amplify Server Context that may have been destroyed.',
		recoverySuggestion:
			'Ensure always call Amplify APIs within `runWithAmplifyServerContext` function, and do not attempt to reuse `contextSpec` object.',
	});
};

/**
 * Destroys an Amplify server context.
 * @param contextSpec The context spec used to destroy the Amplify server context.
 */
export const destroyAmplifyServerContext = (
	contextSpec: AmplifyServer.ContextSpec,
): void => {
	serverContextRegistry.deregister(contextSpec);
};

const assertContextSpec = (contextSpec: AmplifyServer.ContextSpec) => {
	let invalid = false;

	if (!Object.prototype.hasOwnProperty.call(contextSpec, 'token')) {
		invalid = true;
	} else if (
		!Object.prototype.hasOwnProperty.call(contextSpec.token, 'value')
	) {
		invalid = true;
	} else if (
		Object.prototype.toString.call(contextSpec.token.value) !==
		'[object Symbol]'
	) {
		invalid = true;
	}

	if (invalid) {
		throw new AmplifyServerContextError({
			message: 'Invalid `contextSpec`.',
			recoverySuggestion:
				'Ensure to use the `contextSpec` object injected by `runWithAmplifyServerContext` function.',
		});
	}
};
