// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthSession } from '../../../singleton/Auth/types';
import { PinpointAnalyticsEvent, PinpointSession } from './pinpoint';

export type EventBufferConfig = {
	appId: string;
	bufferSize: number;
	credentials: Required<AuthSession>['credentials'];
	identityId: AuthSession['identityId'];
	flushInterval: number;
	flushSize: number;
	region: string;
	resendLimit: number;
	userAgentValue?: string;
};

export type BufferedEvent = {
	endpointId: string;
	eventId: string;
	event: PinpointAnalyticsEvent;
	session: PinpointSession;
	timestamp: string;
	resendLimit: number;
};

export type BufferedEventMap = {
	[key: string]: BufferedEvent;
};

export type EventBuffer = Array<BufferedEventMap>;
