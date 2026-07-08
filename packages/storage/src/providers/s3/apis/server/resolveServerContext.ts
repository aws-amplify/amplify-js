// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

/**
 * Resolves a server-side argument that may be either the new {@link AmplifyContext}
 * or a legacy {@link AmplifyServer.ContextSpec}, into a concrete `AmplifyContext`.
 */
export const resolveServerContext = (
	ctxOrContextSpec: AmplifyContext | AmplifyServer.ContextSpec,
): AmplifyContext => {
	const ctx =
		'resourcesConfig' in ctxOrContextSpec
			? ctxOrContextSpec
			: getAmplifyServerContext(ctxOrContextSpec).amplify;

	// `'resourcesConfig' in x` doesn't narrow the union; AmplifyClass satisfies AmplifyContext structurally.
	return ctx as AmplifyContext;
};
