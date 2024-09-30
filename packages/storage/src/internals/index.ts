// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { LocationCredentialsProvider } from '../providers/s3/types/options';
export { StorageSubpathStrategy } from '../types/options';

export { Permission } from './types/common';

/*
Internal APIs
*/
export {
	GetDataAccessInput,
	ListCallerAccessGrantsInput,
} from './types/inputs';
export {
	GetDataAccessOutput,
	ListCallerAccessGrantsOutput,
} from './types/outputs';

export { getDataAccess } from './apis/getDataAccess';
export { listCallerAccessGrants } from './apis/listCallerAccessGrants';

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
export { AWSTemporaryCredentials } from '../providers/s3/types/options';
