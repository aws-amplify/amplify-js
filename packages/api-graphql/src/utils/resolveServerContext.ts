// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyClassV6,
	AmplifyContext,
	isAmplifyContext,
} from '@aws-amplify/core';
import { ContextSpec } from '@aws-amplify/core/internals/adapter-core';

import { bridgeAmplifyClass } from './bridgeAmplifyClass';

/**
 * Resolves a server-side argument that may be either the new {@link AmplifyContext}
 * or a legacy {@link ContextSpec} (now a deprecated alias for `AmplifyContext`),
 * into a concrete `AmplifyContext`.
 *
 * The legacy server-context registry has been removed (Phase C1); the full
 * server-wrapper collapse lands in Phase C4. Until then this shim still accepts
 * a bare {@link AmplifyClassV6} instance and adapts it via the shared bridge.
 */
export const resolveServerContext = (
	ctxOrContextSpec: AmplifyContext | ContextSpec | AmplifyClassV6,
): AmplifyContext => {
	// Already a branded AmplifyContext (e.g. a directly-supplied context) — use as-is.
	if (isAmplifyContext(ctxOrContextSpec)) {
		return ctxOrContextSpec;
	}

	// A bare `AmplifyClass` (legacy singleton) — adapt it to the `AmplifyContext`
	// shape via the shared bridge helper.
	return bridgeAmplifyClass(ctxOrContextSpec);
};
