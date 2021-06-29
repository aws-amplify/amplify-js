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
import { AWSPinpointProvider } from './Providers';
import {
	AppMessage,
	EventValidatedHandler,
	NotificationEvent,
	NotificationsCategory,
	NotificationsConfig,
	NotificationsProvider,
	ValidateEventOptions,
	InAppMessage,
} from './types';

const STORAGE_KEY_SUFFIX = '_notificationKey';
const noop = () => {};

const logger = new Logger('NotificationsClass');

class NotificationsClass {
	private _config: Record<string, any> = {};
	private _disabled: boolean = false;
	private _eventValidatedHandler: EventValidatedHandler = noop;
	private _listeningForAnalyticEvents: boolean = false;
	private _pluggables: NotificationsProvider[] = [];

	configure = ({
		listenForAnalyticsEvents = true,
		eventValidatedHandler,
		...config
	}: NotificationsConfig = {}) => {
		this._config = {
			...parseMobileHubConfig(config).Analytics,
			...this._config,
		};

		logger.debug('configure Notifications', config);

		this._eventValidatedHandler = this.setMessageValidatedHandler(
			eventValidatedHandler
		);

		this._pluggables.forEach(pluggable => {
			// for backward compatibility
			const providerConfig =
				pluggable.getProviderName() === 'AWSPinpoint' &&
				!this._config['AWSPinpoint']
					? this._config
					: this._config[pluggable.getProviderName()];

			pluggable.configure({
				disabled: this._config['disabled'],
				autoSessionRecord: this._config['autoSessionRecord'], // copied over, does not do anything currently
				...providerConfig,
			});
		});

		if (this._pluggables.length === 0) {
			this.addPluggable(new AWSPinpointProvider());
		}

		if (!this._listeningForAnalyticEvents) {
			Hub.listen('analytics', this.analyticsListener);
			this._listeningForAnalyticEvents = true;
		}
	};

	getModuleName(): NotificationsCategory {
		return 'Notifications';
	}

	getPluggable = (providerName: string): NotificationsProvider => {
		const pluggable =
			this._pluggables.find(
				pluggable => pluggable.getProviderName() === providerName
			) || null;

		if (!pluggable) {
			logger.debug(`No plugin found with name ${providerName}`);
		}

		return pluggable;
	};

	removePluggable = (providerName: string) => {
		const index = this._pluggables.findIndex(
			pluggable => pluggable.getProviderName() === providerName
		);
		if (index === -1) {
			logger.debug(`No plugin found with name ${providerName}`);
		} else {
			this._pluggables.splice(index, 1);
		}
	};

	invokeMessage = async (
		event: NotificationEvent,
		{ validator }: ValidateEventOptions = {}
	) => {
		const messages: any[] = await Promise.all<any[]>(
			this._pluggables.map(async pluggable => {
				const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
				const messages = await this._getStoredMessages(key);
				return this.filterMessages(messages, event);
			})
		);
		// Since there is only one notification provider, just send back the result of that promise for now
		if (messages[0]) {
			this._eventValidatedHandler(messages[0]);
		}
	};

	setMessageValidatedHandler = (
		handler: EventValidatedHandler
	): EventValidatedHandler => {
		if (this._eventValidatedHandler === noop && handler) {
			this._eventValidatedHandler = handler;
		}
		return this._eventValidatedHandler;
	};

	private analyticsListener: HubCallback = ({ payload }: HubCapsule) => {
		const { event, data } = payload;
		switch (event) {
			case 'record': {
				this.invokeMessage(data);
				break;
			}
			default:
				break;
		}
	};

	private async _getStoredMessages(key: string) {
		try {
			const storedMessages = await AsyncStorage.getItem(key);
			return JSON.parse(storedMessages);
		} catch (err) {
			logger.debug(`Unable to retrieve locally stored messages: ${err}`);
		}
	}

	/**
	 * add plugin into Analytics category
	 * @param {Object} pluggable - an instance of the plugin
	 */
	public addPluggable(pluggable: NotificationsProvider) {
		if (pluggable && pluggable.getCategory() === 'Notifications') {
			this._pluggables.push(pluggable);
			// for backward compatibility
			const providerConfig =
				pluggable.getProviderName() === 'AWSPinpoint' &&
				!this._config['AWSPinpoint']
					? this._config
					: this._config[pluggable.getProviderName()];
			const config = { disabled: this._config['disabled'], ...providerConfig };
			pluggable.configure(config);
			return config;
		}
	}

	syncInAppMessages = async (providerName = 'AWSPinpoint'): Promise<any> => {
		if (this._disabled) {
			logger.debug('Notifications has been disabled');
			return;
		}

		const pluggable = this.getPluggable(providerName);
		const messages = await pluggable.syncInAppMessages();
		const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
		await this.storeMessages(key, messages);
		return messages;
	};

	private async storeMessages(key: string, messages: InAppMessage[]) {
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
	}

	private filterMessages = (
		messages: AppMessage[],
		{ attributes, metrics, name }: NotificationEvent
	): AppMessage[] =>
		messages
			.filter(({ Schedule }) => {
				const isCorrectEventType =
					Schedule &&
					Schedule.EventFilter &&
					Schedule.EventFilter.Dimensions &&
					Schedule.EventFilter.Dimensions.EventType &&
					Schedule.EventFilter.Dimensions.EventType.Values &&
					Schedule.EventFilter.Dimensions.EventType.Values.includes(name);

				if (!isCorrectEventType) {
					return;
				}

				const now = new Date();
				const endDate = Schedule.EndDate ? new Date(Schedule.EndDate) : null;
				const isBeforeEndDate = endDate ? now < endDate : true;

				return isBeforeEndDate;
			})
			.sort((a, b) => {
				if (a.Priority === b.Priority) {
					return 0;
				}
				return a.Priority > b.Priority ? 1 : -1;
			});
}

const Notifications = new NotificationsClass();

export default Notifications;
Amplify.register(Notifications);
