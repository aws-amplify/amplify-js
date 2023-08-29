// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type StorageProviderApi =
	| 'copy'
	| 'get'
	| 'put'
	| 'remove'
	| 'list'
	| 'getProperties';

// Map of api to index of options (config) parameter
// Used to glean config type from StorageProvider
export type StorageProviderApiOptionsIndexMap = {
	copy: 2;
	get: 1;
	put: 2;
	remove: 1;
	list: 1;
	getProperties: 1;
};

/**
 * Permissive type for provider configuration before v6 provider class is deprecated.
 *
 * TODO[AllanZhengYP]: remove this in v6
 *
 * @internal
 */
export type ConfigType = Record<string, any>;
