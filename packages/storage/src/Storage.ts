// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';
import { AWSS3Provider } from './providers';
import {
	StorageCopySource,
	StorageCopyDestination,
	StorageGetConfig,
	StorageProvider,
	StoragePutConfig,
	StorageRemoveConfig,
	StorageListConfig,
	StorageCopyConfig,
	StorageProviderWithCopy,
	StorageGetOutput,
	StoragePutOutput,
	StorageRemoveOutput,
	StorageListOutput,
	StorageCopyOutput,
	UploadTask,
	StorageGetPropertiesConfig,
	StorageGetPropertiesOutput,
} from './types';
import { PutObjectInput } from './AwsClients/S3';
import { InternalStorageClass } from './internals/InternalStorage';

const logger = new Logger('StorageClass');
const loggerStorageInstance = new Logger('Storage'); // Logging relating to Storage instance management

const DEFAULT_PROVIDER = 'AWSS3';
/**
 * Provide storage methods to use AWS S3
 */
export class Storage extends InternalStorageClass {
	/**
	 * @public
	 */
	public vault: Storage;

	public getModuleName() {
		return 'Storage';
	}

	/**
	 * Cancels an inflight request
	 *
	 * @param request - The request to cancel
	 * @param [message] - A message to include in the cancelation exception
	 */
	public cancel(request: UploadTask, message?: string): Promise<boolean>;
	public cancel(request: Promise<any>, message?: string): void;
	public cancel(
		request: Promise<any> | UploadTask,
		message?: string
	): void | Promise<boolean> {
		return super.cancel(request, message);
	}

	/**
	 * Copies a file from src to dest.
	 *
	 * @param src - The source object.
	 * @param dest - The destination object.
	 * @param [config] - config for the Storage operation.
	 * @return A promise resolves to the copied object's key.
	 */
	public copy<T extends Record<string, any>>(
		src: StorageCopySource,
		dest: StorageCopyDestination,
		config?: StorageCopyConfig<T>
	): StorageCopyOutput<T>;
	public copy<T extends StorageProviderWithCopy = AWSS3Provider>(
		src: Parameters<T['copy']>[0],
		dest: Parameters<T['copy']>[1],
		config?: StorageCopyConfig<T>
	): StorageCopyOutput<T> {
		return super.copy(src, dest, config);
	}

	/**
	 * Get a presigned URL of the file or the object data when download:true
	 *
	 * @param key - key of the object
	 * @param [config] - config for the Storage operation.
	 * @return - A promise resolves to either a presigned url or the object
	 */
	// Adding & { download?: boolean }, if not T extends { download: true } ? ... : ... will not work properly
	public get<T extends Record<string, any> & { download?: boolean }>(
		key: string,
		config?: StorageGetConfig<T>
	): StorageGetOutput<T>;
	public get<
		T extends StorageProvider | { [key: string]: any; download?: boolean }
	>(key: string, config?: StorageGetConfig<T>): StorageGetOutput<T> {
		return super.get(key, config);
	}

	public getProperties<T extends StorageProvider | { [key: string]: any }>(
		key: string,
		config?: StorageGetPropertiesConfig<T>
	): StorageGetPropertiesOutput<T> {
		return super.getProperties(key, config);
	}
	/**
	 * Put a file in storage bucket specified to configure method
	 * @param key - key of the object
	 * @param object - File to be put in bucket
	 * @param [config] - { level : private|protected|public, contentType: MIME Types,
	 *  progressCallback: function }
	 * @return - promise resolves to object on success
	 */
	public put<T extends Record<string, any>>(
		key: string,
		object: any,
		config?: StoragePutConfig<T>
	): StoragePutOutput<T>;
	public put<T extends StorageProvider = AWSS3Provider>(
		key: string,
		object: Omit<PutObjectInput['Body'], 'ReadableStream' | 'Readable'>,
		config?: StoragePutConfig<T>
	): StoragePutOutput<T> {
		return super.put(key, object, config);
	}

	/**
	 * Remove the object for specified key
	 * @param key - key of the object
	 * @param [config] - { level : private|protected|public }
	 * @return - Promise resolves upon successful removal of the object
	 */
	public remove<T extends Record<string, any>>(
		key: string,
		config?: StorageRemoveConfig<T>
	): StorageRemoveOutput<T>;
	public remove<T extends StorageProvider = AWSS3Provider>(
		key: string,
		config?: StorageRemoveConfig<T>
	): StorageRemoveOutput<T> {
		return super.remove(key, config);
	}

	/**
	 * List bucket objects relative to the level and prefix specified
	 * @param path - the path that contains objects
	 * @param [config] - { level : private|protected|public, maxKeys: NUMBER }
	 * @return - Promise resolves to list of keys for all objects in path
	 */
	public list<T extends Record<string, any>>(
		key: string,
		config?: StorageListConfig<T>
	): StorageListOutput<T>;
	public list<T extends StorageProvider = AWSS3Provider>(
		path: string,
		config?: StorageListConfig<T>
	): StorageListOutput<T> {
		return super.list(path, config);
	}
}

/**
 * Configure & register Storage singleton instance.
 */
let _instance: Storage = null;
const getInstance = () => {
	if (_instance) {
		return _instance;
	}
	loggerStorageInstance.debug('Create Storage Instance, debug');
	_instance = new Storage();
	_instance.vault = new Storage();

	const old_configure = _instance.configure;
	_instance.configure = options => {
		loggerStorageInstance.debug('storage configure called');
		const vaultConfig = { ...old_configure.call(_instance, options) };

		// set level private for each provider for the vault
		Object.keys(vaultConfig).forEach(providerName => {
			if (typeof vaultConfig[providerName] !== 'string') {
				vaultConfig[providerName] = {
					...vaultConfig[providerName],
					level: 'private',
				};
			}
		});
		loggerStorageInstance.debug('storage vault configure called');
		_instance.vault.configure(vaultConfig);
	};
	return _instance;
};

export const StorageInstance: Storage = getInstance();
Amplify.register(StorageInstance);
