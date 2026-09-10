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
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
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

	// get properties of object
	getProperties?(key: string, options?): Promise<Object>;

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

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface UploadTask {
	resume(): any;
	pause(): any;
	percent: number;
	isInProgress: boolean;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface StorageProviderWithCopy extends StorageProvider {
	// copy object from src to dest
	copy(
		src: StorageCopySource,
		dest: StorageCopyDestination,
		config?
	): Promise<any>;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface StorageProviderWithGetProperties extends StorageProvider {
	getProperties(key: string, options?): Promise<Object>;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type StorageProviderApi =
	| 'copy'
	| 'get'
	| 'put'
	| 'remove'
	| 'list'
	| 'getProperties';
