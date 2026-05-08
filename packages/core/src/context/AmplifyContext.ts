// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthSession,
	AuthTokens,
	FetchAuthSessionOptions,
} from '../singleton/Auth/types';
import { LibraryOptions, ResourcesConfig } from '../singleton/types';

/**
 * The context object returned by `createAmplifyContext()`. Pass this as the first argument
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
