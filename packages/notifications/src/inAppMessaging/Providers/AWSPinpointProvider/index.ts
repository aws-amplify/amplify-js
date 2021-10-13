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
	Credentials,
	getAmplifyUserAgent,
	StorageHelper,
} from '@aws-amplify/core';
import { getCachedUuid as getEndpointId } from '@aws-amplify/cache';
import {
	GetInAppMessagesCommand,
	GetInAppMessagesCommandInput,
	InAppMessageCampaign as PinpointInAppMessage,
	UpdateEndpointCommand,
	UpdateEndpointCommandInput,
	PinpointClient,
} from '@aws-sdk/client-pinpoint';
import { v1 as uuid } from 'uuid';

import { NotificationsCategory } from '../../../types';
import SessionTracker, {
	SessionState,
	SessionStateChangeHandler,
} from '../../SessionTracker';
import {
	InAppMessage,
	InAppMessageLayout,
	InAppMessagingSubCategory,
	InAppMessagingEvent,
	InAppMessagingProvider,
} from '../../types';
import {
	DailyInAppMessageCounter,
	InAppMessageCountMap,
	InAppMessageCounts,
	InAppMessageEvent,
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
	static subCategory: InAppMessagingSubCategory = 'InAppMessaging';
	static providerName = 'AWSPinpoint';

	private config: Record<string, any> = {};
	private endpointUpdated = false;
	private initialized = false;
	private sessionMessageCountMap: InAppMessageCountMap;
	private sessionTracker: SessionTracker;

	constructor() {
		this.sessionMessageCountMap = {};
		this.config = {
			storage: new StorageHelper().getStorage(),
		};
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
		this.config = Object.assign({}, this.config, config);

		this.sessionTracker = new SessionTracker(this.sessionStateChangeHandler);
		this.sessionTracker.start();
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
		const { appId, endpointId, pinpointClient } = this.config;
		try {
			if (!pinpointClient) {
				await this.initPinpointClient();
			}
			if (!this.endpointUpdated) {
				await this.updateEndpoint();
			}
			const input: GetInAppMessagesCommandInput = {
				ApplicationId: appId,
				EndpointId: endpointId,
			};
			const command: GetInAppMessagesCommand = new GetInAppMessagesCommand(
				input
			);
			logger.debug('getting in-app messages', input);
			const response = await this.config.pinpointClient.send(command);
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
		return this.normalizeMessages(
			(messages as PinpointInAppMessage[]).filter(message => {
				return (
					matchesEventType(message, event) &&
					matchesAttributes(message, event) &&
					matchesMetrics(message, event) &&
					isBeforeEndDate(message) &&
					this.isBelowCap(message)
				);
			})
		);
	};

	recordInAppMessageDisplayed = async (messageId: string): Promise<void> => {
		if (!this.initialized) {
			await this.init();
		}
		await this.incrementCounts(messageId);
	};

	private init = async () => {
		const { appId, storage } = this.config;
		const providerName = this.getProviderName();
		const cacheKey = `${providerName}_${appId}`;
		try {
			// Only run sync() if it's available (i.e. React Native)
			if (typeof storage.sync === 'function') {
				await storage.sync();
			}
			this.config.endpointId = await getEndpointId(cacheKey);
			this.initialized = true;
		} catch (err) {
			logger.error(`Failed to initialize ${providerName}`, err);
		}
	};

	private initPinpointClient = async () => {
		const { appId, region } = this.config;

		const credentials = await this.getCredentials();

		if (!appId || !credentials || !region) {
			throw new Error(
				'One or more of credentials, appId or region is not configured'
			);
		}

		this.config.pinpointClient = new PinpointClient({
			region,
			credentials,
			customUserAgent: getAmplifyUserAgent(),
		});
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

	private updateEndpoint = async (): Promise<void> => {
		const { appId, endpointId, pinpointClient } = this.config;
		const input: UpdateEndpointCommandInput = {
			ApplicationId: appId,
			EndpointId: endpointId,
			EndpointRequest: {
				RequestId: uuid(),
				EffectiveDate: new Date().toISOString(),
			},
		};
		const command: UpdateEndpointCommand = new UpdateEndpointCommand(input);
		try {
			logger.debug('updating endpoint', input);
			await pinpointClient.send(command);
			this.endpointUpdated = true;
		} catch (err) {
			throw err;
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
		const that = this;
		return messages.map(message => {
			const { CampaignId, InAppMessage } = message;
			return {
				id: CampaignId,
				content: extractContent(message),
				layout: InAppMessage.Layout as InAppMessageLayout,
				metadata: extractMetadata(message),
				onDisplay() {
					that.recordMessageEvent(
						InAppMessageEvent.MESSAGE_DISPLAYED_EVENT,
						message
					);
				},
				onDismiss() {
					that.recordMessageEvent(
						InAppMessageEvent.MESSAGE_DISMISSED_EVENT,
						message
					);
				},
				onAction() {
					that.recordMessageEvent(
						InAppMessageEvent.MESSAGE_ACTION_EVENT,
						message
					);
				},
			};
		});
	};

	private recordMessageEvent = async (
		event: InAppMessageEvent,
		message: PinpointInAppMessage
	): Promise<void> => {
		if (!this.initialized) {
			await this.init();
		}
		recordAnalyticsEvent(event, message);
		if (event === InAppMessageEvent.MESSAGE_DISPLAYED_EVENT) {
			await this.incrementCounts(message.CampaignId);
		}
	};
}
