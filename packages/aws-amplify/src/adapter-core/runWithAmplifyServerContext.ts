// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';

import { configure } from '../configure';

/**
 * Creates an AmplifyContext from the given config and library options,
 * passes it directly to the operation, and returns the result.
 */
export const runWithAmplifyServerContext: AmplifyServer.RunOperationWithContext =
	async (amplifyConfig, libraryOptions, operation) => {
		const amplifyContext = configure(amplifyConfig, libraryOptions);

		return operation(amplifyContext);
	};
