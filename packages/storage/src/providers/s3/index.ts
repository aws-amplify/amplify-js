// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	uploadData,
	downloadData,
	remove,
	list,
	getProperties,
	copy,
	getUrl,
	removeObjects,
} from './apis';

export {
	UploadDataInput,
	UploadDataWithPathInput,
	DownloadDataInput,
	DownloadDataWithPathInput,
	RemoveInput,
	RemoveWithPathInput,
	RemoveObjectsInput,
	ListAllInput,
	ListAllWithPathInput,
	ListPaginateInput,
	ListPaginateWithPathInput,
	GetPropertiesInput,
	GetPropertiesWithPathInput,
	CopyInput,
	CopyWithPathInput,
	GetUrlInput,
	GetUrlWithPathInput,
} from './types/inputs';

export {
	UploadDataOutput,
	UploadDataWithPathOutput,
	DownloadDataOutput,
	DownloadDataWithPathOutput,
	RemoveOutput,
	RemoveWithPathOutput,
	RemoveObjectsOutput,
	ListAllOutput,
	ListAllWithPathOutput,
	ListPaginateOutput,
	ListPaginateWithPathOutput,
	GetPropertiesOutput,
	GetPropertiesWithPathOutput,
	CopyOutput,
	CopyWithPathOutput,
	GetUrlOutput,
	GetUrlWithPathOutput,
} from './types/outputs';

export { DEFAULT_PART_SIZE } from './utils/constants';
