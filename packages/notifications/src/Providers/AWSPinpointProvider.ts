/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { ConsoleLogger as Logger, Credentials, Hub } from '@aws-amplify/core';
import Cache from '@aws-amplify/cache';
import { v1 as uuid } from 'uuid';

import { getInAppMessages } from './client';
import { NotificationsCategory, NotificationsProvider } from '../types';

const AMPLIFY_SYMBOL = (typeof Symbol !== 'undefined' &&
typeof Symbol.for === 'function'
	? Symbol.for('amplify_default')
	: '@@amplify_default') as Symbol;

const dispatchNotificationEvent = (event: string, data: any) => {
	Hub.dispatch('notification', { event, data }, 'Notification', AMPLIFY_SYMBOL);
};

const logger = new Logger('AWSPinpointProvider');

// params: { event: {name: , .... }, timeStamp, config, resendLimits }
export default class AWSPinpointProvider implements NotificationsProvider {
	static category: NotificationsCategory = 'Notifications';
	static providerName = 'AWSPinpoint';

	private _config;

	constructor(config?) {
		this._config = config ? config : {};
	}

	/**
	 * get the category of the plugin
	 */
	getCategory() {
		return AWSPinpointProvider.category;
	}

	/**
	 * get provider name of the plugin
	 */
	getProviderName(): string {
		return AWSPinpointProvider.providerName;
	}

	configure = (config): object => {
		logger.debug('configure Analytics', config);
		const conf = config || {};
		this._config = Object.assign({}, this._config, conf);

		if (this._config.appId && !this._config.disabled) {
			if (!this._config.endpointId) {
				const cacheKey = this.getProviderName() + '_' + this._config.appId;
				this._getEndpointId(cacheKey)
					.then(endpointId => {
						logger.debug('setting endpoint id from the cache', endpointId);
						this._config.endpointId = endpointId;
						dispatchNotificationEvent('pinpointProvider_configured', null);
					})
					.catch(err => {
						logger.debug('Failed to generate endpointId', err);
					});
			} else {
				dispatchNotificationEvent('pinpointProvider_configured', null);
			}
		}
		return this._config;
	};

	private async _getCredentials() {
		try {
			const credentials = await Credentials.get();
			if (!credentials) {
				logger.debug('no credentials found');
				return null;
			}

			logger.debug('set credentials for in app messages', credentials);
			return Credentials.shear(credentials);
		} catch (err) {
			logger.debug('ensure credentials error', err);
			return null;
		}
	}

	// copied from packages/analytics/Providers/AWSPinpointProvider.ts
	// could also expose AWSPinpointProvider.getEndpointId (or read from its config?)
	// leaning towards adding here though to prevent decoupling of Analytics module
	private async _getEndpointId(cacheKey: string) {
		// try to get from cache or generate
		let endpointId = await Cache.getItem(cacheKey);
		// const endpointId = await Cache.getItem(cacheKey);
		logger.debug(
			'endpointId from cache',
			endpointId,
			'type',
			typeof endpointId
		);
		if (!endpointId) {
			endpointId = uuid();
		}
		return endpointId;
	}

	async syncInAppMessages() {
		try {
			const { appId, region } = this._config;

			const cacheKey = `${this.getProviderName()}_${appId}`;
			const endpointId = await this._getEndpointId(cacheKey);
			const credentials = await this._getCredentials();

			if (!credentials || !appId || !region) {
				logger.debug(
					'cannot sync inAppMessages without credentials, applicationId and region'
				);
				return Promise.reject(
					new Error('No credentials, applicationId or region')
				);
			}

			const messages = await getInAppMessages({
				appId,
				credentials,
				endpointId,
				region,
			});

			return messages;
		} catch (e) {
			// TODO: Add error handling
			console.warn(e);
		}
	}

	translate() {}
}
