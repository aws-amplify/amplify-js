/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import {
	ConsoleLogger as Logger,
	Hub,
	Credentials,
	Parser,
	getAmplifyUserAgent,
} from '@aws-amplify/core';
import {
	S3Client,
	GetObjectCommand,
	DeleteObjectCommand,
	ListObjectsCommand,
} from '@aws-sdk/client-s3';
import { formatUrl } from '@aws-sdk/util-format-url';
import { createRequest } from '@aws-sdk/util-create-request';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { StorageOptions, StorageProvider } from '../types';
import { AxiosHttpHandler } from './axios-http-handler';
import { AWSS3ProviderManagedUpload } from './AWSS3ProviderManagedUpload';
import * as events from 'events';

const logger = new Logger('AWSS3Provider');

const AMPLIFY_SYMBOL = (typeof Symbol !== 'undefined' &&
typeof Symbol.for === 'function'
	? Symbol.for('amplify_default')
	: '@@amplify_default') as Symbol;

const dispatchStorageEvent = (
	track: boolean,
	event: string,
	attrs: any,
	metrics: any,
	message: string
) => {
	if (track) {
		const data = { attrs };
		if (metrics) {
			data['metrics'] = metrics;
		}
		Hub.dispatch(
			'storage',
			{
				event,
				data,
				message,
			},
			'Storage',
			AMPLIFY_SYMBOL
		);
	}
};

const localTestingStorageEndpoint = 'http://localhost:20005';
/**
 * Provide storage methods to use AWS S3
 */
export class AWSS3Provider implements StorageProvider {
	static CATEGORY = 'Storage';
	static PROVIDER_NAME = 'AWSS3';
	/**
	 * @private
	 */
	private _config;

	/**
	 * Initialize Storage with AWS configurations
	 * @param {Object} config - Configuration object for storage
	 */
	constructor(config?: StorageOptions) {
		this._config = config ? config : {};
		logger.debug('Storage Options', this._config);
	}

	/**
	 * get the category of the plugin
	 */
	public getCategory(): string {
		return AWSS3Provider.CATEGORY;
	}

	/**
	 * get provider name of the plugin
	 */
	getProviderName(): string {
		return AWSS3Provider.PROVIDER_NAME;
	}

	/**
	 * Configure Storage part with aws configuration
	 * @param {Object} config - Configuration of the Storage
	 * @return {Object} - Current configuration
	 */
	public configure(config?): object {
		logger.debug('configure Storage', config);
		if (!config) return this._config;
		const amplifyConfig = Parser.parseMobilehubConfig(config);
		this._config = Object.assign({}, this._config, amplifyConfig.Storage);
		if (!this._config.bucket) {
			logger.debug('Do not have bucket yet');
		}
		return this._config;
	}

