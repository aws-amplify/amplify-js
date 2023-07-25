// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify,
	CustomUserAgentDetails,
	ConsoleLogger as Logger,
	parseAWSExports,
	StorageAction,
} from '@aws-amplify/core';
import { AWSS3Provider } from '../providers';
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
} from '../types';
import { PutObjectInput } from '../AwsClients/S3';
import { isCancelError } from '../AwsClients/S3/utils';
import { AWSS3UploadTask } from '../providers/AWSS3UploadTask';
import { getStorageUserAgentValue } from '../common/StorageUtils';

const logger = new Logger('StorageClass');
const loggerStorageInstance = new Logger('Storage'); // Logging relating to Storage instance management

const DEFAULT_PROVIDER = 'AWSS3';
/**
 * Provide storage methods to use AWS S3
 */
export class InternalStorageClass {
	/**
	 * @private
	 */
	private _config;
	private _pluggables: StorageProvider[];

	/**
	 * Similar to the API module. This weak map allows users to cancel their in-flight request made using the Storage
	 * module. For every get or put request, a unique AbortConttroller will be generated and injected to it's underlying
	 * Xhr HTTP handler. This map maintains a mapping of Request to AbortController. When .cancel is invoked, it will
	 * attempt to retrieve it's corresponding abortController and cancel the in-flight request.
	 */
	private _abortControllerMap: WeakMap<Promise<any>, AbortController>;

	/**
	 * Initialize Storage
	 * @param {Object} config - Configuration object for storage
	 */
	constructor() {
		this._config = {};
		this._pluggables = [];
		this._abortControllerMap = new WeakMap<Promise<any>, AbortController>();
		logger.debug('Storage Options', this._config);

		this.get = this.get.bind(this);
		this.put = this.put.bind(this);
		this.remove = this.remove.bind(this);
		this.list = this.list.bind(this);
	}

	public getModuleName() {
		return 'InternalStorage';
	}

	/**
	 * add plugin into Storage category
	 * @param {Object} pluggable - an instance of the plugin
	 */
	public addPluggable(pluggable: StorageProvider) {
		if (pluggable && pluggable.getCategory() === 'Storage') {
			this._pluggables.push(pluggable);
			let config = {};

			config = pluggable.configure(this._config[pluggable.getProviderName()]);

			return config;
		}
	}

	/**
	 * Get the plugin object
	 * @param providerName - the name of the plugin
	 */
	public getPluggable(providerName: string) {
		const pluggable = this._pluggables.find(
			pluggable => pluggable.getProviderName() === providerName
		);
		if (pluggable === undefined) {
			logger.debug('No plugin found with providerName', providerName);
			return null;
		} else return pluggable;
	}

	/**
	 * Remove the plugin object
	 * @param providerName - the name of the plugin
	 */
	public removePluggable(providerName: string) {
		this._pluggables = this._pluggables.filter(
			pluggable => pluggable.getProviderName() !== providerName
		);
		return;
	}

	/**
	 * Configure Storage
	 * @param {Object} config - Configuration object for storage
	 * @return {Object} - Current configuration
	 */
	configure(config?) {
		logger.debug('configure Storage');
		if (!config) return this._config;

		const amplifyConfig = parseAWSExports(config);

		const storageConfig = amplifyConfig.Storage ?? {};

		const defaultProviderConfigKeys = [
			'bucket',
			'region',
			'level',
			'track',
			'customPrefix',
			'ContentMD5',
			'serverSideEncryption',
			'SSECustomerAlgorithm',
			'SSECustomerKey',
			// TODO(AllanZhengYP): remove in V6.
			'SSECustomerKeyMD5',
			'SSEKMSKeyId',
		];

		const hasDefaultProviderConfigKeys = (config: object) =>
			Object.keys(config).find(key => defaultProviderConfigKeys.includes(key));

		if (
			hasDefaultProviderConfigKeys(storageConfig) &&
			!storageConfig[DEFAULT_PROVIDER]
		) {
			storageConfig[DEFAULT_PROVIDER] = {};
		}

		Object.entries(storageConfig).forEach(([key, value]) => {
			if (
				key &&
				defaultProviderConfigKeys.includes(key) &&
				value !== undefined
			) {
				storageConfig[DEFAULT_PROVIDER][key] = value;
				delete storageConfig[key];
			}
		});

		// only update new values for each provider
		Object.keys(storageConfig).forEach(providerName => {
			if (typeof storageConfig[providerName] !== 'string') {
				this._config[providerName] = {
					...this._config[providerName],
					...storageConfig[providerName],
				};
			}
		});

		this._pluggables.forEach(pluggable => {
			pluggable.configure(this._config[pluggable.getProviderName()]);
		});

		if (this._pluggables.length === 0) {
			this.addPluggable(new AWSS3Provider());
		}

		return this._config;
	}

