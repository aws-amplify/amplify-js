// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthSession, AuthTokens, FetchAuthSessionOptions } from './Auth/types';
import { LibraryOptions, ResourcesConfig } from './types';

/**
 * The context object returned by `configure()`. Pass this as the first argument
 * to every Amplify category API to provide configuration and auth credentials
 * without relying on global singleton state.
 */
export interface AmplifyContext {
	readonly resourcesConfig: Readonly<ResourcesConfig>;
	readonly libraryOptions: Readonly<LibraryOptions>;

	fetchAuthSession(options?: FetchAuthSessionOptions): Promise<AuthSession>;

	clearCredentials(): Promise<void>;

	getTokens(options: FetchAuthSessionOptions): Promise<AuthTokens | undefined>;
}
