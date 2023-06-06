// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getInAppMessages,
	GetInAppMessagesInput,
	GetInAppMessagesOutput,
	InAppMessageCampaign as PinpointInAppMessage,
} from '@aws-amplify/core/internals/aws-clients/pinpoint';

import { addEventListener, AWSPinpointProviderCommon } from '../../../common';
import SessionTracker, {
	SessionState,
	SessionStateChangeHandler,
} from '../../SessionTracker';
import {
	InAppMessage,
	InAppMessageInteractionEvent,
	InAppMessagingEvent,
	InAppMessagingProvider,
	NotificationsSubCategory,
} from '../../types';
import {
	AWSPinpointMessageEvent,
	DailyInAppMessageCounter,
	InAppMessageCountMap,
	InAppMessageCounts,
} from './types';
import {
	clearMemo,
	dispatchInAppMessagingEvent,
	extractContent,
	extractMetadata,
	getStartOfDay,
	interpretLayout,
	isBeforeEndDate,
	logger,
	matchesAttributes,
	matchesEventType,
	matchesMetrics,
	recordAnalyticsEvent,
} from './utils';

const MESSAGE_DAILY_COUNT_KEY = 'pinpointProvider_inAppMessages_dailyCount';
const MESSAGE_TOTAL_COUNT_KEY = 'pinpointProvider_inAppMessages_totalCount';

export default class AWSPinpointProvider
	extends AWSPinpointProviderCommon
	implements InAppMessagingProvider
{
	static subCategory: NotificationsSubCategory = 'InAppMessaging';

	private configured = false;
	private sessionMessageCountMap: InAppMessageCountMap;
	private sessionTracker: SessionTracker;

	constructor() {
		super(logger);
		this.sessionMessageCountMap = {};
	}

	/**
	 * get the sub-category of the plugin
	 */
	getSubCategory() {
		return AWSPinpointProvider.subCategory;
	}

	configure = (config = {}): Record<string, any> => {
		this.config = {
			...super.configure(config),
			endpointInfo: { channelType: 'IN_APP' },
		};

		// some configuration steps should not be re-run even if provider is re-configured for some reason
		if (!this.configured) {
			this.sessionTracker = new SessionTracker(this.sessionStateChangeHandler);
			this.sessionTracker.start();
			// wire up default Pinpoint message event handling
			addEventListener(
				InAppMessageInteractionEvent.MESSAGE_DISPLAYED,
				(message: InAppMessage) => {
					this.recordMessageEvent(
						message,
						AWSPinpointMessageEvent.MESSAGE_DISPLAYED
					);
				}
			);
			addEventListener(
				InAppMessageInteractionEvent.MESSAGE_DISMISSED,
				(message: InAppMessage) => {
					this.recordMessageEvent(
						message,
						AWSPinpointMessageEvent.MESSAGE_DISMISSED
					);
				}
			);
			addEventListener(
				InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN,
				(message: InAppMessage) => {
					this.recordMessageEvent(
						message,
						AWSPinpointMessageEvent.MESSAGE_ACTION_TAKEN
					);
				}
			);
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
		// event properties thus opting to just clear them out when getting messages rather than leave potentially
		// obsolete entries that will no longer serve any purpose.
		clearMemo();
		try {
			await this.updateEndpoint();
			// The credentials exists assuming `updateEndpoint()` is always called before.
			const { appId, credentials, endpointId, region } = this.config;
			const input: GetInAppMessagesInput = {
				ApplicationId: appId,
				EndpointId: endpointId,
			};
			this.logger.debug('getting in-app messages');
			const response: GetInAppMessagesOutput = await getInAppMessages(
				{ credentials, region },
				input
			);
			const { InAppMessageCampaigns: messages } =
				response.InAppMessagesResponse;
			dispatchInAppMessagingEvent('getInAppMessages', messages);
			return messages;
		} catch (err) {
			this.logger.error('Error getting in-app messages', err);
			throw err;
		}
	};

	processInAppMessages = async (
		messages: any[],
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
		const { sessionCount, dailyCount, totalCount } =
			this.getMessageCounts(CampaignId);
		return (
			(!SessionCap || sessionCount < SessionCap) &&
			(!DailyCap || dailyCount < DailyCap) &&
			(!TotalCap || totalCount < TotalCap)
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
			this.logger.error('Failed to get message counts from storage', err);
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
			this.logger.error('Failed to save daily message count to storage', err);
		}
	};

	private setTotalCountMap = (countMap: InAppMessageCountMap): void => {
		const { storage } = this.config;
		try {
			storage.setItem(MESSAGE_TOTAL_COUNT_KEY, JSON.stringify(countMap));
		} catch (err) {
			this.logger.error('Failed to save total count to storage', err);
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
		const { sessionCount, dailyCount, totalCount } =
			this.getMessageCounts(messageId);
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
				layout: interpretLayout(InAppMessage.Layout),
				metadata: extractMetadata(message),
			};
		});
	};

	private recordMessageEvent = async (
		message: InAppMessage,
		event: AWSPinpointMessageEvent
	): Promise<void> => {
		if (!this.initialized) {
			await this.init();
		}
		recordAnalyticsEvent(event, message);
		if (event === AWSPinpointMessageEvent.MESSAGE_DISPLAYED) {
			await this.incrementCounts(message.id);
		}
	};
}
