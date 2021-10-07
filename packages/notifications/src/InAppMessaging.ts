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

import {
	Amplify,
	ConsoleLogger as Logger,
	HubCallback,
	HubCapsule,
	Hub,
	parseMobileHubConfig,
	StorageHelper,
} from '@aws-amplify/core';
import flatten from 'lodash/flatten';
import noop from 'lodash/noop';
import { AWSPinpointProvider } from './Providers';
import {
	InAppMessage,
	InAppMessagesHandler,
	InAppMessagingCategory,
	InAppMessagingConfig,
	InAppMessagingEvent,
	InAppMessagingProvider,
} from './types';

const STORAGE_KEY_SUFFIX = '_inAppMessages';

const logger = new Logger('InAppMessage');

class InAppMessagingClass {
	private config: Record<string, any> = {};
	private inAppMessagesHandler: InAppMessagesHandler = noop;
	private listeningForAnalyticEvents = false;
	private pluggables: InAppMessagingProvider[] = [];
	private storageSynced = false;

	constructor() {
		this.config = {
			storage: new StorageHelper().getStorage(),
		};
	}

	configure = ({
		listenForAnalyticsEvents = true,
		inAppMessagesHandler,
		...config
	}: InAppMessagingConfig = {}) => {
		this.config = Object.assign(
			{},
			this.config,
			parseMobileHubConfig(config).Notifications?.InAppMessaging ?? {},
			config
		);

		logger.debug('configure InAppMessaging', config);

		this.inAppMessagesHandler = this.setInAppMessagesHandler(
			inAppMessagesHandler
		);

		this.pluggables.forEach(pluggable => {
			pluggable.configure({
				...this.config,
				...(this.config[pluggable.getProviderName()] ?? {}),
			});
		});

		if (this.pluggables.length === 0) {
			this.addPluggable(new AWSPinpointProvider());
		}

		if (listenForAnalyticsEvents && !this.listeningForAnalyticEvents) {
			Hub.listen('analytics', this.analyticsListener);
			this.listeningForAnalyticEvents = true;
		}
	};

	getModuleName(): InAppMessagingCategory {
		return 'InAppMessaging';
	}

	getPluggable = (providerName: string): InAppMessagingProvider => {
		const pluggable =
			this.pluggables.find(
				pluggable => pluggable.getProviderName() === providerName
			) || null;

		if (!pluggable) {
			logger.debug(`No plugin found with name ${providerName}`);
		}

		return pluggable;
	};

	/**
	 * add plugin into InAppMessaging category
	 * @param {Object} pluggable - an instance of the plugin
	 */
	addPluggable = (pluggable: InAppMessagingProvider): void => {
		if (pluggable && pluggable.getCategory() === 'InAppMessaging') {
			this.pluggables.push(pluggable);
			pluggable.configure({
				disabled: this.config.disabled,
				...this.config[pluggable.getProviderName()],
			});
		}
	};

	removePluggable = (providerName: string): void => {
		const index = this.pluggables.findIndex(
			pluggable => pluggable.getProviderName() === providerName
		);
		if (index === -1) {
			logger.debug(`No plugin found with name ${providerName}`);
		} else {
			this.pluggables.splice(index, 1);
		}
	};

	setInAppMessagesHandler = (
		handler: InAppMessagesHandler
	): InAppMessagesHandler => {
		if (handler && this.inAppMessagesHandler !== handler) {
			this.inAppMessagesHandler = handler;
		}
		return this.inAppMessagesHandler;
	};

	syncInAppMessages = async (): Promise<void> => {
		if (this.config.disabled) {
			logger.debug('InAppMessaging has been disabled');
			return;
		}

		await Promise.all<void>(
			this.pluggables.map(async pluggable => {
				const messages = await pluggable.getInAppMessages();
				const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
				await this.storeMessages(key, messages);
			})
		);
	};

	clearStoredInAppMessages = async (): Promise<void> => {
		logger.debug('clearing In-App Messages');

		await Promise.all<void>(
			this.pluggables.map(async pluggable => {
				const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
				await this.removeMessages(key);
			})
		);
	};

	invokeInAppMessages = async (event: InAppMessagingEvent): Promise<void> => {
		const messages: any[] = await Promise.all<any[]>(
			this.pluggables.map(async pluggable => {
				const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
				const messages = await this.getStoredMessages(key);
				return pluggable.processInAppMessages(messages, event);
			})
		);

		const flattenedMessages = flatten(messages);
		if (flattenedMessages.length) {
			this.inAppMessagesHandler(flattenedMessages);
		}
	};

	private analyticsListener: HubCallback = ({ payload }: HubCapsule) => {
		const { event, data } = payload;
		switch (event) {
			case 'record': {
				this.invokeInAppMessages(data);
				break;
			}
			default:
				break;
		}
	};

	private syncStorage = async (): Promise<void> => {
		const { storage } = this.config;
		try {
			// Only run sync() if it's available (i.e. React Native)
			if (typeof storage.sync === 'function') {
				await storage.sync();
			}
			this.storageSynced = true;
		} catch (err) {
			logger.error('Failed to sync storage', err);
		}
	};

	private getStoredMessages = async (key: string): Promise<any> => {
		try {
			if (!this.storageSynced) {
				await this.syncStorage();
			}
			const { storage } = this.config;
			const storedMessages = storage.getItem(key);
			return storedMessages ? JSON.parse(storedMessages) : [];
		} catch (err) {
			logger.error('Failed to retrieve in-app messages from storage', err);
		}
	};

	private storeMessages = async (
		key: string,
		messages: InAppMessage[]
	): Promise<void> => {
		if (!messages) {
			return;
		}

		try {
			if (!this.storageSynced) {
				await this.syncStorage();
			}
			const { storage } = this.config;
			storage.setItem(key, JSON.stringify(messages));
		} catch (err) {
			logger.error('Failed to store in-app messages', err);
		}
	};

	private removeMessages = async (key: string): Promise<void> => {
		try {
			if (!this.storageSynced) {
				await this.syncStorage();
			}
			const { storage } = this.config;
			storage.removeItem(key);
		} catch (err) {
			logger.error('Failed to remove in-app messages from storage', err);
		}
	};
}

const InAppMessaging = new InAppMessagingClass();

export default InAppMessaging;
Amplify.register(InAppMessaging);
