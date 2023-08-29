// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsConfig } from './Analytics/types';
import {
	AuthConfig,
	LibraryAuthOptions,
	AuthUserPoolConfig,
	AuthIdentityPoolConfig,
	AuthUserPoolAndIdentityPoolConfig,
	GetCredentialsOptions,
} from './Auth/types';
import {
	LibraryStorageOptions,
	StorageAccessLevel,
	StorageConfig,
} from './Storage/types';
import { I18nOptions } from '../I18n/types';

export type ResourcesConfig = {
	// API?: {};
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
	Auth?: LibraryAuthOptions;
	Storage?: LibraryStorageOptions;
};

export {
	AuthConfig,
	AuthUserPoolConfig as UserPoolConfig,
	AuthIdentityPoolConfig as IdentityPoolConfig,
	AuthUserPoolAndIdentityPoolConfig as UserPoolConfigAndIdentityPoolConfig,
	GetCredentialsOptions,
	StorageAccessLevel,
	StorageConfig,
	AnalyticsConfig,
};
