'use strict';
var __assign =
	(this && this.__assign) ||
	function() {
		__assign =
			Object.assign ||
			function(t) {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (var p in s)
						if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
				}
				return t;
			};
		return __assign.apply(this, arguments);
	};
var __awaiter =
	(this && this.__awaiter) ||
	function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function(resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __generator =
	(this && this.__generator) ||
	function(thisArg, body) {
		var _ = {
				label: 0,
				sent: function() {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g;
		return (
			(g = { next: verb(0), throw: verb(1), return: verb(2) }),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function() {
					return this;
				}),
			g
		);
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while (_)
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y['return']
									: op[0]
									? y['throw'] || ((t = y['return']) && t.call(y), 0)
									: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
Object.defineProperty(exports, '__esModule', { value: true });
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
var core_1 = require('@aws-amplify/core');
var S3 = require('aws-sdk/clients/s3');
var logger = new core_1.ConsoleLogger('AWSS3Provider');
var AMPLIFY_SYMBOL =
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default';
var dispatchStorageEvent = function(track, event, attrs, metrics, message) {
	if (track) {
		core_1.Hub.dispatch(
			'storage',
			{
				event: event,
				data: { attrs: attrs, metrics: metrics },
				message: message,
			},
			'Storage',
			AMPLIFY_SYMBOL
		);
	}
};
var localTestingStorageEndpoint = 'http://localhost:20005';
/**
 * Provide storage methods to use AWS S3
 */
var AWSS3Provider = /** @class */ (function() {
	/**
	 * Initialize Storage with AWS configurations
	 * @param {Object} config - Configuration object for storage
	 */
	function AWSS3Provider(config) {
		this._config = config ? config : {};
		logger.debug('Storage Options', this._config);
	}
	/**
	 * get the category of the plugin
	 */
	AWSS3Provider.prototype.getCategory = function() {
		return AWSS3Provider.CATEGORY;
	};
	/**
	 * get provider name of the plugin
	 */
	AWSS3Provider.prototype.getProviderName = function() {
		return AWSS3Provider.PROVIDER_NAME;
	};
	/**
	 * Configure Storage part with aws configuration
	 * @param {Object} config - Configuration of the Storage
	 * @return {Object} - Current configuration
	 */
	AWSS3Provider.prototype.configure = function(config) {
		logger.debug('configure Storage', config);
		if (!config) return this._config;
		var amplifyConfig = core_1.Parser.parseMobilehubConfig(config);
		this._config = Object.assign({}, this._config, amplifyConfig.Storage);
		if (!this._config.bucket) {
			logger.debug('Do not have bucket yet');
		}
		return this._config;
	};
	/**
	 * Get a presigned URL of the file or the object data when download:true
	 *
	 * @param {String} key - key of the object
	 * @param {Object} [config] - { level : private|protected|public, download: true|false }
	 * @return - A promise resolves to Amazon S3 presigned URL on success
	 */
	AWSS3Provider.prototype.get = function(key, config) {
		return __awaiter(this, void 0, void 0, function() {
			var credentialsOK,
				opt,
				bucket,
				download,
				cacheControl,
				contentDisposition,
				contentEncoding,
				contentLanguage,
				contentType,
				expires,
				track,
				prefix,
				final_key,
				s3,
				params;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this._ensureCredentials()];
					case 1:
						credentialsOK = _a.sent();
						if (!credentialsOK) {
							return [2 /*return*/, Promise.reject('No credentials')];
						}
						opt = Object.assign({}, this._config, config);
						(bucket = opt.bucket),
							(download = opt.download),
							(cacheControl = opt.cacheControl),
							(contentDisposition = opt.contentDisposition),
							(contentEncoding = opt.contentEncoding),
							(contentLanguage = opt.contentLanguage),
							(contentType = opt.contentType),
							(expires = opt.expires),
							(track = opt.track);
						prefix = this._prefix(opt);
						final_key = prefix + key;
						s3 = this._createS3(opt);
						logger.debug('get ' + key + ' from ' + final_key);
						params = {
							Bucket: bucket,
							Key: final_key,
						};
						// See: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
						if (cacheControl) params.ResponseCacheControl = cacheControl;
						if (contentDisposition)
							params.ResponseContentDisposition = contentDisposition;
						if (contentEncoding)
							params.ResponseContentEncoding = contentEncoding;
						if (contentLanguage)
							params.ResponseContentLanguage = contentLanguage;
						if (contentType) params.ResponseContentType = contentType;
						if (download === true) {
							return [
								2 /*return*/,
								new Promise(function(res, rej) {
									s3.getObject(params, function(err, data) {
										if (err) {
											dispatchStorageEvent(
												track,
												'download',
												{
													method: 'get',
													result: 'failed',
												},
												null,
												'Download failed with ' + err.message
											);
											rej(err);
										} else {
											dispatchStorageEvent(
												track,
												'download',
												{ method: 'get', result: 'success' },
												{ fileSize: Number(data.Body['length']) },
												'Download success for ' + key
											);
											res(data);
										}
									});
								}),
							];
						}
						if (expires) {
							params.Expires = expires;
						}
						return [
							2 /*return*/,
							new Promise(function(res, rej) {
								try {
									var url = s3.getSignedUrl('getObject', params);
									dispatchStorageEvent(
										track,
										'getSignedUrl',
										{ method: 'get', result: 'success' },
										null,
										'Signed URL: ' + url
									);
									res(url);
								} catch (e) {
									logger.warn('get signed url error', e);
									dispatchStorageEvent(
										track,
										'getSignedUrl',
										{ method: 'get', result: 'failed' },
										null,
										'Could not get a signed URL for ' + key
									);
									rej(e);
								}
							}),
						];
				}
			});
		});
	};
	/**
	 * Put a file in S3 bucket specified to configure method
	 * @param {String} key - key of the object
	 * @param {Object} object - File to be put in Amazon S3 bucket
	 * @param {Object} [config] - { level : private|protected|public, contentType: MIME Types,
	 *  progressCallback: function }
	 * @return - promise resolves to object on success
	 */
	AWSS3Provider.prototype.put = function(key, object, config) {
		return __awaiter(this, void 0, void 0, function() {
			var credentialsOK,
				opt,
				bucket,
				track,
				progressCallback,
				contentType,
				contentDisposition,
				cacheControl,
				expires,
				metadata,
				tagging,
				serverSideEncryption,
				SSECustomerAlgorithm,
				SSECustomerKey,
				SSECustomerKeyMD5,
				SSEKMSKeyId,
				type,
				prefix,
				final_key,
				s3,
				params,
				upload,
				data,
				e_1;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this._ensureCredentials()];
					case 1:
						credentialsOK = _a.sent();
						if (!credentialsOK) {
							return [2 /*return*/, Promise.reject('No credentials')];
						}
						opt = Object.assign({}, this._config, config);
						(bucket = opt.bucket),
							(track = opt.track),
							(progressCallback = opt.progressCallback);
						(contentType = opt.contentType),
							(contentDisposition = opt.contentDisposition),
							(cacheControl = opt.cacheControl),
							(expires = opt.expires),
							(metadata = opt.metadata),
							(tagging = opt.tagging);
						(serverSideEncryption = opt.serverSideEncryption),
							(SSECustomerAlgorithm = opt.SSECustomerAlgorithm),
							(SSECustomerKey = opt.SSECustomerKey),
							(SSECustomerKeyMD5 = opt.SSECustomerKeyMD5),
							(SSEKMSKeyId = opt.SSEKMSKeyId);
						type = contentType ? contentType : 'binary/octet-stream';
						prefix = this._prefix(opt);
						final_key = prefix + key;
						s3 = this._createS3(opt);
						logger.debug('put ' + key + ' to ' + final_key);
						params = {
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
						_a.label = 2;
					case 2:
						_a.trys.push([2, 4, , 5]);
						upload = s3
							.upload(params)
							.on('httpUploadProgress', function(progress) {
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
						return [4 /*yield*/, upload.promise()];
					case 3:
						data = _a.sent();
						logger.debug('upload result', data);
						dispatchStorageEvent(
							track,
							'upload',
							{ method: 'put', result: 'success' },
							null,
							'Upload success for ' + key
						);
						return [
							2 /*return*/,
							{
								key: data.Key.substr(prefix.length),
							},
						];
					case 4:
						e_1 = _a.sent();
						logger.warn('error uploading', e_1);
						dispatchStorageEvent(
							track,
							'upload',
							{ method: 'put', result: 'failed' },
							null,
							'Error uploading ' + key
						);
						throw e_1;
					case 5:
						return [2 /*return*/];
				}
			});
		});
	};
	/**
	 * Remove the object for specified key
	 * @param {String} key - key of the object
	 * @param {Object} [config] - { level : private|protected|public }
	 * @return - Promise resolves upon successful removal of the object
	 */
	AWSS3Provider.prototype.remove = function(key, config) {
		return __awaiter(this, void 0, void 0, function() {
			var credentialsOK, opt, bucket, track, prefix, final_key, s3, params;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this._ensureCredentials()];
					case 1:
						credentialsOK = _a.sent();
						if (!credentialsOK) {
							return [2 /*return*/, Promise.reject('No credentials')];
						}
						opt = Object.assign({}, this._config, config);
						(bucket = opt.bucket), (track = opt.track);
						prefix = this._prefix(opt);
						final_key = prefix + key;
						s3 = this._createS3(opt);
						logger.debug('remove ' + key + ' from ' + final_key);
						params = {
							Bucket: bucket,
							Key: final_key,
						};
						return [
							2 /*return*/,
							new Promise(function(res, rej) {
								s3.deleteObject(params, function(err, data) {
									if (err) {
										dispatchStorageEvent(
											track,
											'delete',
											{ method: 'remove', result: 'failed' },
											null,
											'Deletion of ' + key + ' failed with ' + err
										);
										rej(err);
									} else {
										dispatchStorageEvent(
											track,
											'delete',
											{ method: 'remove', result: 'success' },
											null,
											'Deleted ' + key + ' successfully'
										);
										res(data);
									}
								});
							}),
						];
				}
			});
		});
	};
	/**
	 * List bucket objects relative to the level and prefix specified
	 * @param {String} path - the path that contains objects
	 * @param {Object} [config] - { level : private|protected|public }
	 * @return - Promise resolves to list of keys for all objects in path
	 */
	AWSS3Provider.prototype.list = function(path, config) {
		return __awaiter(this, void 0, void 0, function() {
			var credentialsOK,
				opt,
				bucket,
				track,
				maxKeys,
				prefix,
				final_path,
				s3,
				params;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this._ensureCredentials()];
					case 1:
						credentialsOK = _a.sent();
						if (!credentialsOK) {
							return [2 /*return*/, Promise.reject('No credentials')];
						}
						opt = Object.assign({}, this._config, config);
						(bucket = opt.bucket), (track = opt.track), (maxKeys = opt.maxKeys);
						prefix = this._prefix(opt);
						final_path = prefix + path;
						s3 = this._createS3(opt);
						logger.debug('list ' + path + ' from ' + final_path);
						params = {
							Bucket: bucket,
							Prefix: final_path,
							MaxKeys: maxKeys,
						};
						return [
							2 /*return*/,
							new Promise(function(res, rej) {
								s3.listObjects(params, function(err, data) {
									if (err) {
										logger.warn('list error', err);
										dispatchStorageEvent(
											track,
											'list',
											{ method: 'list', result: 'failed' },
											null,
											'Listing items failed: ' + err.message
										);
										rej(err);
									} else {
										var list = data.Contents.map(function(item) {
											return {
												key: item.Key.substr(prefix.length),
												eTag: item.ETag,
												lastModified: item.LastModified,
												size: item.Size,
											};
										});
										dispatchStorageEvent(
											track,
											'list',
											{ method: 'list', result: 'success' },
											null,
											list.length + ' items returned from list operation'
										);
										logger.debug('list', list);
										res(list);
									}
								});
							}),
						];
				}
			});
		});
	};
	/**
	 * @private
	 */
	AWSS3Provider.prototype._ensureCredentials = function() {
		var _this = this;
		return core_1.Credentials.get()
			.then(function(credentials) {
				if (!credentials) return false;
				var cred = core_1.Credentials.shear(credentials);
				logger.debug('set credentials for storage', cred);
				_this._config.credentials = cred;
				return true;
			})
			.catch(function(err) {
				logger.warn('ensure credentials error', err);
				return false;
			});
	};
	/**
	 * @private
	 */
	AWSS3Provider.prototype._prefix = function(config) {
		var credentials = config.credentials,
			level = config.level;
		var customPrefix = config.customPrefix || {};
		var identityId = config.identityId || credentials.identityId;
		var privatePath =
			(customPrefix.private !== undefined ? customPrefix.private : 'private/') +
			identityId +
			'/';
		var protectedPath =
			(customPrefix.protected !== undefined
				? customPrefix.protected
				: 'protected/') +
			identityId +
			'/';
		var publicPath =
			customPrefix.public !== undefined ? customPrefix.public : 'public/';
		switch (level) {
			case 'private':
				return privatePath;
			case 'protected':
				return protectedPath;
			default:
				return publicPath;
		}
	};
	/**
	 * @private
	 */
	AWSS3Provider.prototype._createS3 = function(config) {
		var bucket = config.bucket,
			region = config.region,
			credentials = config.credentials,
			dangerouslyConnectToHttpEndpointForTesting =
				config.dangerouslyConnectToHttpEndpointForTesting;
		var localTestingConfig = {};
		if (dangerouslyConnectToHttpEndpointForTesting) {
			localTestingConfig = {
				endpoint: localTestingStorageEndpoint,
				s3BucketEndpoint: true,
				s3ForcePathStyle: true,
			};
		}
		return new S3(
			__assign(
				{
					apiVersion: '2006-03-01',
					params: { Bucket: bucket },
					signatureVersion: 'v4',
					region: region,
					credentials: credentials,
				},
				localTestingConfig
			)
		);
	};
	AWSS3Provider.CATEGORY = 'Storage';
	AWSS3Provider.PROVIDER_NAME = 'AWSS3';
	return AWSS3Provider;
})();
exports.default = AWSS3Provider;
//# sourceMappingURL=AWSS3Provider.js.map
