// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type InAppMessageCountMap = Record<string, number>;

export type DailyInAppMessageCounter = {
	count: number;
	lastCountTimestamp: string;
};

export type InAppMessageCounts = {
	sessionCount: number;
	dailyCount: number;
	totalCount: number;
};

export type MetricsComparator = (
	metricsVal: number,
	eventVal: number
) => boolean;

export enum AWSPinpointMessageEvent {
	MESSAGE_DISPLAYED = '_inapp.message_displayed',
	MESSAGE_DISMISSED = '_inapp.message_dismissed',
	MESSAGE_ACTION_TAKEN = '_inapp.message_clicked',
}
