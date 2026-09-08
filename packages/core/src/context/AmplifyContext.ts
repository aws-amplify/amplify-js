// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthSession,
	AuthTokens,
	FetchAuthSessionOptions,
} from '../singleton/Auth/types';
import { LibraryOptions, ResourcesConfig } from '../singleton/types';

/**
 * The per-context identity handle carried by every branded
 * {@link AmplifyContext} (`token.value` is a unique `Symbol()` per context).
 *
 * Runtime identification of a context remains the responsibility of the
 * `AMPLIFY_CONTEXT_BRAND` symbol (see `isAmplifyContext()`); the token exists
 * primarily for compatibility with consumers that structurally duck-type the
 * legacy server `ContextSpec` shape — notably `@aws-amplify/data-schema`,
 * whose generated-client operations both *type* their first parameter as
 * `{ token: { value: symbol } }` and *runtime-check* it via
 * `typeof arg?.token?.value === 'symbol'`.
 */
export interface AmplifyContextToken {
	readonly value: symbol;
}

/**
 * The context object returned by `createAmplifyContext()`. Pass this as the first argument
 * to every Amplify category API to provide configuration and auth credentials
 * without relying on global singleton state.
 */
export interface AmplifyContext {
	readonly resourcesConfig: Readonly<ResourcesConfig>;
	readonly libraryOptions: Readonly<LibraryOptions>;

	/**
	 * Per-context identity handle; see {@link AmplifyContextToken}. All
	 * legitimate producers are the Amplify context factories, which attach a
	 * fresh, frozen token per context.
	 */
	readonly token: AmplifyContextToken;

	fetchAuthSession(options?: FetchAuthSessionOptions): Promise<AuthSession>;

	clearCredentials(): Promise<void>;

	getTokens(options: FetchAuthSessionOptions): Promise<AuthTokens | undefined>;
}
