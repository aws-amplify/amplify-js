// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
This file maps top-level exports from `@aws-amplify/core`. These are intended to be potentially customer-facing exports.
*/
// TODO(v6) Swap out entirely with the new Singleton
export { Amplify } from './Amplify';
export { AmplifyClass } from './Amplify';
export { Credentials, CredentialsClass } from './Credentials';
export { ICredentials } from './types';
export { Signer } from './Signer';
export { parseAWSExports } from './parseAWSExports';

// Singleton exports
export {
	TokenProvider,
	AuthTokens,
	FetchAuthSessionOptions,
	AWSCredentialsAndIdentityIdProvider,
	AWSCredentialsAndIdentityId,
	Identity,
} from './singleton/Auth/types';
export {
	AuthConfig,
	UserPoolConfig,
	UserPoolConfigAndIdentityPoolConfig,
	StorageAccessLevel,
	StorageConfig,
	GetCredentialsOptions,
} from './singleton/types';
export { AmplifyV6, fetchAuthSession } from './singleton';
export { LibraryOptions, ResourcesConfig } from './singleton/types';

// AWSClients exports
export {
	getCredentialsForIdentity,
	getId,
	GetCredentialsForIdentityInput,
	GetCredentialsForIdentityOutput,
} from './AwsClients/CognitoIdentity';

// Storage helpers
export {
	StorageHelper,
	MemoryStorage,
	LocalStorage,
	CookieStorage,
	SessionStorage,
	MemoryKeyValueStorage,
} from './StorageHelper';
export { KeyValueStorageInterface } from './types';
export { UniversalStorage } from './UniversalStorage';

// Cache exports
import { BrowserStorageCache } from './Cache/BrowserStorageCache';
export { InMemoryCache } from './Cache/InMemoryCache';
export { CacheConfig } from './Cache/types';
export { BrowserStorageCache };
export { BrowserStorageCache as Cache }; // Maintain interoperability with React Native

// Hub exports
export { Hub, HubCapsule, HubCallback, HubPayload } from './Hub/Hub';

// Internationalization utilities
export { I18n } from './I18n';
