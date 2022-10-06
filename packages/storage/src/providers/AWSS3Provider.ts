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
	Credentials,
	Parser,
	ICredentials,
	StorageHelper,
	Hub,
} from '@aws-amplify/core';
import {
	S3Client,
	GetObjectCommand,
	DeleteObjectCommand,
	ListObjectsV2Command,
	GetObjectCommandOutput,
	DeleteObjectCommandInput,
	CopyObjectCommandInput,
	CopyObjectCommand,
	PutObjectCommandInput,
	GetObjectCommandInput,
	ListObjectsV2Request,
} from '@aws-sdk/client-s3';
import { formatUrl } from '@aws-sdk/util-format-url';
import { createRequest } from '@aws-sdk/util-create-request';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import {
	SEND_DOWNLOAD_PROGRESS_EVENT,
	SEND_UPLOAD_PROGRESS_EVENT,
} from './axios-http-handler';
import {
	StorageOptions,
	StorageProvider,
	S3ProviderGetConfig,
	S3ProviderGetOuput,
	S3ProviderPutConfig,
	S3ProviderRemoveConfig,
	S3ProviderListConfig,
	S3ProviderCopyConfig,
	S3ProviderCopyOutput,
	S3CopySource,
	S3CopyDestination,
	StorageAccessLevel,
	CustomPrefix,
	S3ProviderRemoveOutput,
	S3ProviderPutOutput,
	ResumableUploadConfig,
	UploadTask,
	S3ClientOptions,
	S3ProviderListOutputWithToken,
} from '../types';
import { StorageErrorStrings } from '../common/StorageErrorStrings';
import { dispatchStorageEvent } from '../common/StorageUtils';
import {
	createPrefixMiddleware,
	prefixMiddlewareOptions,
	getPrefix,
	autoAdjustClockskewMiddleware,
	autoAdjustClockskewMiddlewareOptions,
	createS3Client,
} from '../common/S3ClientUtils';
import { AWSS3ProviderManagedUpload } from './AWSS3ProviderManagedUpload';
import { AWSS3UploadTask, TaskEvents } from './AWSS3UploadTask';
import { UPLOADS_STORAGE_KEY } from '../common/StorageConstants';
import * as events from 'events';
import { CancelTokenSource } from 'axios';

const logger = new Logger('AWSS3Provider');

const DEFAULT_STORAGE_LEVEL = 'public';
const DEFAULT_PRESIGN_EXPIRATION = 900;

interface AddTaskInput {
	accessLevel: StorageAccessLevel;
	file: Blob;
	bucket: string;
	emitter: events.EventEmitter;
	key: string;
	s3Client: S3Client;
	params?: PutObjectCommandInput;
}

/**
 * Provide storage methods to use AWS S3
 */
export class AWSS3Provider implements StorageProvider {
	static readonly CATEGORY = 'Storage';
	static readonly PROVIDER_NAME = 'AWSS3';
	private _config: StorageOptions;
	private _storage: Storage;

