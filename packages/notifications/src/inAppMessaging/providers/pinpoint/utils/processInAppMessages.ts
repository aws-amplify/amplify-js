// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessage, InAppMessagingEvent } from '../../../types';
import {
	InAppMessageCounts,
	InAppMessageCountMap,
	DailyInAppMessageCounter,
} from '../types';
import {
	extractContent,
	extractMetadata,
	interpretLayout,
	isBeforeEndDate,
	matchesAttributes,
	matchesEventType,
	matchesMetrics,
} from './helpers';
import type { InAppMessageCampaign as PinpointInAppMessage } from '@aws-amplify/core/internals/aws-clients/pinpoint';
import { ConsoleLogger } from '@aws-amplify/core/internals/utils';
import { defaultStorage } from '@aws-amplify/core';

const MESSAGE_DAILY_COUNT_KEY = 'pinpointProvider_inAppMessages_dailyCount';
const MESSAGE_TOTAL_COUNT_KEY = 'pinpointProvider_inAppMessages_totalCount';
const logger = new ConsoleLogger('InAppMessaging.processInAppMessages');

const sessionMessageCountMap: InAppMessageCountMap = {};

export async function processInAppMessages(
	messages: PinpointInAppMessage[],
	event: InAppMessagingEvent
): Promise<InAppMessage[]> {
	let highestPrioritySeen: number;
	let acc: PinpointInAppMessage[] = [];
	for (let index = 0; index < messages.length; index++) {
		const message = messages[index];
		const messageQualifies =
			matchesEventType(message, event) &&
			matchesAttributes(message, event) &&
			matchesMetrics(message, event) &&
			isBeforeEndDate(message) &&
			(await isBelowCap(message));
		// filter all qualifying messages returning only those that are of (relative) highest priority
		if (messageQualifies) {
			// have not yet encountered message with priority
			if (!highestPrioritySeen) {
				// this message has priority, so reset the accumulator with this message only
				if (message.Priority) {
					highestPrioritySeen = message.Priority;
					acc = [message];
				} else {
					// this message also has no priority, so just add this message to accumulator
					acc.push(message);
				}
				// have previously encountered message with priority, so only messages with priority matter now
			} else if (message.Priority) {
				// this message has higher priority (lower number), so reset the accumulator with this message only
				if (message.Priority < highestPrioritySeen) {
					highestPrioritySeen = message.Priority;
					acc = [message];
					// this message has the same priority, so just add this message to accumulator
				} else if (message.Priority === highestPrioritySeen) {
					acc.push(message);
				}
			}
		}
	}
	return normalizeMessages(acc);
}

function normalizeMessages(messages: PinpointInAppMessage[]): InAppMessage[] {
	return messages.map(message => {
		const { CampaignId, InAppMessage } = message;
		return {
			id: CampaignId,
			content: extractContent(message),
			layout: interpretLayout(InAppMessage.Layout),
			metadata: extractMetadata(message),
		};
	});
}

async function isBelowCap({
	CampaignId,
	SessionCap,
	DailyCap,
	TotalCap,
}: PinpointInAppMessage): Promise<Boolean> {
	const { sessionCount, dailyCount, totalCount } = await getMessageCounts(
		CampaignId
	);
	return (
		(!SessionCap ?? sessionCount < SessionCap) &&
		(!DailyCap ?? dailyCount < DailyCap) &&
		(!TotalCap ?? totalCount < TotalCap)
	);
}

async function getMessageCounts(
	messageId: string
): Promise<InAppMessageCounts> {
	try {
		return {
			sessionCount: getSessionCount(messageId),
			dailyCount: await getDailyCount(),
			totalCount: await getTotalCount(messageId),
		};
	} catch (err) {
		logger.error('Failed to get message counts from storage', err);
	}
}

function getSessionCount(messageId: string): number {
	return sessionMessageCountMap[messageId] || 0;
}

async function getDailyCount(): Promise<number> {
	const today = getStartOfDay();
	const item = await defaultStorage.getItem(MESSAGE_DAILY_COUNT_KEY);
	// Parse stored count or initialize as empty count
	const counter: DailyInAppMessageCounter = item
		? JSON.parse(item)
		: { count: 0, lastCountTimestamp: today };
	// If the stored counter timestamp is today, use it as the count, otherwise reset to 0
	return counter.lastCountTimestamp === today ? counter.count : 0;
}

async function getTotalCountMap(): Promise<InAppMessageCountMap> {
	const item = await defaultStorage.getItem(MESSAGE_TOTAL_COUNT_KEY);
	// Parse stored count map or initialize as empty
	return item ? JSON.parse(item) : {};
}

async function getTotalCount(messageId: string): Promise<number> {
	const countMap = await getTotalCountMap();
	// Return stored count or initialize as empty count
	return countMap[messageId] || 0;
}

const getStartOfDay = (): string => {
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	return now.toISOString();
};
