// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { StorageSubpathStrategy } from '../types/options';

export { Permission } from './types/common';

/*
Internal APIs
*/
export {
	GetDataAccessInput,
	ListCallerAccessGrantsInput,
	GetPropertiesInput,
	GetUrlInput,
	CopyInput,
	ListInputWithPath,
	RemoveInput,
	DownloadDataInput,
} from './types/inputs';
export {
	GetDataAccessOutput,
	ListCallerAccessGrantsOutput,
	GetPropertiesOutput,
	GetUrlOutput,
	RemoveOutput,
	DownloadDataOutput,
} from './types/outputs';

export { getDataAccess } from './apis/getDataAccess';
export { listCallerAccessGrants } from './apis/listCallerAccessGrants';
export { list } from './apis/list';
export { getProperties } from './apis/getProperties';
export { getUrl } from './apis/getUrl';
export { remove } from './apis/remove';
export { downloadData } from './apis/downloadData';

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
