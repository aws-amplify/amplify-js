// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { CookieStorage, KeyValueStorageMethodValidator } from './serverContext';

// Deprecated registry-backed server-context shims, restored at their original
// specifier solely so OLD published `@aws-amplify/adapter-nextjs` versions
// (≤ 1.7.3) keep working against this version of the libraries. Removed in the
// next major version. See `serverContext/legacyServerContext.ts`.
export {
	createAmplifyServerContext,
	getAmplifyServerContext,
	destroyAmplifyServerContext,
	LegacyAmplifyServerContext,
	LegacyBridgedAmplify,
} from './serverContext';

// Retained (deprecated) for backwards compatibility of existing error
// re-export / catch paths. The legacy server-context machinery has been
// removed in favor of the singleton-free AmplifyContext model.
export { AmplifyServerContextError } from '../errors/AmplifyServerContextError';

/**
 * @deprecated Use {@link AmplifyContext} instead. Provided as a migration alias
 * for downstream type-only imports that previously referenced the legacy
 * server-context `ContextSpec`. The registry semantics no longer exist.
 */
export type { AmplifyContext as ContextSpec } from '../context/AmplifyContext';

// Backwards-compat namespace for the removed server-context types
// (`AmplifyServer.ContextSpec` / `Context` / `ContextToken` /
// `RunOperationWithContext`), mirroring `aws-amplify/adapter-core`.
export { AmplifyServer } from './AmplifyServer';
