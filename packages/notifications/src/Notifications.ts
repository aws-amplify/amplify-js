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
	FilteredInAppMessagesHandler,
	InAppMessage,
	NotificationEvent,
	NotificationsCategory,
	NotificationsConfig,
	NotificationsProvider,
} from './types';

const STORAGE_KEY_SUFFIX = '_inAppMessages';

const logger = new Logger('Notifications');

class NotificationsClass {
	private config: Record<string, any> = {};
	private filteredInAppMessagesHandler: FilteredInAppMessagesHandler = noop;
	private listeningForAnalyticEvents = false;
	private pluggables: NotificationsProvider[] = [];
	private storageSynced = false;

	constructor() {
		this.config = {
			storage: new StorageHelper().getStorage(),
		};
	}

	configure = ({
		listenForAnalyticsEvents = true,
		filteredInAppMessagesHandler,
		...config
	}: NotificationsConfig = {}) => {
		// TODO: parseMobileHubConfig call needs to be updated with notifications config
		this.config = Object.assign(
			{},
			this.config,
			parseMobileHubConfig(config).Analytics,
			config
		);

		logger.debug('configure Notifications', config);

		this.filteredInAppMessagesHandler = this.setFilteredInAppMessagesHandler(
			filteredInAppMessagesHandler
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

	getModuleName(): NotificationsCategory {
		return 'Notifications';
	}

	getPluggable = (providerName: string): NotificationsProvider => {
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
	 * add plugin into Analytics category
	 * @param {Object} pluggable - an instance of the plugin
	 */
	addPluggable = (pluggable: NotificationsProvider): any => {
		if (pluggable && pluggable.getCategory() === 'Notifications') {
			this.pluggables.push(pluggable);
			// for backward compatibility
			const providerConfig =
				pluggable.getProviderName() === 'AWSPinpoint' &&
				!this.config['AWSPinpoint']
					? this.config
					: this.config[pluggable.getProviderName()];
			const config = { disabled: this.config['disabled'], ...providerConfig };
			pluggable.configure(config);
			return config;
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

	setFilteredInAppMessagesHandler = (
		handler: FilteredInAppMessagesHandler
	): FilteredInAppMessagesHandler => {
		if (this.filteredInAppMessagesHandler === noop && handler) {
			this.filteredInAppMessagesHandler = handler;
		}
		return this.filteredInAppMessagesHandler;
	};

	syncInAppMessages = async (providerName = 'AWSPinpoint'): Promise<any> => {
		if (this.config.disabled) {
			logger.debug('Notifications has been disabled');
			return;
		}

		const pluggable = this.getPluggable(providerName);
		const messages = await pluggable.syncInAppMessages();
		const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
		await this.storeMessages(key, messages);
		return messages;
	};

	clearStoredInAppMessages = async (
		providerName = 'AWSPinpoint'
	): Promise<void> => {
		logger.debug('Remove stored In-App Messages');

		const pluggable = this.getPluggable(providerName);
		const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;

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

	invokeInAppMessages = async (event: NotificationEvent): Promise<void> => {
		const messages: any[] = await Promise.all<any[]>(
			this.pluggables.map(async pluggable => {
				const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
				const messages = await this.getStoredMessages(key);
				return pluggable.filterMessages(messages, event);
			})
		);
		this.filteredInAppMessagesHandler(flatten(messages));
	};

	recordInAppMessageDisplayed = async (messageId: string): Promise<void[]> => {
		return Promise.all(
			this.pluggables.map(pluggable =>
				pluggable.recordInAppMessageDisplayed(messageId)
			)
		);
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
			return JSON.parse(storedMessages);
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
}

const Notifications = new NotificationsClass();

export default Notifications;
Amplify.register(Notifications);
