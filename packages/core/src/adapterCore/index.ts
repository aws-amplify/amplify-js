// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { CookieStorage, KeyValueStorageMethodValidator } from './serverContext';

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
