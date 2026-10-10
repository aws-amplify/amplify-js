// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContextToken } from './AmplifyContext';

/**
 * Creates the per-context identity handle attached to every branded
 * {@link AmplifyContext} by the context producers (`createAmplifyContext`,
 * `bridgeAmplifyClass`, the singleton `configure()` path, and the testing
 * mock factory).
 *
 * Each call returns a **frozen** `{ value }` object carrying a **unique**
 * `Symbol()` — a plain (non-registry) symbol, so no two contexts ever share a
 * token. See {@link AmplifyContextToken} for why the token exists (structural
 * compatibility with `@aws-amplify/data-schema`'s `ContextSpec` duck-check);
 * runtime context identification stays on the `AMPLIFY_CONTEXT_BRAND` symbol
 * and must not involve the token.
 */
export function createAmplifyContextToken(): AmplifyContextToken {
	return Object.freeze({ value: Symbol('amplifyContextToken') });
}
