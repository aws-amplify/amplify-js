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
	ClientDevice,
	Credentials,
	getAmplifyUserAgent,
	StorageHelper,
	transferKeyToUpperCase,
} from '@aws-amplify/core';
import Cache from '@aws-amplify/cache';
import {
	ChannelType,
	GetInAppMessagesCommand,
	GetInAppMessagesCommandInput,
	InAppMessageCampaign as PinpointInAppMessage,
	UpdateEndpointCommand,
	UpdateEndpointCommandInput,
	PinpointClient,
} from '@aws-sdk/client-pinpoint';
import { v4 as uuid } from 'uuid';

import { addMessageInteractionEventListener } from '../../eventListeners';
import { NotificationsCategory } from '../../../types';
import SessionTracker, {
	SessionState,
	SessionStateChangeHandler,
} from '../../SessionTracker';
import {
	InAppMessage,
	InAppMessageInteractionEvent,
	InAppMessageLayout,
	InAppMessagingEvent,
	InAppMessagingProvider,
	NotificationsSubcategory,
	UserInfo,
} from '../../types';
import {
	AWSPinpointUserInfo,
	DailyInAppMessageCounter,
	InAppMessageCountMap,
	InAppMessageCounts,
	PinpointMessageEvent,
} from './types';
import {
	clearMemo,
	dispatchInAppMessagingEvent,
	extractContent,
	extractMetadata,
	getStartOfDay,
	isBeforeEndDate,
	logger,
	matchesAttributes,
	matchesEventType,
	matchesMetrics,
	recordAnalyticsEvent,
} from './utils';

const MESSAGE_DAILY_COUNT_KEY = 'pinpointProvider_inAppMessages_dailyCount';
const MESSAGE_TOTAL_COUNT_KEY = 'pinpointProvider_inAppMessages_totalCount';

export default class AWSPinpointProvider implements InAppMessagingProvider {
	static category: NotificationsCategory = 'Notifications';
	static subCategory: NotificationsSubcategory = 'InAppMessaging';
	static providerName = 'AWSPinpoint';

	private clientInfo;
	private config: Record<string, any> = {};
	private configured = false;
	private endpointInitialized = false;
	private initialized = false;
	private sessionMessageCountMap: InAppMessageCountMap;
	private sessionTracker: SessionTracker;

	constructor() {
		this.sessionMessageCountMap = {};
		this.config = {
			storage: new StorageHelper().getStorage(),
		};
		this.clientInfo = ClientDevice.clientInfo() ?? {};
	}

	/**
	 * get the category of the plugin
	 */
	getCategory() {
		return AWSPinpointProvider.category;
	}

	/**
	 * get the sub-category of the plugin
	 */
	getSubCategory() {
		return AWSPinpointProvider.subCategory;
	}

	/**
	 * get provider name of the plugin
	 */
	getProviderName(): string {
		return AWSPinpointProvider.providerName;
	}

	configure = (config = {}): object => {
		logger.debug('configure', config);
		this.config = { ...this.config, ...config };

		// some configuration steps should not be re-run even if provider is re-configured for some reason
		if (!this.configured) {
			this.sessionTracker = new SessionTracker(this.sessionStateChangeHandler);
			this.sessionTracker.start();
			// wire up default Pinpoint message event handling
			addMessageInteractionEventListener((message: InAppMessage) => {
				this.recordMessageEvent(
					message,
					PinpointMessageEvent.MESSAGE_DISPLAYED
				);
			}, InAppMessageInteractionEvent.MESSAGE_DISPLAYED);
			addMessageInteractionEventListener((message: InAppMessage) => {
				this.recordMessageEvent(
					message,
					PinpointMessageEvent.MESSAGE_DISMISSED
				);
			}, InAppMessageInteractionEvent.MESSAGE_DISMISSED);
			addMessageInteractionEventListener((message: InAppMessage) => {
				this.recordMessageEvent(
					message,
					PinpointMessageEvent.MESSAGE_ACTION_TAKEN
				);
			}, InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN);
		}

		this.configured = true;
		dispatchInAppMessagingEvent('pinpointProvider_configured', null);
		return this.config;
	};

