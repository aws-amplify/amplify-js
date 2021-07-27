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
import { getCachedUuid as getEndpointId } from '@aws-amplify/cache';
import { UpdateEndpointRequest } from '@aws-sdk/client-pinpoint';
import { v1 as uuid } from 'uuid';

import TempPinpointClient from './client';
import { NotificationsCategory, NotificationsProvider } from '../types';

const AMPLIFY_SYMBOL = (typeof Symbol !== 'undefined' &&
typeof Symbol.for === 'function'
	? Symbol.for('amplify_default')
	: '@@amplify_default') as Symbol;

const dispatchNotificationEvent = (
	event: string,
	data: any,
	message?: string
) => {
	Hub.dispatch('notification', { event, data }, 'Notification', AMPLIFY_SYMBOL);
};

const logger = new Logger('AWSPinpointProvider');

export default class AWSPinpointProvider implements NotificationsProvider {
	static category: NotificationsCategory = 'Notifications';
	static providerName = 'AWSPinpoint';

	private config;
	private endpointUpdated = false;
	private pinpointClient;

	constructor(config = {}) {
		this.config = config;
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

	configure = (config = {}): object => {
		logger.debug('configure', config);
		this.config = Object.assign({}, this.config, config);
		dispatchNotificationEvent('pinpointProvider_configured', null);
		return this.config;
	};

	syncInAppMessages = async () => {
		const { appId, disabled, endpointId } = this.config;

		if (disabled) {
			logger.debug('provider is disabled');
			return;
		}

		if (!endpointId) {
			const cacheKey = `${this.getProviderName()}_${appId}`;
			this.config.endpointId = await getEndpointId(cacheKey);
		}

		try {
			await this.initClient();
			if (!this.endpointUpdated) {
				await this.updateEndpoint();
			}
			const response = await this.pinpointClient
				.getInAppMessages({
					ApplicationId: appId,
					EndpointId: endpointId || this.config.endpointId,
				})
				.promise();
			const { InAppMessageCampaigns } = response.InAppMessagesResponse;
			dispatchNotificationEvent('syncInAppMessages', InAppMessageCampaigns);
			return InAppMessageCampaigns;
		} catch (err) {
			logger.error('Error syncing in-app messages', err);
		}
	};

	private initClient = async () => {
		if (this.pinpointClient) {
			return;
		}

		const { appId, region } = this.config;
		const credentials = await this.getCredentials();

		if (!appId || !credentials || !region) {
			throw new Error(
				'One or more of credentials, appId or region is not configured'
			);
		}

		this.pinpointClient = new TempPinpointClient({ region, ...credentials });
	};

	private getCredentials = async () => {
		try {
			const credentials = await Credentials.get();
			if (!credentials) {
				logger.debug('no credentials found');
				return null;
			}
			return Credentials.shear(credentials);
		} catch (err) {
			logger.error('Error getting credentials', err);
			return null;
		}
	};

	private updateEndpoint = async (): Promise<void> => {
		const { appId, endpointId } = this.config;
		const request: UpdateEndpointRequest = {
			ApplicationId: appId,
			EndpointId: endpointId,
			EndpointRequest: {
				RequestId: uuid(),
				EffectiveDate: new Date().toISOString(),
			},
		};
		try {
			logger.debug('updating endpoint', request);
			await this.pinpointClient.updateEndpoint(request).promise();
			this.endpointUpdated = true;
		} catch (err) {
			throw err;
		}
	};
}