	/**
	 * Initialize Storage with AWS configurations
	 * @param {Object} config - Configuration object for storage
	 */
	constructor(config?: StorageOptions) {
		this._config = config ? config : {};
		this._storage = new StorageHelper().getStorage();
		Hub.listen('auth', data => {
			const { payload } = data;
			if (payload.event === 'signOut' || payload.event === 'signIn') {
				this._storage.removeItem(UPLOADS_STORAGE_KEY);
			}
		});
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
	getProviderName(): 'AWSS3' {
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

	private startResumableUpload(
		addTaskInput: AddTaskInput,
		config: S3ProviderPutConfig & ResumableUploadConfig
	): UploadTask {
		const { s3Client, emitter, key, file, params } = addTaskInput;
		const {
			progressCallback,
			completeCallback,
			errorCallback,
			track = false,
		} = config;
		if (!(file instanceof Blob)) {
			throw new Error(StorageErrorStrings.INVALID_BLOB);
		}

		emitter.on(TaskEvents.UPLOAD_PROGRESS, event => {
			if (progressCallback) {
				if (typeof progressCallback === 'function') {
					progressCallback(event);
				} else {
					logger.warn(
						'progressCallback should be a function, not a ' +
							typeof progressCallback
					);
				}
			}
		});

		emitter.on(TaskEvents.UPLOAD_COMPLETE, event => {
			if (completeCallback) {
				if (typeof completeCallback === 'function') {
					completeCallback(event);
				} else {
					logger.warn(
						'completeCallback should be a function, not a ' +
							typeof completeCallback
					);
				}
			}
		});

		emitter.on(TaskEvents.ERROR, err => {
			if (errorCallback) {
				if (typeof errorCallback === 'function') {
					errorCallback(err);
				} else {
					logger.warn(
						'errorCallback should be a function, not a ' + typeof errorCallback
					);
				}
			}
		});

		// we want to keep this function sync so we defer this promise to AWSS3UploadTask to resolve when it's needed
		// when its doing a final check with _listSingleFile function
		const prefixPromise: Promise<string> = Credentials.get().then(
			(credentials: any) => {
				const cred = Credentials.shear(credentials);
				return getPrefix({
					...config,
					credentials: cred,
				});
			}
		);

		const task = new AWSS3UploadTask({
			s3Client,
			file,
			emitter,
			level: config.level,
			storage: this._storage,
			params,
			prefixPromise,
		});

		dispatchStorageEvent(
			track,
			'upload',
			{ method: 'put', result: 'success' },
			null,
			`Upload Task created successfully for ${key}`
		);

		// automatically start the upload task
		task.resume();

		return task;
	}

	/**
	 * Copy an object from a source object to a new object within the same bucket. Can optionally copy files across
	 * different level or identityId (if source object's level is 'protected').
	 *
	 * @async
	 * @param {S3CopySource} src - Key and optionally access level and identityId of the source object.
	 * @param {S3CopyDestination} dest - Key and optionally access level of the destination object.
	 * @param {S3ProviderCopyConfig} [config] - Optional configuration for s3 commands.
	 * @return {Promise<S3ProviderCopyOutput>} The key of the copied object.
	 */
	public async copy(
		src: S3CopySource,
		dest: S3CopyDestination,
		config?: S3ProviderCopyConfig
	): Promise<S3ProviderCopyOutput> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK || !this._isWithCredentials(this._config)) {
			throw new Error(StorageErrorStrings.NO_CREDENTIALS);
		}
		const opt = Object.assign({}, this._config, config);
		const {
			acl,
			bucket,
			cacheControl,
			expires,
			track,
			serverSideEncryption,
			SSECustomerAlgorithm,
			SSECustomerKey,
			SSECustomerKeyMD5,
			SSEKMSKeyId,
		} = opt;
		const {
			level: srcLevel = DEFAULT_STORAGE_LEVEL,
			identityId: srcIdentityId,
			key: srcKey,
		} = src;
		const { level: destLevel = DEFAULT_STORAGE_LEVEL, key: destKey } = dest;
		if (!srcKey || typeof srcKey !== 'string') {
			throw new Error(StorageErrorStrings.NO_SRC_KEY);
		}
		if (!destKey || typeof destKey !== 'string') {
			throw new Error(StorageErrorStrings.NO_DEST_KEY);
		}
		if (srcLevel !== 'protected' && srcIdentityId) {
			logger.warn(
				`You may copy files from another user if the source level is "protected", currently it's ${srcLevel}`
			);
		}
		const srcPrefix = this._prefix({
			...opt,
			level: srcLevel,
			...(srcIdentityId && { identityId: srcIdentityId }),
		});
		const destPrefix = this._prefix({ ...opt, level: destLevel });
		const finalSrcKey = `${bucket}/${srcPrefix}${srcKey}`;
		const finalDestKey = `${destPrefix}${destKey}`;
		logger.debug(`copying ${finalSrcKey} to ${finalDestKey}`);

		const params: CopyObjectCommandInput = {
			Bucket: bucket,
			CopySource: finalSrcKey,
			Key: finalDestKey,
			// Copies over metadata like contentType as well
			MetadataDirective: 'COPY',
		};

		if (cacheControl) params.CacheControl = cacheControl;
		if (expires) params.Expires = expires;
		if (serverSideEncryption) {
			params.ServerSideEncryption = serverSideEncryption;
		}
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
		if (acl) params.ACL = acl;

		const s3 = this._createNewS3Client(opt);
		try {
			await s3.send(new CopyObjectCommand(params));
			dispatchStorageEvent(
				track,
				'copy',
				{
					method: 'copy',
					result: 'success',
				},
				null,
				`Copy success from ${srcKey} to ${destKey}`
			);
			return {
				key: destKey,
			};
		} catch (error) {
			dispatchStorageEvent(
				track,
				'copy',
				{
					method: 'copy',
					result: 'failed',
				},
				null,
				`Copy failed from ${srcKey} to ${destKey}`
			);
			throw error;
		}
	}

