/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { AWSS3Provider } from '@aws-amplify/storage';
import {
	ConsoleLogger,
	AWSCloudWatchProvider,
	Hub,
	Logger,
} from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import CloudLoggerConnectivity from './cloudLoggerConnectivity';
import Cache from '@aws-amplify/cache';

const logger = new Logger('CloudLogger');
const CACHE_KEY_DEFAULT = 'cloud-logger/application-logs';

const DISABLED_EXPIRATION = 1000 * 60 * 60 * 12; // 12 hours

type RemoteConfigObject = {
	enabled: boolean;
	level: string;
	excludeClasses: string[];
	userAllowList: string[];
	refreshIntervalMinutes: number;
};

type RemoteConfig = {
	expires: number;
	config: RemoteConfigObject;
	hash: string;
};

type DisabledStatus = {
	expires: number;
};
class CloudLogger {
	private _config;
	private _storage: AWSS3Provider;
	private _remoteConfig: RemoteConfig;
	private _connectivity: CloudLoggerConnectivity;
	private _online: boolean = false;
	private _providerInstance: AWSCloudWatchProvider;
	private _cacheKey: string;
	private initialized = false;
	private user;
	private disabledStatus: DisabledStatus;
	private cache: typeof Cache;

	constructor() {
		this._preFlightCheck = this._preFlightCheck.bind(this);
	}

	async configure(conf) {
		logger.debug('configure', conf);
		if (!conf) {
			console.error('CloudLogger requires a config object');
		}

		this._config = conf;
		this._storage = new AWSS3Provider();
		this._storage.configure({
			Storage: {
				bucket: conf.Logging.configBucket,
				region: conf.aws_project_region,
				level: 'public',
			},
		});

		this._connectivity = new CloudLoggerConnectivity();
		this.cache = Cache.createInstance({
			keyPrefix: 'cl-prefix/',
			capacityInBytes: 2 * 1000 * 1000, // 2MB
			itemMaxSize: 500 * 1000, // 500KB
		});
	}

	private async initSignInListener() {
		logger.debug('initSignInListener');
		const sub = Hub.listen('auth', msg => {
			if (msg.payload?.event === 'signIn' && msg.payload?.data?.username) {
				logger.debug('initSignInListener - event');
				this.user = msg.payload.data;
				this._cacheKey = `${CACHE_KEY_DEFAULT}/${msg.payload.data.username}`;
				this.initSignOutListener();
				this.initialize();
				sub();
			}
		});
	}

	private async initSignOutListener() {
		logger.debug('initSignOutListener');
		const sub = Hub.listen('auth', msg => {
			if (msg.payload?.event === 'signOut') {
				logger.debug('initSignOutListener - event');
				this.stop();
				this.initSignInListener();
				sub();
			}
		});
	}

	private setDisabledFlag = async () => {
		const expires = Date.now() + DISABLED_EXPIRATION;

		const disabledStatus: DisabledStatus = {
			expires,
		};

		await this.cache.setItem(`${this._cacheKey}/disabled`, disabledStatus, {
			expires,
		});

		this.disabledStatus = disabledStatus;
	};

	private async checkAuth() {
		try {
			this.user = await Auth.currentAuthenticatedUser();
			logger.debug('authed user', this.user);
			this._cacheKey = `${CACHE_KEY_DEFAULT}/${this.user.username}`;
			this.initSignOutListener();

			if (!this.initialized) {
				this.initialize();
			} else {
				this.resume();
			}
		} catch (error) {
			if (error === 'The user is not authenticated') {
				this.initSignInListener();
			}
		}
	}

	async start() {
		this._start();
	}

	private validateLocalConfig() {
		if (!this._config.Logging) {
			throw new Error(
				'Must provide a `Logging` object in the config.\n For example: {\n  "Logging": {\n    "logGroupName": "my-log-group",\n    "configBucket": "my-s3-bucket",\n    "configFileName": "logging-config.json"\n  }\n}'
			);
		}

		const {
			Logging: { logGroupName, configBucket, configFileName },
			aws_project_region,
		} = this._config;

		let msg = '';

		if (logGroupName === undefined) {
			msg += 'Logging.logGroupName is required in the config\n';
		}
		if (configBucket === undefined) {
			msg += 'Logging.configBucket is required\n';
		}
		if (configFileName === undefined) {
			msg += 'Logging.configFileName is required\n';
		}
		if (aws_project_region === undefined) {
			msg += 'logGroupName is required\n';
		}

		if (msg) {
			throw new Error(
				`Invalid configuration for CloudLogger: ${msg}\n CloudLogger will not start;`
			);
		}
	}

	private async _start() {
		try {
			this.validateLocalConfig();

			this._connectivity.status().subscribe(async ({ online }) => {
				if (online && !this._online) {
					await this.checkAuth();
				} else if (!online) {
					this.pause();
				}
				this._online = online;
				logger.debug('network', online);
			});
		} catch (error) {
			logger.error(error);
		}
	}

	pause() {
		if (this._providerInstance) {
			this._providerInstance.pause();
		}
	}

	resume() {
		if (this._providerInstance) {
			this._providerInstance.resume();
		}
	}

	stop() {
		if (this._connectivity) {
			this._connectivity.unsubscribe();
		}
		this.cleanupRemoteLoggingResources();
		this.initialized = false;
	}

	clear() {
		this.clearCache();
	}

	private async clearCache() {
		this.cache.clear();
	}

