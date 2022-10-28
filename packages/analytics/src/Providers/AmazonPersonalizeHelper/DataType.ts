// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ICredentials } from '@aws-amplify/core';

interface BasePayload {
	userId: string;
	trackingId: string;
	sessionId: string;
}

type Config = {
	[key: string]: string | number;
};

type Properties = {
	[key: string]: any;
};

export interface RequestParams {
	eventData: EventData;
	sessionInfo: SessionInfo;
	config: Config;
	sentAt: number;
	credentials: ICredentials;
}

export interface EventData {
	eventType: string;
	properties: Properties;
}

export interface SessionInfo {
	userId: string;
	trackingId: string;
	sessionId: string;
}

export interface RecordEventPayload {
	eventId: string;
	eventType: string;
	sentAt: number;
	properties?: string;
}

export interface RecordEventListPayload extends BasePayload {
	eventList: RecordEventPayload[];
	config?: Config;
	credentials?: ICredentials;
}
