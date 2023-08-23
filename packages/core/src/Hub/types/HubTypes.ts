// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthHubEventData } from './AuthTypes';

export interface IListener<
	Channel extends string = string,
	EventData extends AmplifyEventDataMap = AmplifyEventDataMap
> {
	name: string;
	callback: HubCallback<Channel, EventData>;
}

export type AmplifyChannel =
	| 'auth'
	| 'storage'
	| 'core'
	| 'api'
	| 'analytics'
	| 'interactions'
	| 'pubsub'
	| 'datastore'
	| 'notifications';

export type AmplifyEventDataMap = { event: string; data?: unknown };

export type HubCapsule<
	Channel extends string,
	EventData extends AmplifyEventDataMap = AmplifyEventDataMap
> = {
	channel: Channel;
	payload: HubPayload<EventData>;
	source: string;
	patternInfo?: string[];
};

export type HubCallback<
	Channel extends string,
	EventData extends AmplifyEventDataMap = AmplifyEventDataMap
> = (capsule: HubCapsule<Channel, EventData>) => void;

export type HubPayload<
	EventDataMap extends AmplifyEventDataMap = AmplifyEventDataMap
> = EventDataMap & {
	message?: string;
};

export type AmplifyHubCallbackMap<Channel extends AmplifyChannel> = {
	auth: HubCallback<Channel, AuthHubEventData>;
	storage: HubCallback<Channel>;
	core: HubCallback<Channel>;
	analytics: HubCallback<Channel>;
	api: HubCallback<Channel>;
	interactions: HubCallback<Channel>;
	pubsub: HubCallback<Channel>;
	datastore: HubCallback<Channel>;
	notifications: HubCallback<Channel>;
};

export type GetHubCallBack<
	Channel extends string,
	EventDataMap extends AmplifyEventDataMap = AmplifyEventDataMap
> = Channel extends AmplifyChannel
	? AmplifyHubCallbackMap<Channel>[Channel]
	: HubCallback<Channel, EventDataMap>;

export type AnyChannel = string;

export type AmplifyChannelMap<
	AmplifyChannelType extends AmplifyChannel | AnyChannel =
		| AmplifyChannel
		| AnyChannel,
	EventDataMap extends AmplifyEventDataMap = AmplifyEventDataMap
> = {
	channelType: AmplifyChannelType;
	eventData: EventDataMap;
};
