// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, isAmplifyContext } from '@aws-amplify/core';
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
	// Already a branded AmplifyContext (e.g. a directly-supplied context) — use as-is.
	// Use the runtime brand check rather than a structural `'resourcesConfig' in x`
	// probe: `AmplifyClass` also has a `resourcesConfig` field, so the structural
	// probe would misclassify a server ContextSpec's underlying `AmplifyClass`.
	if (isAmplifyContext(ctxOrContextSpec)) {
		return ctxOrContextSpec;
	}

	// Legacy server ContextSpec: unwrap the `AmplifyClass` and adapt it to the
	// `AmplifyContext` shape. `AmplifyClass` exposes resourcesConfig/libraryOptions
	// and a cross-category `Auth` utility, but NOT the top-level context methods
	// (fetchAuthSession/clearCredentials/getTokens), so bridge them to `Auth.*` here.
	const { amplify } = getAmplifyServerContext(ctxOrContextSpec);

	// Annotate the object so the bridged lambdas receive contextual parameter
	// types (avoids implicit-any) and the shape is checked against AmplifyContext.
	const resolved: AmplifyContext = {
		resourcesConfig: amplify.getConfig(),
		libraryOptions: amplify.libraryOptions,
		fetchAuthSession: options => amplify.Auth.fetchAuthSession(options ?? {}),
		clearCredentials: () => amplify.Auth.clearCredentials(),
		getTokens: options => amplify.Auth.getTokens(options),
	};

	return resolved;
};
