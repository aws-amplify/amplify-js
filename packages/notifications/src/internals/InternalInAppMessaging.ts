// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify,
	ConsoleLogger as Logger,
	HubCallback,
	HubCapsule,
	Hub,
	StorageHelper,
	CustomUserAgentDetails,
	InAppMessagingAction,
} from '@aws-amplify/core';
import flatten from 'lodash/flatten';

import { addEventListener, EventListener, notifyEventListeners } from '../common';
import { NotificationsConfig, UserInfo } from '../types';
import { AWSPinpointProvider } from '../InAppMessaging/Providers';
import {
	InAppMessage,
	InAppMessageInteractionEvent,
	InAppMessagingInterface,
	InAppMessagingConfig,
	InAppMessageConflictHandler,
	InAppMessagingEvent,
	InAppMessagingProvider,
	OnMessageInteractionEventHandler,
	InternalNotificationsSubCategory,
	NotificationsSubCategory,
} from '../InAppMessaging/types';
import { getUserAgentValue } from './utils';

const STORAGE_KEY_SUFFIX = '_inAppMessages';

const logger = new Logger('Notifications.InAppMessaging');

export class InternalInAppMessagingClass implements InAppMessagingInterface {
	private config: Record<string, any> = {};
	private conflictHandler: InAppMessageConflictHandler;
	private listeningForAnalyticEvents = false;
	private pluggables: InAppMessagingProvider[] = [];
	private storageSynced = false;

	constructor() {
		this.config = { storage: new StorageHelper().getStorage() };
		this.setConflictHandler(this.defaultConflictHandler);
	}

	/**
	 * Configure InAppMessaging
	 * @param {Object} config - InAppMessaging configuration object
	 */
	configure({ Notifications: notificationsConfig }: NotificationsConfig = {}): InAppMessagingConfig {
		const { listenForAnalyticsEvents = true, ...config }: InAppMessagingConfig =
			notificationsConfig?.InAppMessaging || {};

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
	}

	/**
	 * Get the name of this module
	 * @returns {string} name of this module
	 */
	getModuleName(): NotificationsSubCategory | InternalNotificationsSubCategory {
		return 'InternalInAppMessaging';
	}

	/**
	 * Get a plugin from added plugins
	 * @param {string} providerName - the name of the plugin to get
	 */
	getPluggable = (providerName: string): InAppMessagingProvider => {
		const pluggable = this.pluggables.find(pluggable => pluggable.getProviderName() === providerName) ?? null;

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
		if (pluggable && pluggable.getCategory() === 'Notifications' && pluggable.getSubCategory() === 'InAppMessaging') {
			if (this.getPluggable(pluggable.getProviderName())) {
				throw new Error(`Pluggable ${pluggable.getProviderName()} has already been added.`);
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
		const index = this.pluggables.findIndex(pluggable => pluggable.getProviderName() === providerName);
		if (index === -1) {
			logger.debug(`No plugin found with name ${providerName}`);
		} else {
			this.pluggables.splice(index, 1);
		}
	};

	/**
	 * Get the map resources that are currently available through the provider
	 * @param {CustomUserAgentDetails} customUserAgentDetails optional parameter to send user agent details
	 * @returns - Array of available map resources
	 */
	public syncMessages(customUserAgentDetails?: CustomUserAgentDetails): Promise<void[]> {
		return Promise.all<void>(
			this.pluggables.map(async pluggable => {
				try {
					const messages = await pluggable.getInAppMessages(
						getUserAgentValue(InAppMessagingAction.SyncMessages, customUserAgentDetails)
					);
					const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
					await this.setMessages(key, messages);
				} catch (err) {
					logger.error('Failed to sync messages', err);
					throw err;
				}
			})
		);
	}

	public clearMessages(): Promise<void[]> {
		return Promise.all<void>(
			this.pluggables.map(async pluggable => {
				const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
				await this.removeMessages(key);
			})
		);
	}

	public async dispatchEvent(event: InAppMessagingEvent): Promise<void> {
		const messages: InAppMessage[][] = await Promise.all<InAppMessage[]>(
			this.pluggables.map(async pluggable => {
				const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
				const messages = await this.getMessages(key);
				return pluggable.processInAppMessages(messages, event);
			})
		);

		const flattenedMessages = flatten(messages);

		if (flattenedMessages.length) {
			notifyEventListeners(InAppMessageInteractionEvent.MESSAGE_RECEIVED, this.conflictHandler(flattenedMessages));
		}
	}

	public identifyUser(
		userId: string,
		userInfo: UserInfo,
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<void[]> {
		return Promise.all<void>(
			this.pluggables.map(async pluggable => {
				try {
					await pluggable.identifyUser(
						userId,
						userInfo,
						getUserAgentValue(InAppMessagingAction.IdentifyUser, customUserAgentDetails)
					);
				} catch (err) {
					logger.error('Failed to identify user', err);
					throw err;
				}
			})
		);
	}

	onMessageReceived = (handler: OnMessageInteractionEventHandler): EventListener<OnMessageInteractionEventHandler> =>
		addEventListener(InAppMessageInteractionEvent.MESSAGE_RECEIVED, handler);

	onMessageDisplayed = (handler: OnMessageInteractionEventHandler): EventListener<OnMessageInteractionEventHandler> =>
		addEventListener(InAppMessageInteractionEvent.MESSAGE_DISPLAYED, handler);

	onMessageDismissed = (handler: OnMessageInteractionEventHandler): EventListener<OnMessageInteractionEventHandler> =>
		addEventListener(InAppMessageInteractionEvent.MESSAGE_DISMISSED, handler);

	onMessageActionTaken = (handler: OnMessageInteractionEventHandler): EventListener<OnMessageInteractionEventHandler> =>
		addEventListener(InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN, handler);

	notifyMessageInteraction = (message: InAppMessage, type: InAppMessageInteractionEvent): void => {
		notifyEventListeners(type, message);
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

	private setMessages = async (key: string, messages: InAppMessage[]): Promise<void> => {
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

export const InternalInAppMessaging = new InternalInAppMessagingClass();
Amplify.register(InternalInAppMessaging);
