// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ConsoleLogger as Logger,
	HubCallback,
	HubCapsule,
	Hub,
	StorageHelper,
} from '@aws-amplify/core';
import flatten from 'lodash/flatten';
import { AWSPinpointProvider } from './Providers';
import {
	addMessageInteractionEventListener,
	notifyMessageInteractionEventListeners,
} from './eventListeners';
import {
	InAppMessage,
	InAppMessageInteractionEvent,
	InAppMessagingConfig,
	InAppMessageConflictHandler,
	InAppMessagingEvent,
	InAppMessagingProvider,
	NotificationsSubcategory,
	OnMessageInteractionEventHandler,
	OnMessageInteractionEventListener,
	UserInfo,
} from './types';

const STORAGE_KEY_SUFFIX = '_inAppMessages';

const logger = new Logger('Notifications.InAppMessaging');

export default class InAppMessaging {
	private config: Record<string, any> = {};
	private conflictHandler: InAppMessageConflictHandler;
	private listeningForAnalyticEvents = false;
	private pluggables: InAppMessagingProvider[] = [];
	private storageSynced = false;

	constructor() {
		this.config = {
			storage: new StorageHelper().getStorage(),
		};
		this.setConflictHandler(this.defaultConflictHandler);
	}

	/**
	 * Configure InAppMessaging
	 * @param {Object} config - InAppMessaging configuration object
	 */
	configure = ({
		listenForAnalyticsEvents = true,
		...config
	}: InAppMessagingConfig = {}): InAppMessagingConfig => {
		this.config = { ...this.config, ...config };

		logger.debug('configure InAppMessaging', this.config);

		this.pluggables.forEach(pluggable => {
			pluggable.configure(this.config[pluggable.getProviderName()]);
		});

		if (this.pluggables.length === 0) {
			this.addPluggable(new AWSPinpointProvider());
		}

		if (listenForAnalyticsEvents && !this.listeningForAnalyticEvents) {
			Hub.listen('analytics', this.analyticsListener);
			this.listeningForAnalyticEvents = true;
		}

		return this.config;
	};

	/**
	 * Get the name of this module
	 * @returns {string} name of this module
	 */
	getModuleName(): NotificationsSubcategory {
		return 'InAppMessaging';
	}

	/**
	 * Get a plugin from added plugins
	 * @param {string} providerName - the name of the plugin to get
	 */
	getPluggable = (providerName: string): InAppMessagingProvider => {
		const pluggable =
			this.pluggables.find(
				pluggable => pluggable.getProviderName() === providerName
			) ?? null;

		if (!pluggable) {
			logger.debug(`No plugin found with name ${providerName}`);
		}

		return pluggable;
	};

	/**
	 * Add plugin into InAppMessaging
	 * @param {InAppMessagingProvider} pluggable - an instance of the plugin
	 */
	addPluggable = (pluggable: InAppMessagingProvider): void => {
		if (
			pluggable &&
			pluggable.getCategory() === 'Notifications' &&
			pluggable.getSubCategory() === 'InAppMessaging'
		) {
			if (this.getPluggable(pluggable.getProviderName())) {
				throw new Error(
					`Pluggable ${pluggable.getProviderName()} has already been added.`
				);
			}
			this.pluggables.push(pluggable);
			pluggable.configure(this.config[pluggable.getProviderName()]);
		}
	};

	/**
	 * Remove a plugin from added plugins
	 * @param {string} providerName - the name of the plugin to remove
	 */
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

	/**
	 * Get the map resources that are currently available through the provider
	 * @param {string} provider
	 * @returns - Array of available map resources
	 */
	syncMessages = (): Promise<void[]> =>
		Promise.all<void>(
			this.pluggables.map(async pluggable => {
				try {
					const messages = await pluggable.getInAppMessages();
					const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
					await this.setMessages(key, messages);
				} catch (err) {
					logger.error('Failed to sync messages', err);
					throw err;
				}
			})
		);

	clearMessages = (): Promise<void[]> =>
		Promise.all<void>(
			this.pluggables.map(async pluggable => {
				const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
				await this.removeMessages(key);
			})
		);

	dispatchEvent = async (event: InAppMessagingEvent): Promise<void> => {
		const messages: InAppMessage[][] = await Promise.all<InAppMessage[]>(
			this.pluggables.map(async pluggable => {
				const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
				const messages = await this.getMessages(key);
				return pluggable.processInAppMessages(messages, event);
			})
		);

		const flattenedMessages = flatten(messages);

		if (flattenedMessages.length) {
			notifyMessageInteractionEventListeners(
				this.conflictHandler(flattenedMessages),
				InAppMessageInteractionEvent.MESSAGE_RECEIVED
			);
		}
	};

	identifyUser = (userId: string, userInfo: UserInfo): Promise<void[]> =>
		Promise.all<void>(
			this.pluggables.map(async pluggable => {
				try {
					await pluggable.identifyUser(userId, userInfo);
				} catch (err) {
					logger.error('Failed to identify user', err);
					throw err;
				}
			})
		);

	onMessageReceived = (
		handler: OnMessageInteractionEventHandler
	): OnMessageInteractionEventListener =>
		addMessageInteractionEventListener(
			handler,
			InAppMessageInteractionEvent.MESSAGE_RECEIVED
		);

	onMessageDisplayed = (
		handler: OnMessageInteractionEventHandler
	): OnMessageInteractionEventListener =>
		addMessageInteractionEventListener(
			handler,
			InAppMessageInteractionEvent.MESSAGE_DISPLAYED
		);

	onMessageDismissed = (
		handler: OnMessageInteractionEventHandler
	): OnMessageInteractionEventListener =>
		addMessageInteractionEventListener(
			handler,
			InAppMessageInteractionEvent.MESSAGE_DISMISSED
		);

	onMessageActionTaken = (
		handler: OnMessageInteractionEventHandler
	): OnMessageInteractionEventListener =>
		addMessageInteractionEventListener(
			handler,
			InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN
		);

	notifyMessageInteraction = (
		message: InAppMessage,
		event: InAppMessageInteractionEvent
	): void => {
		notifyMessageInteractionEventListeners(message, event);
	};

	setConflictHandler = (handler: InAppMessageConflictHandler): void => {
		this.conflictHandler = handler;
	};

	private analyticsListener: HubCallback = ({ payload }: HubCapsule) => {
		const { event, data } = payload;
		switch (event) {
			case 'record': {
				this.dispatchEvent(data);
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

	private getMessages = async (key: string): Promise<any> => {
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

	private setMessages = async (
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

	private defaultConflictHandler = (messages: InAppMessage[]): InAppMessage => {
		// default behavior is to return the message closest to expiry
		// this function assumes that messages processed by providers already filters out expired messages
		const sorted = messages.sort((a, b) => {
			const endDateA = a.metadata?.endDate;
			const endDateB = b.metadata?.endDate;
			// if both message end dates are falsy or have the same date string, treat them as equal
			if (endDateA === endDateB) {
				return 0;
			}
			// if only message A has an end date, treat it as closer to expiry
			if (endDateA && !endDateB) {
				return -1;
			}
			// if only message B has an end date, treat it as closer to expiry
			if (!endDateA && endDateB) {
				return 1;
			}
			// otherwise, compare them
			return new Date(endDateA) < new Date(endDateB) ? -1 : 1;
		});
		// always return the top sorted
		return sorted[0];
	};
}
