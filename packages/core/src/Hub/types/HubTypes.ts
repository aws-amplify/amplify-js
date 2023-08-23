// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthHubEventData } from './AuthTypes';

export type IListener<Channel extends string = string> = {
	name: string;
	callback: HubCallback<Channel>;
}[];

export type EventDataMap = { event: string; data?: unknown };

export type AmplifyEventData = {
	auth: AuthHubEventData;
	[key: string]: EventDataMap;
};

// TODO[kvramya] add more channels if we support more channels.
export type AmplifyChannel = 'auth';

export type StopListenerCallback = () => void;
export type AmplifyEventDataMap = { event: string; data?: unknown };

export type HubCapsule<
	Channel extends string,
	EventData extends EventDataMap
> = {
	channel: Channel;
	payload: HubPayload<AmplifyEventData[Channel]> | HubPayload<EventData>;
	source?: string;
	patternInfo?: string[];
};

export type HubCallback<
	Channel extends string,
	EventData extends EventDataMap = EventDataMap
> = (capsule: HubCapsule<Channel, EventData>) => void;

export type HubPayload<
	EventDataMap extends AmplifyEventDataMap = AmplifyEventDataMap
> = EventDataMap & {
	message?: string;
};

export type AmplifyHubCallbackMap<Channel extends AmplifyChannel> = {
	auth: HubCallback<Channel>;
};

export type AnyChannel = string;

export type AmplifyChannelMap<
	AmplifyChannelType extends AmplifyChannel | AnyChannel =
		| AmplifyChannel
		| AnyChannel
> = {
	channelType: AmplifyChannelType;
};