	getInAppMessages = async () => {
		if (!this.initialized) {
			await this.init();
		}
		// There is no way to granuarly reconcile the filter memoization as the keys are composited from a message id and
		// event properties thus opting to just clear them out when syncing messages rather than leave potentially
		// obsolete entries that will no longer serve any purpose.
		clearMemo();
		try {
			await this.updateEndpoint();
			const { appId, endpointId, pinpointClient } = this.config;
			const input: GetInAppMessagesCommandInput = {
				ApplicationId: appId,
				EndpointId: endpointId,
			};
			const command: GetInAppMessagesCommand = new GetInAppMessagesCommand(
				input
			);
			logger.debug('getting in-app messages', input);
			const response = await pinpointClient.send(command);
			const {
				InAppMessageCampaigns: messages,
			} = response.InAppMessagesResponse;

			dispatchInAppMessagingEvent('syncInAppMessages', messages);
			return messages;
		} catch (err) {
			logger.error('Error syncing in-app messages', err);
		}
	};

	processInAppMessages = async (
		messages: [],
		event: InAppMessagingEvent
	): Promise<InAppMessage[]> => {
		if (!this.initialized) {
			await this.init();
		}
		let highestPrioritySeen;
		return this.normalizeMessages(
			(messages as PinpointInAppMessage[]).reduce((acc, message) => {
				const messageQualifies =
					matchesEventType(message, event) &&
					matchesAttributes(message, event) &&
					matchesMetrics(message, event) &&
					isBeforeEndDate(message) &&
					this.isBelowCap(message);
				// filter all qualifying messages returning only those that are of (relative) highest priority
				if (messageQualifies) {
					// have not yet encountered message with priority
					if (!highestPrioritySeen) {
						// this message has priority, so reset the accumulator with this message only
						if (message.Priority) {
							highestPrioritySeen = message.Priority;
							return [message];
						} else {
							// this message also has no priority, so just add this message to accumulator
							acc.push(message);
						}
						// have previously encountered message with priority, so only messages with priority matter now
					} else if (message.Priority) {
						// this message has higher priority (lower number), so reset the accumulator with this message only
						if (message.Priority < highestPrioritySeen) {
							highestPrioritySeen = message.Priority;
							return [message];
							// this message has the same priority, so just add this message to accumulator
						} else if (message.Priority === highestPrioritySeen) {
							acc.push(message);
						}
					}
				}
				return acc;
			}, [])
		);
	};

	identifyUser = async (userId: string, userInfo: UserInfo): Promise<void> => {
		if (!this.initialized) {
			await this.init();
		}
		try {
			await this.updateEndpoint(userId, userInfo);
		} catch (err) {
			logger.error('Error identifying user', err);
		}
	};

