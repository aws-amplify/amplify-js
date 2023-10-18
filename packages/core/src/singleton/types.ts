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
import {
	LibraryStorageOptions,
	StorageAccessLevel,
	StorageConfig,
} from './Storage/types';
import { NotificationsConfig } from './Notifications/types';

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
	// Interactions?: {};
	Notifications?: NotificationsConfig;
	// Predictions?: {};
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
	StorageAccessLevel,
	StorageConfig,
	AnalyticsConfig,
	CognitoIdentityPoolConfig,
	GeoConfig,
};
