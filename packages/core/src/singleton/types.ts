// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	APIConfig,
	APIGraphQLConfig,
	LibraryAPIGraphQLOptions,
} from './API/types';
import { AnalyticsConfig } from './Analytics/types';
import {
	AuthConfig,
	LibraryAuthOptions,
	AuthUserPoolConfig,
	AuthIdentityPoolConfig,
	AuthUserPoolAndIdentityPoolConfig,
	GetCredentialsOptions,
	CognitoIdentityPoolConfig,
} from './Auth/types';
import {
	LibraryStorageOptions,
	StorageAccessLevel,
	StorageConfig,
} from './Storage/types';

// TODO V6: API types??
export type ResourcesConfig = {
	API?: APIConfig;
	Analytics?: AnalyticsConfig;
	Auth?: AuthConfig;
	// Cache?: CacheConfig;
	// DataStore?: {};
	// I18n?: I18nOptions;
	// Interactions?: {};
	// Notifications?: {};
	// Predictions?: {};
	Storage?: StorageConfig;
	ssr?: boolean;
};

export type LibraryOptions = {
	APIGraphQL?: LibraryAPIGraphQLOptions;
	Auth?: LibraryAuthOptions;
	Storage?: LibraryStorageOptions;
};

export {
	APIGraphQLConfig,
	AuthConfig,
	AuthUserPoolConfig,
	AuthIdentityPoolConfig,
	AuthUserPoolAndIdentityPoolConfig,
	GetCredentialsOptions,
	StorageAccessLevel,
	StorageConfig,
	AnalyticsConfig,
	CognitoIdentityPoolConfig,
};