	private init = async () => {
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
			logger.error(`Failed to initialize ${providerName}`, err);
		}
	};

	private initPinpointClient = async () => {
		const { appId, credentials, pinpointClient, region } = this.config;

		if (!appId || !credentials || !region) {
			throw new Error(
				'One or more of credentials, appId or region is not configured'
			);
		}

		if (pinpointClient) {
			pinpointClient.destroy();
		}

		this.config.pinpointClient = new PinpointClient({
			region,
			credentials,
			customUserAgent: getAmplifyUserAgent(),
		});
	};

	private getEndpointId = async () => {
		const { appId } = this.config;
		// Each Pinpoint channel requires its own Endpoint ID
		const cacheKey = `${this.getSubCategory()}:${this.getProviderName()}:${appId}`;
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

	private updateEndpoint = async (
		userId: string = null,
		userInfo: AWSPinpointUserInfo = null
	) => {
		const {
			appId,
			credentials,
			endpointId,
			endpointInfo = {},
			pinpointClient,
		} = this.config;
		const currentCredentials = await this.getCredentials();
		// Shallow compare to determine if credentials stored here are outdated
		const credentialsUpdated =
			!credentials ||
			Object.keys(currentCredentials).some(
				key => currentCredentials[key] !== credentials[key]
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
		this.config.credentials = currentCredentials;
		try {
			// Initialize a new pinpoint client if one isn't already configured or if credentials changed
			if (!pinpointClient || credentialsUpdated) {
				await this.initPinpointClient();
			}
			const { address, attributes, demographic, location, metrics, optOut } =
				userInfo ?? {};
			const { appVersion, make, model, platform, version } = this.clientInfo;
			// Create the UpdateEndpoint input, prioritizing passed in user info and falling back to
			// defaults (if any) obtained from the config
			const input: UpdateEndpointCommandInput = {
				ApplicationId: appId,
				EndpointId: endpointId,
				EndpointRequest: {
					RequestId: uuid(),
					EffectiveDate: new Date().toISOString(),
					ChannelType: ChannelType.IN_APP,
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
						UserId:
							userId ?? endpointInfo.userId ?? currentCredentials.identityId,
						UserAttributes: attributes ?? endpointInfo.userAttributes,
					},
				},
			};
			const command: UpdateEndpointCommand = new UpdateEndpointCommand(input);
			logger.debug('updating endpoint', input);
			await this.config.pinpointClient.send(command);
			this.endpointInitialized = true;
		} catch (err) {
			throw err;
		}
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
			logger.error('Error getting credentials:', err);
			return null;
		}
	};

	private sessionStateChangeHandler: SessionStateChangeHandler = (
		state: SessionState
	) => {
		if (state === 'started') {
			// reset all session counts
			this.sessionMessageCountMap = {};
		}
	};

	private isBelowCap = ({
		CampaignId,
		SessionCap,
		DailyCap,
		TotalCap,
	}: PinpointInAppMessage): boolean => {
		const { sessionCount, dailyCount, totalCount } = this.getMessageCounts(
			CampaignId
		);
		if (
			!(sessionCount && SessionCap) &&
			!(dailyCount && DailyCap) &&
			!(totalCount && TotalCap)
		) {
			return true;
		}
		return (
			sessionCount < SessionCap &&
			dailyCount < DailyCap &&
			totalCount < TotalCap
		);
	};

	// Use the current session count in memory or initialize as empty count
	private getSessionCount = (messageId: string): number =>
		this.sessionMessageCountMap[messageId] || 0;

	private getDailyCount = (): number => {
		const { storage } = this.config;
		const today = getStartOfDay();
		const item = storage.getItem(MESSAGE_DAILY_COUNT_KEY);
		// Parse stored count or initialize as empty count
		const counter: DailyInAppMessageCounter = item
			? JSON.parse(item)
			: { count: 0, lastCountTimestamp: today };
		// If the stored counter timestamp is today, use it as the count, otherwise reset to 0
		return counter.lastCountTimestamp === today ? counter.count : 0;
	};

	private getTotalCountMap = (): InAppMessageCountMap => {
		const { storage } = this.config;
		const item = storage.getItem(MESSAGE_TOTAL_COUNT_KEY);
		// Parse stored count map or initialize as empty
		return item ? JSON.parse(item) : {};
	};

	private getTotalCount = (messageId: string): number => {
		const countMap = this.getTotalCountMap();
		// Return stored count or initialize as empty count
		return countMap[messageId] || 0;
	};

	private getMessageCounts = (messageId: string): InAppMessageCounts => {
		try {
			return {
				sessionCount: this.getSessionCount(messageId),
				dailyCount: this.getDailyCount(),
				totalCount: this.getTotalCount(messageId),
			};
		} catch (err) {
			logger.error('Failed to get message counts from storage', err);
		}
	};

	private setSessionCount = (messageId: string, count: number): void => {
		this.sessionMessageCountMap[messageId] = count;
	};

	private setDailyCount = (count: number): void => {
		const { storage } = this.config;
		const dailyCount: DailyInAppMessageCounter = {
			count,
			lastCountTimestamp: getStartOfDay(),
		};
		try {
			storage.setItem(MESSAGE_DAILY_COUNT_KEY, JSON.stringify(dailyCount));
		} catch (err) {
			logger.error('Failed to save daily message count to storage', err);
		}
	};

	private setTotalCountMap = (countMap: InAppMessageCountMap): void => {
		const { storage } = this.config;
		try {
			storage.setItem(MESSAGE_TOTAL_COUNT_KEY, JSON.stringify(countMap));
		} catch (err) {
			logger.error('Failed to save total count to storage', err);
		}
	};

	private setTotalCount = (messageId: string, count: number): void => {
		const updatedMap = {
			...this.getTotalCountMap(),
			[messageId]: count,
		};
		this.setTotalCountMap(updatedMap);
	};

	private incrementCounts = async (messageId: string): Promise<void> => {
		const { sessionCount, dailyCount, totalCount } = this.getMessageCounts(
			messageId
		);
		this.setSessionCount(messageId, sessionCount + 1);
		this.setDailyCount(dailyCount + 1);
		this.setTotalCount(messageId, totalCount + 1);
	};

	private normalizeMessages = (
		messages: PinpointInAppMessage[]
	): InAppMessage[] => {
		return messages.map(message => {
			const { CampaignId, InAppMessage } = message;
			return {
				id: CampaignId,
				content: extractContent(message),
				layout: InAppMessage.Layout as InAppMessageLayout,
				metadata: extractMetadata(message),
			};
		});
	};

	private recordMessageEvent = async (
		message: InAppMessage,
		event: PinpointMessageEvent
	): Promise<void> => {
		if (!this.initialized) {
			await this.init();
		}
		recordAnalyticsEvent(event, message);
		if (event === PinpointMessageEvent.MESSAGE_DISPLAYED) {
			await this.incrementCounts(message.id);
		}
	};
}