	private async isDisabled() {
		const curTime = Date.now();

		const disabledInMem =
			this.disabledStatus != null && this.disabledStatus.expires > curTime;

		if (disabledInMem) {
			return true;
		}

		const checkCache =
			this.disabledStatus == null ||
			(this.disabledStatus != null && this.disabledStatus.expires <= curTime);

		if (checkCache) {
			const fromCache: DisabledStatus | undefined = await this.cache.getItem(
				`${this._cacheKey}/disabled`
			);

			if (fromCache != null && fromCache.expires > curTime) {
				this.disabledStatus = fromCache;
				return true;
			}
		}

		return false;
	}

	private async initialize() {
		await this._refreshConfig();
		if (!this.initialized) {
			this.initiateRemoteLogging();
		}
		this.initialized = true;
	}

	private async getConfig(): Promise<RemoteConfig> {
		logger.debug('Getting config from cache');
		const fromCache = await this.cache.getItem(this._cacheKey);

		if (fromCache) {
			logger.debug('Retrieved from cache');
			return fromCache;
		}

		// get config from s3
		try {
			logger.debug('Getting config from cloud');
			const configFileMeta = await this.getRemoteConfigMetadata();
			const remoteConfig = await this.getRemoteConfigObject();
			this.validateRemoteConfig(remoteConfig);
			const configObj = this.processRemoteConfig(
				remoteConfig,
				configFileMeta.eTag
			);
			logger.debug('Retrieved config from cloud');
			return configObj;
		} catch (error) {
			logger.debug('Error retrieving config from cloud', error);
			this.stop();
			throw error;
		}
	}

	private async _refreshConfig() {
		const configObj = await this.getConfig();

		await this.cache.setItem(this._cacheKey, configObj, {
			expires: configObj.expires,
		});
		this._remoteConfig = configObj;

		if (
			configObj.config.enabled === false ||
			configObj.config.enabled == null
		) {
			// Logging is disabled.
			logger.debug('remote config - logging is disabled globally');
			await this.setDisabledFlag();
		}

		const userAllowListDefined =
			configObj.config.userAllowList !== undefined &&
			configObj.config.userAllowList instanceof Array;

		if (userAllowListDefined) {
			const allowListEmpty = configObj.config.userAllowList.length === 0;
			const currentUserAllowListed = configObj.config.userAllowList.includes(
				this.user.username
			);

			if (allowListEmpty || !currentUserAllowListed) {
				logger.debug('remote config - logging is disabled for current user');
				await this.setDisabledFlag();
			}
		}
	}

	private async _preFlightCheck() {
		logger.debug('_preFlightCheck');

		if (await this.isDisabled()) {
			logger.debug('_preFlightCheck config disabled');
			return false;
		}

		if (this._remoteConfig && this._remoteConfig.expires) {
			if (this._remoteConfig.expires > Date.now()) {
				logger.debug('_preFlightCheck config valid');
				return true;
			}
		}

		logger.debug('_preFlightCheck in-memory config expired');
		await this.initialize();
		if (await this.isDisabled()) {
			logger.debug('_preFlightCheck post-refresh config disabled');
			return false;
		}
		return true;
	}

	private async getRemoteConfigMetadata() {
		const files = await this._storage.list('');
		const configFile = files.find(
			f => f.key === this._config.Logging.configFileName
		);

		if (!configFile) {
			throw new Error(
				'Remote config file not found in S3 bucket. CloudLogging is disabled'
			);
		}

		return configFile;
	}

	private async getRemoteConfigObject(): Promise<RemoteConfigObject> {
		try {
			const fileContents = await this._storage.get(
				this._config.Logging.configFileName,
				{
					download: true,
					cacheControl: 'no-cache',
				}
			);

			logger.debug('getRemoteConfigObject', fileContents);
			const body = <Blob>fileContents.Body;

			let jsonConfig;

			if (typeof body.text === 'function') {
				// body comes back as Blob on web
				jsonConfig = JSON.parse(await body.text());
			} else {
				// body comes back as Readable on RN
				jsonConfig = await new Response(body).json();
			}

			logger.debug('parsedConfig', jsonConfig);

			return jsonConfig;
		} catch (error) {
			logger.debug('Could not parse remote config', error);
			throw error;
		}
	}

	private validateRemoteConfig(jsonConfig: RemoteConfigObject) {
		if (jsonConfig.enabled === undefined) {
			throw new Error('remote config is missing `enabled: true`');
		}

		if (jsonConfig.refreshIntervalMinutes === undefined) {
			throw new Error(
				'remote config is missing `refreshIntervalMinutes` property'
			);
		}
	}

	private processRemoteConfig(
		jsonConfig: RemoteConfigObject,
		hash: string
	): RemoteConfig {
		logger.debug('json contents', jsonConfig);

		const expires = Date.now() + jsonConfig.refreshIntervalMinutes * 60 * 1000;

		const remoteConfigObj = {
			config: jsonConfig,
			hash,
			expires,
		};

		return remoteConfigObj;
	}

	private initiateRemoteLogging() {
		const providerConfig = {
			...this._config,
			Logging: { ...this._config.Logging, logStreamName: this._cacheKey },
		};

		this._providerInstance = new AWSCloudWatchProvider(providerConfig);
		this._providerInstance.setPreFlightCheck(this._preFlightCheck);

		ConsoleLogger.CLOUD_LOG_LEVEL =
			this._remoteConfig?.config?.level || 'DEBUG';
		ConsoleLogger.globalPluggables(this._providerInstance);
	}

	private cleanupRemoteLoggingResources() {
		ConsoleLogger.clearGlobalPluggables();

		if (this._providerInstance) {
			this._providerInstance.pause();
			this._providerInstance.clear();
			this._providerInstance = undefined;
		}
	}
}

const instance = new CloudLogger();
export { instance as CloudLogger };
