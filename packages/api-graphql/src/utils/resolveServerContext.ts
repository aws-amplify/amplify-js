// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, isAmplifyContext } from '@aws-amplify/core';
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import { bridgeAmplifyClass } from './bridgeAmplifyClass';

/**
 * Resolves a server-side argument that may be either the new {@link AmplifyContext}
 * or a legacy {@link AmplifyServer.ContextSpec}, into a concrete `AmplifyContext`.
 */
export const resolveServerContext = (
	ctxOrContextSpec: AmplifyContext | AmplifyServer.ContextSpec,
): AmplifyContext => {
	// Already a branded AmplifyContext (e.g. a directly-supplied context) — use as-is.
	if (isAmplifyContext(ctxOrContextSpec)) {
		return ctxOrContextSpec;
	}

	// Legacy server ContextSpec: unwrap the `AmplifyClass` and adapt it to the
	// `AmplifyContext` shape via the shared bridge helper.
	const { amplify } = getAmplifyServerContext(ctxOrContextSpec);

	return bridgeAmplifyClass(amplify);
};
