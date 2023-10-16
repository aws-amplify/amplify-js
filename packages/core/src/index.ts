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
	AWSCredentialsAndIdentityIdProvider,
	AWSCredentialsAndIdentityId,
	Identity,
	OAuthConfig,
	CognitoUserPoolConfig,
} from './singleton/Auth/types';
export {
	AuthConfig,
	AuthUserPoolConfig,
	AuthUserPoolAndIdentityPoolConfig,
	APIConfig,
	CacheConfig,
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
	fetchAuthSession,
	AmplifyClass as AmplifyClassV6,
	clearCredentials,
} from './singleton';

// AWSClients exports
export {
	getCredentialsForIdentity,
	getId,
	GetCredentialsForIdentityInput,
	GetCredentialsForIdentityOutput,
} from './awsClients/cognitoIdentity';

// Amplify-wide constructs
export { UserProfile } from './types';

// Storage helpers
export {
	CookieStorage,
	defaultStorage,
	sessionStorage,
	sharedInMemoryStorage,
} from './storage';
export { KeyValueStorageInterface } from './types';

// Cache exports
export { Cache } from './Cache';

// Internationalization utilities
export { I18n } from './I18n';

// Logging utilities
export { ConsoleLogger } from './Logger';
