// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageDownloadDataOutput,
	StorageGetUrlOutput,
	StorageItem,
	StorageListOutput,
	DownloadTask,
	UploadTask,
} from '../../../types';

export interface Item extends StorageItem {
	/**
	 * VersionId used to reference a specific version of the object.
	 */
	versionId?: string;
	/**
	 * A standard MIME type describing the format of the object data.
	 */
	contentType?: string;
}

export type DownloadDataOutput = DownloadTask<StorageDownloadDataOutput<Item>>;

export type GetUrlOutput = StorageGetUrlOutput;

export type UploadDataOutput = UploadTask<Item>;

export type GetPropertiesOutput = Item;

export type ListOutputItem = Omit<StorageItem, 'metadata'>;

export type ListAllOutput = StorageListOutput<ListOutputItem>;

export type ListPaginateOutput = StorageListOutput<ListOutputItem> & {
	nextToken?: string;
};

// TODO: expose more properties if required
export type CopyOutput = Pick<Item, 'key'>;
export type RemoveOutput = Pick<Item, 'key'>;
