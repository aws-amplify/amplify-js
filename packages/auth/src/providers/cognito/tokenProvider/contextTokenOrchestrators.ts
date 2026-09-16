// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AuthTokenOrchestrator } from './types';

/**
 * Maps a per-context token provider object to its write-capable orchestrator.
 * Weak keys so entries are GC'd with the context/provider. Internal only.
 */
const contextTokenOrchestrators = new WeakMap<object, AuthTokenOrchestrator>();

export const registerContextTokenOrchestrator = (
	provider: object,
	orchestrator: AuthTokenOrchestrator,
): void => {
	contextTokenOrchestrators.set(provider, orchestrator);
};

export const getContextTokenOrchestrator = (
	provider?: object,
): AuthTokenOrchestrator | undefined =>
	provider ? contextTokenOrchestrators.get(provider) : undefined;
