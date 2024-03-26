// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessage } from '../../../types';

export type InAppMessageCountMap = Record<string, number>;

export interface DailyInAppMessageCounter {
	count: number;
	lastCountTimestamp: string;
}

export interface InAppMessageCounts {
	sessionCount: number;
	dailyCount: number;
	totalCount: number;
}

export type MetricsComparator = (
	metricsVal: number,
	eventVal: number,
) => boolean;

export enum PinpointMessageEvent {
	MESSAGE_DISPLAYED = '_inapp.message_displayed',
	MESSAGE_DISMISSED = '_inapp.message_dismissed',
	MESSAGE_ACTION_TAKEN = '_inapp.message_clicked',
}

export type InAppMessageConflictHandler = (
	messages: InAppMessage[],
) => InAppMessage;

export type OnMessageInteractionEventHandler = (message: InAppMessage) => void;
