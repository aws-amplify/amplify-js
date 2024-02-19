// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthSession } from '../../../singleton/Auth/types';

import { PinpointAnalyticsEvent, PinpointSession } from './pinpoint';

export interface EventBufferConfig {
	bufferSize: number;
	flushInterval: number;
	flushSize: number;
	resendLimit: number;
}

export type PinpointEventBufferConfig = EventBufferConfig & {
	appId: string;
	region: string;
	credentials: Required<AuthSession>['credentials'];
	identityId: AuthSession['identityId'];
	userAgentValue?: string;
};

export interface BufferedEvent {
	endpointId: string;
	eventId: string;
	event: PinpointAnalyticsEvent;
	session: PinpointSession;
	timestamp: string;
	resendLimit: number;
}

export type BufferedEventMap = Record<string, BufferedEvent>;

export type EventBuffer = BufferedEventMap[];
