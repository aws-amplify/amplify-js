// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthHubEventData } from './AuthTypes';

export type IListener<
	Channel extends string = AmplifyChannel | string,
	EventData extends EventDataMap = EventDataMap,
> = {
	name: string;
	callback: HubCallback<Channel, EventData>;
}[];

export type EventDataMap = { event: string; data?: unknown };

export type AmplifyEventData = {
	auth: AuthHubEventData;
	[key: string]: EventDataMap;
};
export type AmplifyChannel = 'auth';

export type StopListenerCallback = () => void;

export type HubCapsule<
	Channel extends string,
	EventData extends EventDataMap,
> = {
	channel: Channel;
	payload: HubPayload<EventData>;
	source?: string;
	patternInfo?: string[];
};

export type HubCallback<
	Channel extends string = string,
	EventData extends EventDataMap = EventDataMap,
> = (capsule: HubCapsule<Channel, EventData>) => void;

export type HubPayload<EventData extends EventDataMap = EventDataMap> =
	EventData & {
		message?: string;
	};

export type AmplifyHubCallbackMap<Channel extends AmplifyChannel> = {
	auth: HubCallback<Channel>;
};