	private getAbortController(): AbortController {
		return new AbortController();
	}

	private updateRequestToBeCancellable(
		request: Promise<any>,
		abortController: AbortController
	) {
		this._abortControllerMap.set(request, abortController);
	}

	private isUploadTask(x: unknown): x is UploadTask {
		return (
			typeof x !== 'undefined' &&
			typeof x['pause'] === 'function' &&
			typeof x['resume'] === 'function'
		);
	}

	/**
	 * Cancels an inflight request
	 *
	 * @param request - The request to cancel
	 * @param [message] - A message to include in the cancelation exception
	 */
	public cancel(
		request: Promise<any> | UploadTask,
		message?: string,
		customUserAgentDetails?: CustomUserAgentDetails
	): void | Promise<boolean> {
		if (request instanceof AWSS3UploadTask) {
			return request._cancel(
				getStorageUserAgentValue(StorageAction.Cancel, customUserAgentDetails)
			);
		}
		const abortController = this._abortControllerMap.get(
			request as Promise<any>
		);
		if (abortController) {
			// TODO: [v6] clean up the aborted promise in the weak map.
			// Not doing it yet to avoid breaking changes when users may abort a request twice.
			abortController.abort(message);
		} else {
			logger.debug('The request does not map to any cancel token');
		}
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
		config?: StorageCopyConfig<T>,
		customUserAgentDetails?: CustomUserAgentDetails
	): StorageCopyOutput<T>;
	public copy<T extends StorageProviderWithCopy = AWSS3Provider>(
		src: Parameters<T['copy']>[0],
		dest: Parameters<T['copy']>[1],
		config?: StorageCopyConfig<T>,
		customUserAgentDetails?: CustomUserAgentDetails
	): StorageCopyOutput<T> {
		const provider = config?.provider || DEFAULT_PROVIDER;
		const plugin = this._pluggables.find(
			pluggable => pluggable.getProviderName() === provider
		);
		if (plugin === undefined) {
			logger.debug('No plugin found with providerName', provider);
			return Promise.reject(
				'No plugin found in Storage for the provider'
			) as StorageCopyOutput<T>;
		}
		const abortController = this.getAbortController();
		if (typeof plugin.copy !== 'function') {
			return Promise.reject(
				`.copy is not implemented on provider ${plugin.getProviderName()}`
			) as StorageCopyOutput<T>;
		}
		const responsePromise = plugin.copy(
			src,
			dest,
			{
				...config,
				abortSignal: abortController.signal,
			},
			getStorageUserAgentValue(StorageAction.Copy, customUserAgentDetails)
		);
		this.updateRequestToBeCancellable(responsePromise, abortController);
		return responsePromise as StorageCopyOutput<T>;
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
		config?: StorageGetConfig<T>,
		customUserAgentDetails?: CustomUserAgentDetails
	): StorageGetOutput<T>;
	public get<
		T extends StorageProvider | { [key: string]: any; download?: boolean }
	>(
		key: string,
		config?: StorageGetConfig<T>,
		customUserAgentDetails?: CustomUserAgentDetails
	): StorageGetOutput<T> {
		const provider = config?.provider || DEFAULT_PROVIDER;
		const plugin = this._pluggables.find(
			pluggable => pluggable.getProviderName() === provider
		);
		if (plugin === undefined) {
			logger.debug('No plugin found with providerName', provider);
			return Promise.reject(
				'No plugin found in Storage for the provider'
			) as StorageGetOutput<T>;
		}
		const abortController = this.getAbortController();
		const responsePromise = plugin.get(
			key,
			{
				...config,
				abortSignal: abortController.signal,
			},
			getStorageUserAgentValue(StorageAction.Get, customUserAgentDetails)
		);
		this.updateRequestToBeCancellable(responsePromise, abortController);
		return responsePromise as StorageGetOutput<T>;
	}

	public isCancelError(error: any) {
		return isCancelError(error);
	}

