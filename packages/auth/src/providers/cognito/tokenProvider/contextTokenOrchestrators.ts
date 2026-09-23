// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { getContextTokenOrchestrator } from '@aws-amplify/core/internals/utils';
import type { AmplifyContext } from '@aws-amplify/core';

import { tokenOrchestrator as globalTokenOrchestrator } from './tokenProvider';
import type { TokenOrchestrator } from './TokenOrchestrator';

/**
 * Resolves the write-capable token orchestrator for the given context.
 *
 * Returns the per-context orchestrator registered for the context's token
 * provider when one exists (the `createAmplifyContext()` path), and falls back
 * to the module-level singleton for the global `Amplify.configure()` path.
 *
 * This MUST be called at the entry point of a flow (e.g. `signInWithSRP`) so
 * every step downstream — including early device-metadata reads — uses the same
 * correctly configured orchestrator. Internal only.
 */
export const resolveTokenOrchestrator = (
	ctx?: AmplifyContext,
): TokenOrchestrator =>
	getContextTokenOrchestrator<TokenOrchestrator>(
		ctx?.libraryOptions?.Auth?.tokenProvider,
	) ?? globalTokenOrchestrator;
