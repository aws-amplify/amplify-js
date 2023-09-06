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
	CognitoIdentityPoolConfig,
} from './Auth/types';
import { PredictionsConfig } from './Predictions/types';
import {
	LibraryStorageOptions,
	StorageAccessLevel,
	StorageConfig,
} from './Storage/types';

export type ResourcesConfig = {
	// API?: {};
	Analytics?: AnalyticsConfig;
	Auth?: AuthConfig;
	// Cache?: CacheConfig;
	// DataStore?: {};
	// I18n?: I18nOptions;
	// Interactions?: {};
	// Notifications?: {};
	predictions?: PredictionsConfig;
	Storage?: StorageConfig;
	ssr?: boolean;
};

export type LibraryOptions = {
	Auth?: LibraryAuthOptions;
	Storage?: LibraryStorageOptions;
};

export {
	AuthConfig,
	AuthUserPoolConfig,
	AuthIdentityPoolConfig,
	AuthUserPoolAndIdentityPoolConfig,
	GetCredentialsOptions,
	PredictionsConfig,
	StorageAccessLevel,
	StorageConfig,
	AnalyticsConfig,
	CognitoIdentityPoolConfig,
};
