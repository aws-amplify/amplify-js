// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIConfig, LibraryAPIOptions } from './API/types';
import { AnalyticsConfig } from './Analytics/types';
import {
	AuthConfig,
	AuthIdentityPoolConfig,
	AuthUserPoolAndIdentityPoolConfig,
	AuthUserPoolConfig,
	CognitoIdentityPoolConfig,
	GetCredentialsOptions,
	LibraryAuthOptions,
} from './Auth/types';
import { GeoConfig } from './Geo/types';
import { PredictionsConfig } from './Predictions/types';
import {
	LibraryStorageOptions,
	StorageAccessLevel,
	StorageConfig,
} from './Storage/types';
import { NotificationsConfig } from './Notifications/types';
import { InteractionsConfig } from './Interactions/types';

export interface LegacyConfig {
	/**
	 * @deprecated The field should not be used.
	 */
	aws_project_region?: string;
}

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
	U[keyof U];

export interface ResourcesConfig {
	API?: APIConfig;
	Analytics?: AnalyticsConfig;
	Auth?: AuthConfig;
	Interactions?: InteractionsConfig;
	Notifications?: NotificationsConfig;
	Predictions?: PredictionsConfig;
	Storage?: StorageConfig;
	Geo?: GeoConfig;
}

export interface LibraryOptions {
	API?: LibraryAPIOptions;
	Auth?: LibraryAuthOptions;
	Storage?: LibraryStorageOptions;
	ssr?: boolean;
}

export {
	APIConfig,
	AuthConfig,
	AuthUserPoolConfig,
	AuthIdentityPoolConfig,
	AuthUserPoolAndIdentityPoolConfig,
	GetCredentialsOptions,
	InteractionsConfig,
	PredictionsConfig,
	StorageAccessLevel,
	StorageConfig,
	AnalyticsConfig,
	CognitoIdentityPoolConfig,
	GeoConfig,
};
