// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	AWSTemporaryCredentials,
	LocationCredentialsProvider,
} from './types/credentials';
export { StorageSubpathStrategy } from '../types/options';

export { Permission } from './types/common';

/*
Internal APIs
*/
export {
	GetDataAccessInput,
	ListCallerAccessGrantsInput,
	GetPropertiesInput,
} from './types/inputs';
export {
	GetDataAccessOutput,
	ListCallerAccessGrantsOutput,
	GetPropertiesOutput,
} from './types/outputs';

export { getDataAccess } from './apis/getDataAccess';
export { listCallerAccessGrants } from './apis/listCallerAccessGrants';
export { getProperties } from './apis/getProperties';

/*
CredentialsStore exports
*/
export { createLocationCredentialsStore } from './locationCredentialsStore';
export {
	AuthConfigAdapter,
	createManagedAuthConfigAdapter,
	CreateManagedAuthConfigAdapterInput,
} from './managedAuthConfigAdapter';
export {
	GetLocationCredentials,
	ListLocations,
	LocationCredentialsStore,
	CreateLocationCredentialsStoreInput,
	LocationCredentials,
	ListLocationsInput,
	ListLocationsOutput,
	GetLocationCredentialsInput,
	GetLocationCredentialsOutput,
} from './types/credentials';