	/**
	 * Get a presigned URL of the file or the object data when download:true
	 *
	 * @param {string} key - key of the object
	 * @param {S3ProviderGetConfig} [config] - Optional configuration for the underlying S3 command
	 * @return {Promise<string | GetObjectCommandOutput>} - A promise resolves to Amazon S3 presigned URL or the
	 * GetObjectCommandOutput if download is set to true on success
	 */
	public async get<T extends S3ProviderGetConfig & StorageOptions>(
		key: string,
		config?: T
	): Promise<S3ProviderGetOuput<T>>;
	public async get(
		key: string,
		config?: S3ProviderGetConfig
	): Promise<string | GetObjectCommandOutput> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK || !this._isWithCredentials(this._config)) {
			throw new Error(StorageErrorStrings.NO_CREDENTIALS);
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
			SSECustomerAlgorithm,
			SSECustomerKey,
			SSECustomerKeyMD5,
			progressCallback,
		} = opt;
		const prefix = this._prefix(opt);
		const final_key = prefix + key;
		const emitter = new events.EventEmitter();
		const s3 = this._createNewS3Client(opt, emitter);
		logger.debug('get ' + key + ' from ' + final_key);

		const params: GetObjectCommandInput = {
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
		if (SSECustomerAlgorithm) {
			params.SSECustomerAlgorithm = SSECustomerAlgorithm;
		}
		if (SSECustomerKey) {
			params.SSECustomerKey = SSECustomerKey;
		}
		if (SSECustomerKeyMD5) {
			params.SSECustomerKeyMD5 = SSECustomerKeyMD5;
		}

		if (download === true) {
			const getObjectCommand = new GetObjectCommand(params);
			try {
				if (progressCallback) {
					if (typeof progressCallback === 'function') {
						emitter.on(SEND_DOWNLOAD_PROGRESS_EVENT, progress => {
							progressCallback(progress);
						});
					} else {
						logger.warn(
							'progressCallback should be a function, not a ' +
								typeof progressCallback
						);
					}
				}
				const response = await s3.send(getObjectCommand);
				emitter.removeAllListeners(SEND_DOWNLOAD_PROGRESS_EVENT);
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

		try {
			const signer = new S3RequestPresigner({ ...s3.config });
			const request = await createRequest(s3, new GetObjectCommand(params));
			// Default is 15 mins as defined in V2 AWS SDK
			const url = formatUrl(
				await signer.presign(request, {
					expiresIn: expires || DEFAULT_PRESIGN_EXPIRATION,
				})
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
	 * @param key - key of the object
	 * @param object - File to be put in Amazon S3 bucket
	 * @param [config] - Optional configuration for the underlying S3 command
	 * @return an instance of AWSS3UploadTask or a promise that resolves to an object with the new object's key on
	 * success.
	 */
	public put<T extends S3ProviderPutConfig>(
		key: string,
		object: PutObjectCommandInput['Body'],
		config?: T
	): S3ProviderPutOutput<T> {
		const opt = Object.assign({}, this._config, config);
		const { bucket, track, progressCallback, level, resumable } = opt;
		const {
			contentType,
			contentDisposition,
			contentEncoding,
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

		const params: PutObjectCommandInput = {
			Bucket: bucket,
			Key: key,
			Body: object,
			ContentType: type,
		};
		if (cacheControl) {
			params.CacheControl = cacheControl;
		}
		if (contentDisposition) {
			params.ContentDisposition = contentDisposition;
		}
		if (contentEncoding) {
			params.ContentEncoding = contentEncoding;
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
		}
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

		const emitter = new events.EventEmitter();
		const uploader = new AWSS3ProviderManagedUpload(params, opt, emitter);

		if (acl) {
			params.ACL = acl;
		}

		if (resumable === true) {
			const s3Client = this._createNewS3Client(opt);
			// we are using aws sdk middleware to inject the prefix to key, this way we don't have to call
			// this._ensureCredentials() which allows us to make this function sync so we can return non-Promise like UploadTask
			s3Client.middlewareStack.add(
				createPrefixMiddleware(opt, key),
				prefixMiddlewareOptions
			);
			const addTaskInput: AddTaskInput = {
				bucket,
				key,
				s3Client,
				file: object as Blob,
				emitter,
				accessLevel: level,
				params,
			};
			// explicitly asserting the type here as Typescript could not infer that resumable is of type true
			return this.startResumableUpload(
				addTaskInput,
				config as typeof config & { resumable: true }
			) as S3ProviderPutOutput<T>;
		}

		try {
			if (progressCallback) {
				if (typeof progressCallback === 'function') {
					emitter.on(SEND_UPLOAD_PROGRESS_EVENT, progress => {
						progressCallback(progress);
					});
				} else {
					logger.warn(
						'progressCallback should be a function, not a ' +
							typeof progressCallback
					);
				}
			}

			return uploader.upload().then(response => {
				logger.debug('upload result', response);
				dispatchStorageEvent(
					track,
					'upload',
					{ method: 'put', result: 'success' },
					null,
					`Upload success for ${key}`
				);
				return { key };
			}) as S3ProviderPutOutput<T>;
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
	 * @param {S3ProviderRemoveConfig} [config] - Optional configuration for the underlying S3 command
	 * @return {Promise<S3ProviderRemoveOutput>} - Promise resolves upon successful removal of the object
	 */
	public async remove(
		key: string,
		config?: S3ProviderRemoveConfig
	): Promise<S3ProviderRemoveOutput> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK || !this._isWithCredentials(this._config)) {
			throw new Error(StorageErrorStrings.NO_CREDENTIALS);
		}
		const opt = Object.assign({}, this._config, config);
		const { bucket, track } = opt;

		const prefix = this._prefix(opt);
		const final_key = prefix + key;
		const s3 = this._createNewS3Client(opt);
		logger.debug('remove ' + key + ' from ' + final_key);

		const params: DeleteObjectCommandInput = {
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
	private async _list(
		params: ListObjectsV2Request,
		opt: S3ClientOptions,
		prefix: string
	): Promise<S3ProviderListOutputWithToken> {
		const list: S3ProviderListOutputWithToken = {
			results: [],
			hasNextToken: false,
		};
		const s3 = this._createNewS3Client(opt);
		const listObjectsV2Command = new ListObjectsV2Command({ ...params });
		const response = await s3.send(listObjectsV2Command);
		if (response && response.Contents) {
			list.results = response.Contents.map(item => {
				return {
					key: item.Key.substr(prefix.length),
					eTag: item.ETag,
					lastModified: item.LastModified,
					size: item.Size,
				};
			});
			list.nextToken = response.NextContinuationToken;
			list.hasNextToken = response.IsTruncated;
		}
		return list;
	}

	/**
	 * List bucket objects relative to the level and prefix specified
	 * @param {string} path - the path that contains objects
	 * @param {S3ProviderListConfig} [config] - Optional configuration for the underlying S3 command
	 * @return {Promise<S3ProviderListOutputWithToken>} - Promise resolves to list of keys, eTags, lastModified
	 * and file size for all objects in path
	 */
	public async list(
		path: string,
		config?: S3ProviderListConfig
	): Promise<S3ProviderListOutputWithToken> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK || !this._isWithCredentials(this._config)) {
			throw new Error(StorageErrorStrings.NO_CREDENTIALS);
		}
		const opt: S3ClientOptions = Object.assign({}, this._config, config);
		const { bucket, track, pageSize, pageToken } = opt;
		const prefix = this._prefix(opt);
		const final_path = prefix + path;
		logger.debug('list ' + path + ' from ' + final_path);
		try {
			const list: S3ProviderListOutputWithToken = {
				results: [],
				hasNextToken: false,
			};
			const MAX_PAGE_SIZE = 1000;
			let listResult: S3ProviderListOutputWithToken;
			const params: ListObjectsV2Request = {
				Bucket: bucket,
				Prefix: final_path,
				MaxKeys: MAX_PAGE_SIZE,
				ContinuationToken: pageToken,
			};
			params.ContinuationToken = pageToken;
			if (pageSize === 'ALL') {
				do {
					listResult = await this._list(params, opt, prefix);
					list.results.push(...listResult.results);
					if (listResult.nextToken)
						params.ContinuationToken = listResult.nextToken;
				} while (listResult.nextToken);
			} else {
				if (
					pageSize &&
					pageSize <= MAX_PAGE_SIZE &&
					typeof pageSize === 'number'
				)
					params.MaxKeys = pageSize;
				else logger.warn(`pageSize should be from 0 - ${MAX_PAGE_SIZE}.`);
				listResult = await this._list(params, opt, prefix);
				list.results.push(...listResult.results);
				list.hasNextToken = listResult.hasNextToken;
				list.nextToken = null ?? listResult.nextToken;
			}
			dispatchStorageEvent(
				track,
				'list',
				{ method: 'list', result: 'success' },
				null,
				`${list.results.length} items returned from list operation`
			);
			logger.debug('list', list);
			return list;
		} catch (error) {
			logger.error('list InvalidArgument', error);
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

	private async _ensureCredentials(): Promise<boolean> {
		try {
			const credentials = await Credentials.get();
			if (!credentials) return false;
			const cred = Credentials.shear(credentials);
			logger.debug('set credentials for storage', cred);
			this._config.credentials = cred;

			return true;
		} catch (error) {
			logger.warn('ensure credentials error', error);
			return false;
		}
	}

	private _isWithCredentials(
		config: StorageOptions
	): config is StorageOptions & { credentials: ICredentials } {
		return typeof config === 'object' && config.hasOwnProperty('credentials');
	}

	private _prefix(config: {
		credentials: ICredentials;
		level?: StorageAccessLevel;
		customPrefix?: CustomPrefix;
		identityId?: string;
	}): string {
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
	 * Creates an S3 client with new V3 aws sdk
	 */
	private _createNewS3Client(
		config: {
			region?: string;
			cancelTokenSource?: CancelTokenSource;
			dangerouslyConnectToHttpEndpointForTesting?: boolean;
			useAccelerateEndpoint?: boolean;
		},
		emitter?: events.EventEmitter
	): S3Client {
		const s3client = createS3Client(config, emitter);
		s3client.middlewareStack.add(
			autoAdjustClockskewMiddleware(s3client.config),
			autoAdjustClockskewMiddlewareOptions
		);
		return s3client;
	}
}
