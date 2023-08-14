// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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

export type ResourcesConfig = {
	API?: {};
	Analytics?: {};
	Auth?: AuthConfig;
	DataStore?: {};
	Interactions?: {};
	Notifications?: {};
	Predictions?: {};
	Storage?: StorageConfig;
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
