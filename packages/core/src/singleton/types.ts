// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIConfig, LibraryAPIOptions } from './API/types';
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
import { GeoConfig } from './Geo/types';
import { PredictionsConfig } from './Predictions/types';
import {
	LibraryStorageOptions,
	StorageAccessLevel,
	StorageConfig,
} from './Storage/types';
import { I18nConfig } from '../I18n/types';

export type LegacyConfig = {
	/**
	 * @deprecated The field should not be used.
	 */
	aws_project_region?: string;
};

export type ResourcesConfig = {
	API?: APIConfig;
	Analytics?: AnalyticsConfig;
	Auth?: AuthConfig;
	// Cache?: CacheConfig;
	// DataStore?: {};
	I18n?: I18nConfig;
	// Interactions?: {};
	// Notifications?: {};
	Predictions?: PredictionsConfig;
	Storage?: StorageConfig;
	Geo?: GeoConfig;
};

export type LibraryOptions = {
	API?: LibraryAPIOptions;
	Auth?: LibraryAuthOptions;
	Storage?: LibraryStorageOptions;
	ssr?: boolean;
};

export {
	APIConfig,
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
	GeoConfig,
};
