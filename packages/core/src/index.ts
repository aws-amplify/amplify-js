// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
This file maps top-level exports from `@aws-amplify/core`. These are intended to be potentially customer-facing exports.
*/
// Hub exports
export { Hub } from './Hub';
export { HubCapsule, HubCallback, HubPayload } from './Hub/types';

// Singleton exports
export {
	TokenProvider,
	AuthTokens,
	FetchAuthSessionOptions,
	AuthSession,
	CredentialsAndIdentityIdProvider,
	CredentialsAndIdentityId,
	Identity,
	OAuthConfig,
	CognitoUserPoolConfig,
	JWT,
	ClientMetadata,
	ClientMetadataProvider,
} from './singleton/Auth/types';
export { decodeJWT } from './singleton/Auth/utils';
export {
	AuthConfig,
	AuthUserPoolConfig,
	AuthUserPoolAndIdentityPoolConfig,
	APIConfig,
	PredictionsConfig,
	StorageAccessLevel,
	StorageConfig,
	GetCredentialsOptions,
	ResourcesConfig,
	LibraryOptions,
	AnalyticsConfig,
	GeoConfig,
} from './singleton/types';
export {
	Amplify,
	AmplifyClass as AmplifyClassV6,
	fetchAuthSession,
	clearCredentials,
} from './singleton';

// AmplifyContext — the singleton-free contract for category APIs
export { AmplifyContext, AmplifyContextToken } from './context/AmplifyContext';

// Context factory — create a local, branded AmplifyContext without touching
// the global singleton state.
export { createAmplifyContext } from './context/createAmplifyContext';

// Context branding — runtime identification of AmplifyContext objects
export {
	isAmplifyContext,
	AMPLIFY_CONTEXT_BRAND,
} from './context/contextBrand';

// Per-context identity token — attached by every context producer
export { createAmplifyContextToken } from './context/contextToken';

// Global context management
export { getGlobalContext, hasGlobalContext } from './context/globalContext';

// Configuration Builder
export { createConfigurationBuilder } from './configurationBuilder';
export type {
	ConfigurationBuilder,
	CreateConfigurationBuilderOptions,
} from './configurationBuilder';

// Cognito Identity service client factories
export {
	createGetCredentialsForIdentityClient,
	createGetIdClient,
	cognitoIdentityPoolEndpointResolver,
	GetCredentialsForIdentityInput,
	GetCredentialsForIdentityOutput,
} from './foundation/factories/serviceClients/cognitoIdentity';

// Amplify-wide constructs
export { UserProfile } from './types';

// Storage helpers
export {
	CookieStorage,
	defaultStorage,
	sessionStorage,
	syncSessionStorage,
	sharedInMemoryStorage,
} from './storage';
export { KeyValueStorageInterface } from './types';

// Cache exports
export { Cache } from './Cache';
export { CacheConfig } from './Cache/types';

// Internationalization utilities
export { I18n } from './I18n';

// Logging utilities
export { ConsoleLogger } from './Logger';

// Service worker
export {
	ServiceWorker,
	ServiceWorkerOptions,
	ServiceWorkerStateChangeHandler,
} from './ServiceWorker';
