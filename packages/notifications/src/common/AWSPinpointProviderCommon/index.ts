// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Category,
	ClientDevice,
	ConsoleLogger,
	Credentials,
	CustomUserAgentDetails,
	getAmplifyUserAgent,
	InAppMessagingAction,
	PushNotificationAction,
	StorageHelper,
	transferKeyToUpperCase,
} from '@aws-amplify/core';
import { Cache } from '@aws-amplify/cache';
import {
	Event as AWSPinpointAnalyticsEvent,
	putEvents,
	PutEventsInput,
	updateEndpoint,
	UpdateEndpointInput,
} from '@aws-amplify/core/internals/aws-clients/pinpoint';
import { v4 as uuid } from 'uuid';

import {
	NotificationsCategory,
	NotificationsSubCategory,
	NotificationsProvider,
	UserInfo,
} from '../../types';
import { AWSPinpointUserInfo } from './types';

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
		this.config = { storage: new StorageHelper().getStorage() };
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

	identifyUser = async (userId: string, userInfo: UserInfo): Promise<void> => {
		if (!this.initialized) {
			await this.init();
		}
		try {
			await this.updateEndpoint(userId, userInfo);
		} catch (err) {
			this.logger.error('Error identifying user', err);
			throw err;
		}
	};

	protected init = async (): Promise<void> => {
		const { endpointId, storage } = this.config;
		const providerName = this.getProviderName();
		try {
			// Only run sync() if it's available (i.e. React Native)
			if (typeof storage.sync === 'function') {
				await storage.sync();
			}
			// If an endpoint was not provided via configuration, try to get it from cache
			if (!endpointId) {
				this.config.endpointId = await this.getEndpointId();
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
				action: InAppMessagingAction.None,
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

	protected updateEndpoint = async (
		userId: string = null,
		userInfo: AWSPinpointUserInfo = null
	): Promise<void> => {
		const credentials = await this.getCredentials();
		// Shallow compare to determine if credentials stored here are outdated
		const credentialsUpdated =
			!this.config.credentials ||
			Object.keys(credentials).some(
				key => credentials[key] !== this.config.credentials[key]
			);
		// If endpoint is already initialized, and nothing else is changing, just early return
		if (
			this.endpointInitialized &&
			!credentialsUpdated &&
			!userId &&
			!userInfo
		) {
			return;
		}
		// Update credentials
		this.config.credentials = credentials;
		// Assert required configuration properties to make `updateEndpoint` request are present
		this.assertNotEmptyConfiguration();
		const { appId, endpointId, endpointInfo = {}, region } = this.config;
		try {
			const { address, attributes, demographic, location, metrics, optOut } =
				userInfo ?? {};
			const { appVersion, make, model, platform, version } = this.clientInfo;
			// Create the UpdateEndpoint input, prioritizing passed in user info and falling back to
			// defaults (if any) obtained from the config
			const input: UpdateEndpointInput = {
				ApplicationId: appId,
				EndpointId: endpointId,
				EndpointRequest: {
					RequestId: uuid(),
					EffectiveDate: new Date().toISOString(),
					ChannelType: endpointInfo.channelType,
					Address: address ?? endpointInfo.address,
					Attributes: {
						...endpointInfo.attributes,
						...attributes,
					},
					Demographic: {
						AppVersion: appVersion,
						Make: make,
						Model: model,
						ModelVersion: version,
						Platform: platform,
						...transferKeyToUpperCase({
							...endpointInfo.demographic,
							...demographic,
						}),
					},
					Location: transferKeyToUpperCase({
						...endpointInfo.location,
						...location,
					}),
					Metrics: {
						...endpointInfo.metrics,
						...metrics,
					},
					OptOut: optOut ?? endpointInfo.optOut,
					User: {
						UserId: userId ?? endpointInfo.userId ?? credentials.identityId,
						UserAttributes: attributes ?? endpointInfo.userAttributes,
					},
				},
			};
			this.logger.debug('updating endpoint');
			await updateEndpoint(
				{ credentials, region, userAgentValue: this.getUserAgentValue() },
				input
			);
			this.endpointInitialized = true;
		} catch (err) {
			throw err;
		}
	};

	private getEndpointId = async (): Promise<string> => {
		const { appId } = this.config;
		// Each Pinpoint channel requires its own Endpoint ID
		// However, Push will share the Analytics endpoint for now so as to not break existing customers
		const cacheKey =
			this.getSubCategory() === 'PushNotification'
				? `${this.getProviderName()}_${appId}`
				: `${this.getSubCategory()}:${this.getProviderName()}:${appId}`;
		// First attempt to retrieve the ID from cache
		const cachedEndpointId = await Cache.getItem(cacheKey);
		// Found in cache, just return it
		if (cachedEndpointId) {
			return cachedEndpointId;
		}
		// Otherwise, generate a new ID and store it in long-lived cache before returning it
		const endpointId = uuid();
		// Set a longer TTL to avoid endpoint id being deleted after the default TTL (3 days)
		// Also set its priority to the highest to reduce its chance of being deleted when cache is full
		const ttl = 1000 * 60 * 60 * 24 * 365 * 100; // 100 years
		const expiration = new Date().getTime() + ttl;
		Cache.setItem(cacheKey, endpointId, {
			expires: expiration,
			priority: 1,
		});
		return endpointId;
	};

	private getCredentials = async () => {
		try {
			const credentials = await Credentials.get();
			if (!credentials) {
				this.logger.debug('no credentials found');
				return null;
			}
			return Credentials.shear(credentials);
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
}
