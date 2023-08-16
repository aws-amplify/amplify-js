// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageCopySource,
	StorageCopyDestination,
	StorageCopyConfig,
} from './Storage';

// CAUTION: The StorageProvider interface is publicly available and allows customers to implement their own custom
// storage providers. Exercise caution when modifying this class as additive changes to this interface can break
// customers when not marked as optional.
export interface StorageProvider {
	// you need to implement those methods

	// cancel an in-flight request
	cancel?(request: Promise<any>): void;

	// copy object from src to dest
	copy?(
		src: StorageCopySource,
		dest: StorageCopyDestination,
		config?,
		userAgentValue?: string
	): Promise<any>;

	// configure your provider
	configure(config: object): object;

	// get object/pre-signed url from storage
	get(key: string, options?, userAgentValue?: string): Promise<string | Object>;

	// get properties of object
	getProperties?(
		key: string,
		options?,
		userAgentValue?: string
	): Promise<Object>;

	// upload storage object
	put(
		key: string,
		object,
		options?,
		userAgentValue?: string
	): Promise<Object> | UploadTask;

	// remove object
	remove(key: string, options?, userAgentValue?: string): Promise<any>;

	// list objects for the path
	list(path, options?, userAgentValue?: string): Promise<any>;

	// return 'Storage';
	getCategory(): string;

	// return the name of you provider
	getProviderName(): string;
}

export interface UploadTask {
	resume(): any;
	pause(): any;
	percent: number;
	isInProgress: boolean;
}

export interface StorageProviderWithCopy extends StorageProvider {
	// copy object from src to dest
	copy(
		src: StorageCopySource,
		dest: StorageCopyDestination,
		config?,
		userAgentValue?: string
	): Promise<any>;
}

export interface StorageProviderWithGetProperties extends StorageProvider {
	getProperties(
		key: string,
		options?,
		userAgentValue?: string
	): Promise<Object>;
}

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