	public getProperties<T extends StorageProvider | { [key: string]: any }>(
		key: string,
		config?: StorageGetPropertiesConfig<T>,
		customUserAgentDetails?: CustomUserAgentDetails
	): StorageGetPropertiesOutput<T> {
		const provider = config?.provider || DEFAULT_PROVIDER;
		const plugin = this._pluggables.find(
			pluggable => pluggable.getProviderName() === provider
		);
		if (plugin === undefined) {
			logger.debug('No plugin found with providerName', provider);
			throw new Error('No plugin found with providerName');
		}
		const abortController = this.getAbortController();
		if (typeof plugin.getProperties !== 'function') {
			return Promise.reject(
				`.getProperties is not implemented on provider ${plugin.getProviderName()}`
			) as StorageGetPropertiesOutput<T>;
		}

		const responsePromise = plugin?.getProperties(
			key,
			config,
			getStorageUserAgentValue(
				StorageAction.GetProperties,
				customUserAgentDetails
			)
		);
		this.updateRequestToBeCancellable(responsePromise, abortController);
		return responsePromise as StorageGetPropertiesOutput<T>;
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
		config?: StoragePutConfig<T>,
		customUserAgentDetails?: CustomUserAgentDetails
	): StoragePutOutput<T>;
	public put<T extends StorageProvider = AWSS3Provider>(
		key: string,
		object: Omit<PutObjectInput['Body'], 'ReadableStream' | 'Readable'>,
		config?: StoragePutConfig<T>,
		customUserAgentDetails?: CustomUserAgentDetails
	): StoragePutOutput<T> {
		const provider = config?.provider || DEFAULT_PROVIDER;
		const plugin = this._pluggables.find(
			pluggable => pluggable.getProviderName() === provider
		);
		if (plugin === undefined) {
			logger.debug('No plugin found with providerName', provider);
			return Promise.reject(
				'No plugin found in Storage for the provider'
			) as StoragePutOutput<T>;
		}
		const abortController = this.getAbortController();
		const response = plugin.put(
			key,
			object,
			{
				...config,
				abortSignal: abortController.signal,
			},
			getStorageUserAgentValue(StorageAction.Put, customUserAgentDetails)
		);
		if (!this.isUploadTask(response)) {
			this.updateRequestToBeCancellable(response, abortController);
		}
		return response as StoragePutOutput<T>;
	}

	/**
	 * Remove the object for specified key
	 * @param key - key of the object
	 * @param [config] - { level : private|protected|public }
	 * @return - Promise resolves upon successful removal of the object
	 */
	public remove<T extends Record<string, any>>(
		key: string,
		config?: StorageRemoveConfig<T>,
		customUserAgentDetails?: CustomUserAgentDetails
	): StorageRemoveOutput<T>;
	public remove<T extends StorageProvider = AWSS3Provider>(
		key: string,
		config?: StorageRemoveConfig<T>,
		customUserAgentDetails?: CustomUserAgentDetails
	): StorageRemoveOutput<T> {
		const provider = config?.provider || DEFAULT_PROVIDER;
		const plugin = this._pluggables.find(
			pluggable => pluggable.getProviderName() === provider
		);
		if (plugin === undefined) {
			logger.debug('No plugin found with providerName', provider);
			return Promise.reject(
				'No plugin found in Storage for the provider'
			) as StorageRemoveOutput<T>;
		}
		return plugin.remove(
			key,
			config,
			getStorageUserAgentValue(StorageAction.Remove, customUserAgentDetails)
		) as StorageRemoveOutput<T>;
	}

	/**
	 * List bucket objects relative to the level and prefix specified
	 * @param path - the path that contains objects
	 * @param [config] - { level : private|protected|public, maxKeys: NUMBER }
	 * @return - Promise resolves to list of keys for all objects in path
	 */
	public list<T extends Record<string, any>>(
		key: string,
		config?: StorageListConfig<T>,
		customUserAgentDetails?: CustomUserAgentDetails
	): StorageListOutput<T>;
	public list<T extends StorageProvider = AWSS3Provider>(
		path: string,
		config?: StorageListConfig<T>,
		customUserAgentDetails?: CustomUserAgentDetails
	): StorageListOutput<T> {
		const provider = config?.provider || DEFAULT_PROVIDER;
		const plugin = this._pluggables.find(
			pluggable => pluggable.getProviderName() === provider
		);
		if (plugin === undefined) {
			logger.debug('No plugin found with providerName', provider);
			return Promise.reject(
				'No plugin found in Storage for the provider'
			) as StorageListOutput<T>;
		}
		return plugin.list(
			path,
			config,
			getStorageUserAgentValue(StorageAction.List, customUserAgentDetails)
		) as StorageListOutput<T>;
	}
}

export const InternalStorage: InternalStorageClass = new InternalStorageClass();
Amplify.register(InternalStorage);
