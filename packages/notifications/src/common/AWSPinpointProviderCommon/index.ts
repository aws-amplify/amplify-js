// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Category,
	ClientDevice,
	ConsoleLogger,
	CustomUserAgentDetails,
	getAmplifyUserAgent,
	InAppMessagingAction,
	PushNotificationAction,
} from '@aws-amplify/core/internals/utils';
import { fetchAuthSession } from '@aws-amplify/core';

import {
	Event as AWSPinpointAnalyticsEvent,
	putEvents,
	PutEventsInput,
} from '@aws-amplify/core/internals/aws-clients/pinpoint';
import { v4 as uuid } from 'uuid';

import {
	NotificationsCategory,
	NotificationsSubCategory,
	NotificationsProvider,
} from '../../types';

export default abstract class AWSPinpointProviderCommon
	implements NotificationsProvider
{
	static category: NotificationsCategory = 'Notifications';
	static providerName = 'AWSPinpoint';

	protected clientInfo;
	protected config: Record<string, any> = {};
	protected endpointInitialized = false;
	protected initialized = false;
	protected logger: ConsoleLogger;

	constructor(logger) {
		// this.config = { storage: new StorageHelper().getStorage() };
		this.clientInfo = ClientDevice.clientInfo() ?? {};
		this.logger = logger;
	}

	/**
	 * get the category of the plugin
	 */
	getCategory() {
		return AWSPinpointProviderCommon.category;
	}

	/**
	 * get the sub-category of the plugin
	 */
	abstract getSubCategory(): NotificationsSubCategory;

	/**
	 * get provider name of the plugin
	 */
	getProviderName(): string {
		return AWSPinpointProviderCommon.providerName;
	}

	configure(config = {}): Record<string, any> {
		this.config = { ...this.config, ...config };
		this.logger.debug(
			`configure ${this.getProviderName()}${this.getSubCategory()}Provider`,
			this.config
		);
		return this.config;
	}

	protected init = async (): Promise<void> => {
		const { endpointId, storage } = this.config;
		const providerName = this.getProviderName();
		try {
			// Only run sync() if it's available (i.e. React Native)
			if (typeof storage.sync === 'function') {
				await storage.sync();
			}
			this.initialized = true;
		} catch (err) {
			this.logger.error(`Failed to initialize ${providerName}`, err);
		}
	};

	private getUserAgentValue = (): string => {
		let customUserAgentDetails: CustomUserAgentDetails;
		if (this.getSubCategory() === 'PushNotification') {
			customUserAgentDetails = {
				category: Category.PushNotification,
				action: PushNotificationAction.None,
			};
		} else {
			customUserAgentDetails = {
				category: Category.InAppMessaging,
				action: InAppMessagingAction.IdentifyUser,
			};
		}

		return getAmplifyUserAgent(customUserAgentDetails);
	};

	protected recordAnalyticsEvent = async (
		event: AWSPinpointAnalyticsEvent
	): Promise<void> => {
		// Update credentials
		this.config.credentials = await this.getCredentials();
		// Assert required configuration properties to make `putEvents` request are present
		this.assertNotEmptyConfiguration();
		const { appId, credentials, endpointId, region } = this.config;

		try {
			// Create the PutEvents input
			const input: PutEventsInput = {
				ApplicationId: appId,
				EventsRequest: {
					BatchItem: {
						[endpointId]: {
							Endpoint: {},
							Events: {
								[uuid()]: event,
							},
						},
					},
				},
			};
			this.logger.debug('recording analytics event');
			await putEvents(
				{ credentials, region, userAgentValue: this.getUserAgentValue() },
				input
			);
		} catch (err) {
			this.logger.error('Error recording analytics event', err);
			throw err;
		}
	};

	private getCredentials = async () => {
		try {
			const session = await fetchAuthSession();
			if (!session.credentials) {
				this.logger.debug('no credentials found');
				return null;
			}
			return { ...session.credentials, identityId: session.identityId };
		} catch (err) {
			this.logger.error('Error getting credentials:', err);
			return null;
		}
	};

	private assertNotEmptyConfiguration = () => {
		const { appId, credentials, region } = this.config;
		if (!appId || !credentials || !region) {
			throw new Error(
				'One or more of credentials, appId or region is not configured'
			);
		}
	};

	/**
	 * transfer the first letter of the keys to lowercase
	 * @param {Object} obj - the object need to be transferred
	 */
	private transferKeyToUpperCase = (obj: Record<string, any>) => {
		const ret: Record<string, any> = {};

		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const transferredKey = key[0].toUpperCase() + key.slice(1);
				ret[transferredKey] = this.transferKeyToUpperCase(obj[key]);
			}
		}
		return ret;
	};
}
