// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsConfig } from './Analytics/types';
import {
	AuthConfig,
	LibraryAuthOptions,
	UserPoolConfig,
	IdentityPoolConfig,
	UserPoolConfigAndIdentityPoolConfig,
	GetCredentialsOptions,
} from './Auth/types';
import {
	LibraryStorageOptions,
	StorageAccessLevel,
	StorageConfig,
} from './Storage/types';
import { CacheConfig } from '../Cache/types';
import { I18nOptions } from '../I18n/types';

export type ResourcesConfig = {
	//	API?: {};
	Analytics?: AnalyticsConfig;
	Auth?: AuthConfig;
	Cache?: CacheConfig;
	//	DataStore?: {};
	I18n?: I18nOptions;
	//	Interactions?: {};
	//	Notifications?: {};
	//	Predictions?: {};
	Storage?: StorageConfig;
	ssr?: boolean;
};

export type LibraryOptions = {
	Auth?: LibraryAuthOptions;
	Storage?: LibraryStorageOptions;
};

export {
	AuthConfig,
	UserPoolConfig,
	IdentityPoolConfig,
	UserPoolConfigAndIdentityPoolConfig,
	GetCredentialsOptions,
	StorageAccessLevel,
	StorageConfig,
};
