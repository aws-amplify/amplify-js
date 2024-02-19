// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	createAmplifyServerContext,
	destroyAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

/**
 * The low level function that supports framework specific helpers.
 * It creates an Amplify server context based on the input and runs the operation
 * with injecting the context, and finally returns the result of the operation.
 *
 * @param amplifyConfig The Amplify resource config.
 * @param libraryOptions The Amplify library options.
 * @param operation The operation to run with the server context created from
 *   `amplifyConfig` and `libraryOptions`.
 * @returns The result returned by the `operation`.
 */
export const runWithAmplifyServerContext: AmplifyServer.RunOperationWithContext =
	async (amplifyConfig, libraryOptions, operation) => {
		const contextSpec = createAmplifyServerContext(
			amplifyConfig,
			libraryOptions,
		);

		// run the operation with injecting the context
		try {
			const result = await operation(contextSpec);

			return result;
		} finally {
			// ensures destroy the context regardless whether the operation succeeded or failed
			destroyAmplifyServerContext(contextSpec);
		}
	};
