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
} from '@aws-amplify/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
	private disabled: boolean = false;
	private filteredInAppMessagesHandler: FilteredInAppMessagesHandler = noop;
	private listeningForAnalyticEvents: boolean = false;
	private pluggables: NotificationsProvider[] = [];

	configure = ({
		listenForAnalyticsEvents = true,
		filteredInAppMessagesHandler,
		...config
	}: NotificationsConfig = {}) => {
		this.config = {
			...parseMobileHubConfig(config).Analytics, // TODO: needs to be updated
			...config,
		};

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

		if (!this.listeningForAnalyticEvents) {
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
		if (this.disabled) {
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
			await AsyncStorage.removeItem(key);
		} catch (e) {
			logger.error(`Removal of stored In-App Messages failed: ${e}`);
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

	private getStoredMessages = async (key: string): Promise<any> => {
		try {
			const storedMessages = await AsyncStorage.getItem(key);
			return JSON.parse(storedMessages);
		} catch (err) {
			logger.debug(`Unable to retrieve locally stored messages: ${err}`);
		}
	};

	private storeMessages = async (
		key: string,
		messages: InAppMessage[]
	): Promise<void> => {
		if (!messages) {
			logger.debug('no messages :(');
			return;
		}

		try {
			await AsyncStorage.setItem(key, JSON.stringify(messages));
		} catch (e) {
			// TODO: Add error handling
			console.warn(e);
		}
	};
}

const Notifications = new NotificationsClass();

export default Notifications;
Amplify.register(Notifications);
