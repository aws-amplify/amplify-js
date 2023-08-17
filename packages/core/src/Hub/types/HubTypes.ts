// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NotificationsHubEventData } from './AnalyticsTypes';
import { AuthHubEventData } from './AuthTypes';

export interface IListener<
	Channel extends string | RegExp = string | RegExp,
	EventData extends AmplifyEventDataMap = AmplifyEventDataMap
> {
	name: string;
	callback: HubCallback<Channel, EventData>;
}
export interface IPattern<
	Channel extends string | RegExp,
	EventData extends AmplifyEventDataMap = AmplifyEventDataMap
> {
	pattern: RegExp;
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
	Channel extends string | RegExp = string | RegExp,
	EventDataMap extends AmplifyEventDataMap = AmplifyEventDataMap
> = {
	channel: Channel;
	payload: HubPayload<EventDataMap>;
	source: string;
	patternInfo?: string[];
};

export type HubCallback<
	Channel extends string | RegExp = string | RegExp,
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
	notifications: HubCallback<Channel, NotificationsHubEventData>;
};

export type GetHubCallBack<
	Channel extends string | RegExp,
	EventDataMap extends AmplifyEventDataMap = AmplifyEventDataMap
> = Channel extends AmplifyChannel
	? AmplifyHubCallbackMap<Channel>[Channel]
	: HubCallback<Channel, EventDataMap>;

export type PayloadFromCallback<T> = T extends (
	arg: infer A extends Record<string, any>
) => void
	? A['payload']
	: never;

export type AnyChannel = string & {};

export type AmplifyChannelMap<
	Channel extends AmplifyChannel | AnyChannel = AmplifyChannel | AnyChannel,
	EventDataMap extends AmplifyEventDataMap = AmplifyEventDataMap
> = {
	channel: Channel | RegExp;
	eventData: EventDataMap;
};
