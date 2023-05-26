import { StorageCopySource, StorageCopyDestination } from './Storage';
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export interface StorageProvider {
	// you need to implement those methods

	// cancel an in-flight request
	cancel?(request: Promise<any>): void;

	// copy object from src to dest
	copy?(
		src: StorageCopySource,
		dest: StorageCopyDestination,
		config?
	): Promise<any>;

	// configure your provider
	configure(config: object): object;

	// get object/pre-signed url from storage
	get(key: string, options?): Promise<string | Object>;

	// upload storage object
	put(key: string, object, options?): Promise<Object> | UploadTask;

	// remove object
	remove(key: string, options?): Promise<any>;

	// list objects for the path
	list(path, options?): Promise<any>;

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
		config?
	): Promise<any>;
}

export type StorageProviderApi = 'copy' | 'get' | 'put' | 'remove' | 'list';
