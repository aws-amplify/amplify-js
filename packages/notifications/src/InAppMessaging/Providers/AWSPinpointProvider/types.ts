/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { UserInfo } from '../../types';

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

export interface AWSPinpointProviderConfig {
	appId: string;
	region: string;
}

export enum AWSPinpointMessageEvent {
	MESSAGE_DISPLAYED = '_inapp.message_displayed',
	MESSAGE_DISMISSED = '_inapp.message_dismissed',
	MESSAGE_ACTION_TAKEN = '_inapp.message_clicked',
}

export interface AWSPinpointUserInfo extends UserInfo {
	address?: string;
	optOut?: 'ALL' | 'NONE';
}
