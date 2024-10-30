// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { StorageSubpathStrategy } from '../types/options';

export { Permission, LocationType, StorageAccess } from './types/common';

/*
Internal APIs
*/
export {
	GetDataAccessInput,
	ListCallerAccessGrantsInput,
	GetPropertiesInput,
	GetUrlInput,
	CopyInput,
	ListInput,
	ListAllInput,
	ListPaginateInput,
	RemoveInput,
	UploadDataInput,
	DownloadDataInput,
} from './types/inputs';
export {
	GetDataAccessOutput,
	ListCallerAccessGrantsOutput,
	GetPropertiesOutput,
	GetUrlOutput,
	RemoveOutput,
	UploadDataOutput,
	DownloadDataOutput,
	ListOutput,
	CopyOutput,
} from './types/outputs';

export { getDataAccess } from './apis/getDataAccess';
export { listCallerAccessGrants } from './apis/listCallerAccessGrants';
export { list } from './apis/list';
export { getProperties } from './apis/getProperties';
export { getUrl } from './apis/getUrl';
export { remove } from './apis/remove';
export { uploadData } from './apis/uploadData';
export { downloadData } from './apis/downloadData';
export { copy } from './apis/copy';

/** Default Auth exports */
export { listPaths } from './apis/listPaths';

/*
CredentialsStore exports
*/
export {
	CredentialsLocation,
	ListLocations,
	LocationAccess,
	LocationCredentials,
	ListLocationsInput,
	ListLocationsOutput,
	CredentialsProvider,
	ListPathsOutput,
} from './types/credentials';

export {
	AWSTemporaryCredentials,
	LocationCredentialsProvider,
} from '../providers/s3/types/options';

/**
 * Internal util functions
 */
export { assertValidationError } from '../errors/utils/assertValidationError';

/**
 * Utility types
 */
export {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../errors/types/validation';