	/**
	 * Get a presigned URL of the file or the object data when download:true
	 *
	 * @param {string} key - key of the object
	 * @param {Object} [config] - { level : private|protected|public, download: true|false }
	 * @return - A promise resolves to Amazon S3 presigned URL on success
	 */
	public async get(key: string, config?): Promise<string | Object> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			return Promise.reject('No credentials');
		}

		const opt = Object.assign({}, this._config, config);
		const {
			bucket,
			download,
			cacheControl,
			contentDisposition,
			contentEncoding,
			contentLanguage,
			contentType,
			expires,
			track,
		} = opt;
		const prefix = this._prefix(opt);
		const final_key = prefix + key;
		const s3 = this._createNewS3Client(opt);
		logger.debug('get ' + key + ' from ' + final_key);

		const params: any = {
			Bucket: bucket,
			Key: final_key,
		};

		// See: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
		if (cacheControl) params.ResponseCacheControl = cacheControl;
		if (contentDisposition)
			params.ResponseContentDisposition = contentDisposition;
		if (contentEncoding) params.ResponseContentEncoding = contentEncoding;
		if (contentLanguage) params.ResponseContentLanguage = contentLanguage;
		if (contentType) params.ResponseContentType = contentType;

		if (download === true) {
			const getObjectCommand = new GetObjectCommand(params);
			try {
				const response = await s3.send(getObjectCommand);
				dispatchStorageEvent(
					track,
					'download',
					{ method: 'get', result: 'success' },
					{
						fileSize: Number(response.Body['size'] || response.Body['length']),
					},
					`Download success for ${key}`
				);
				return response;
			} catch (error) {
				dispatchStorageEvent(
					track,
					'download',
					{
						method: 'get',
						result: 'failed',
					},
					null,
					`Download failed with ${error.message}`
				);
				throw error;
			}
		}

		params.Expires = expires || 900; // Default is 15 mins as defined in V2 AWS SDK

		try {
			const signer = new S3RequestPresigner({ ...s3.config });
			const request = await createRequest(s3, new GetObjectCommand(params));
			const url = formatUrl(
				(await signer.presign(request, { expiresIn: params.Expires })) as any
			);
			dispatchStorageEvent(
				track,
				'getSignedUrl',
				{ method: 'get', result: 'success' },
				null,
				`Signed URL: ${url}`
			);
			return url;
		} catch (error) {
			logger.warn('get signed url error', error);
			dispatchStorageEvent(
				track,
				'getSignedUrl',
				{ method: 'get', result: 'failed' },
				null,
				`Could not get a signed URL for ${key}`
			);
			throw error;
		}
	}

	/**
	 * Put a file in S3 bucket specified to configure method
	 * @param {string} key - key of the object
	 * @param {Object} object - File to be put in Amazon S3 bucket
	 * @param {Object} [config] - { level : private|protected|public, contentType: MIME Types,
	 *  progressCallback: function }
	 * @return - promise resolves to object on success
	 */
	public async put(key: string, object, config?): Promise<Object> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			return Promise.reject('No credentials');
		}

		const opt = Object.assign({}, this._config, config);
		const { bucket, track, progressCallback } = opt;
		const {
			contentType,
			contentDisposition,
			cacheControl,
			expires,
			metadata,
			tagging,
			acl,
		} = opt;
		const {
			serverSideEncryption,
			SSECustomerAlgorithm,
			SSECustomerKey,
			SSECustomerKeyMD5,
			SSEKMSKeyId,
		} = opt;
		const type = contentType ? contentType : 'binary/octet-stream';

		const prefix = this._prefix(opt);
		const final_key = prefix + key;
		logger.debug('put ' + key + ' to ' + final_key);

		const params: any = {
			Bucket: bucket,
			Key: final_key,
			Body: object,
			ContentType: type,
		};
		if (cacheControl) {
			params.CacheControl = cacheControl;
		}
		if (contentDisposition) {
			params.ContentDisposition = contentDisposition;
		}
		if (expires) {
			params.Expires = expires;
		}
		if (metadata) {
			params.Metadata = metadata;
		}
		if (tagging) {
			params.Tagging = tagging;
		}
		if (serverSideEncryption) {
			params.ServerSideEncryption = serverSideEncryption;
			if (SSECustomerAlgorithm) {
				params.SSECustomerAlgorithm = SSECustomerAlgorithm;
			}
			if (SSECustomerKey) {
				params.SSECustomerKey = SSECustomerKey;
			}
			if (SSECustomerKeyMD5) {
				params.SSECustomerKeyMD5 = SSECustomerKeyMD5;
			}
			if (SSEKMSKeyId) {
				params.SSEKMSKeyId = SSEKMSKeyId;
			}
		}

		const emitter = new events.EventEmitter();
		const uploader = new AWSS3ProviderManagedUpload(params, opt, emitter);

		if (acl) {
			params.ACL = acl;
		}

		try {
			emitter.on('sendProgress', progress => {
				if (progressCallback) {
					if (typeof progressCallback === 'function') {
						progressCallback(progress);
					} else {
						logger.warn(
							'progressCallback should be a function, not a ' +
								typeof progressCallback
						);
					}
				}
			});

			const response = await uploader.upload();

			logger.debug('upload result', response);
			dispatchStorageEvent(
				track,
				'upload',
				{ method: 'put', result: 'success' },
				null,
				`Upload success for ${key}`
			);
			return {
				key,
			};
		} catch (error) {
			logger.warn('error uploading', error);
			dispatchStorageEvent(
				track,
				'upload',
				{ method: 'put', result: 'failed' },
				null,
				`Error uploading ${key}`
			);
			throw error;
		}
	}

	/**
	 * Remove the object for specified key
	 * @param {string} key - key of the object
	 * @param {Object} [config] - { level : private|protected|public }
	 * @return - Promise resolves upon successful removal of the object
	 */
	public async remove(key: string, config?): Promise<any> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			return Promise.reject('No credentials');
		}

		const opt = Object.assign({}, this._config, config);
		const { bucket, track } = opt;

		const prefix = this._prefix(opt);
		const final_key = prefix + key;
		const s3 = this._createNewS3Client(opt);
		logger.debug('remove ' + key + ' from ' + final_key);

		const params = {
			Bucket: bucket,
			Key: final_key,
		};

		const deleteObjectCommand = new DeleteObjectCommand(params);

		try {
			const response = await s3.send(deleteObjectCommand);
			dispatchStorageEvent(
				track,
				'delete',
				{ method: 'remove', result: 'success' },
				null,
				`Deleted ${key} successfully`
			);
			return response;
		} catch (error) {
			dispatchStorageEvent(
				track,
				'delete',
				{ method: 'remove', result: 'failed' },
				null,
				`Deletion of ${key} failed with ${error}`
			);
			throw error;
		}
	}

	/**
	 * List bucket objects relative to the level and prefix specified
	 * @param {string} path - the path that contains objects
	 * @param {Object} [config] - { level : private|protected|public }
	 * @return - Promise resolves to list of keys for all objects in path
	 */
	public async list(path, config?): Promise<any> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			return Promise.reject('No credentials');
		}

		const opt = Object.assign({}, this._config, config);
		const { bucket, track, maxKeys } = opt;

		const prefix = this._prefix(opt);
		const final_path = prefix + path;
		const s3 = this._createNewS3Client(opt);
		logger.debug('list ' + path + ' from ' + final_path);

		const params = {
			Bucket: bucket,
			Prefix: final_path,
			MaxKeys: maxKeys,
		};

		const listObjectsCommand = new ListObjectsCommand(params);

		try {
			const response = await s3.send(listObjectsCommand);
			let list = [];
			if (response && response.Contents) {
				list = response.Contents.map(item => {
					return {
						key: item.Key.substr(prefix.length),
						eTag: item.ETag,
						lastModified: item.LastModified,
						size: item.Size,
					};
				});
			}
			dispatchStorageEvent(
				track,
				'list',
				{ method: 'list', result: 'success' },
				null,
				`${list.length} items returned from list operation`
			);
			logger.debug('list', list);
			return list;
		} catch (error) {
			logger.warn('list error', error);
			dispatchStorageEvent(
				track,
				'list',
				{ method: 'list', result: 'failed' },
				null,
				`Listing items failed: ${error.message}`
			);
			throw error;
		}
	}

	/**
	 * @private
	 */
	_ensureCredentials() {
		return Credentials.get()
			.then(credentials => {
				if (!credentials) return false;
				const cred = Credentials.shear(credentials);
				logger.debug('set credentials for storage', cred);
				this._config.credentials = cred;

				return true;
			})
			.catch(error => {
				logger.warn('ensure credentials error', error);
				return false;
			});
	}

	/**
	 * @private
	 */
	private _prefix(config) {
		const { credentials, level } = config;

		const customPrefix = config.customPrefix || {};
		const identityId = config.identityId || credentials.identityId;
		const privatePath =
			(customPrefix.private !== undefined ? customPrefix.private : 'private/') +
			identityId +
			'/';
		const protectedPath =
			(customPrefix.protected !== undefined
				? customPrefix.protected
				: 'protected/') +
			identityId +
			'/';
		const publicPath =
			customPrefix.public !== undefined ? customPrefix.public : 'public/';

		switch (level) {
			case 'private':
				return privatePath;
			case 'protected':
				return protectedPath;
			default:
				return publicPath;
		}
	}

	/**
	 * @private creates an S3 client with new V3 aws sdk
	 */
	private _createNewS3Client(config, emitter?) {
		const {
			region,
			credentials,
			dangerouslyConnectToHttpEndpointForTesting,
		} = config;
		let localTestingConfig = {};

		if (dangerouslyConnectToHttpEndpointForTesting) {
			localTestingConfig = {
				endpoint: localTestingStorageEndpoint,
				tls: false,
				bucketEndpoint: false,
				forcePathStyle: true,
			};
		}

		const s3client = new S3Client({
			region,
			credentials,
			customUserAgent: getAmplifyUserAgent(),
			...localTestingConfig,
			requestHandler: new AxiosHttpHandler({}, emitter),
		});
		return s3client;
	}
}

/**
 * @deprecated use named import
 */
export default AWSS3Provider;
