// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export enum Framework {
	// < 100 - Web frameworks
	WebUnknown = '0',
	React = '1',
	NextJs = '2',
	Angular = '3',
	VueJs = '4',
	Nuxt = '5',
	Svelte = '6',

	// 100s - Server side frameworks
	ServerSideUnknown = '100',
	ReactSSR = '101',
	NextJsSSR = '102',
	AngularSSR = '103',
	VueJsSSR = '104',
	NuxtSSR = '105',
	SvelteSSR = '106',

	// 200s - Mobile framework
	ReactNative = '201',
	Expo = '202',
}

export enum Category {
	API = 'api',
	Auth = 'auth',
	Analytics = 'analytics',
	DataStore = 'datastore',
	Geo = 'geo',
	Interactions = 'interactions',
	InAppMessaging = 'inappmessaging',
	Predictions = 'predictions',
	PubSub = 'pubsub',
	PushNotification = 'pushnotification',
	Storage = 'storage',
}

// Actions
/* TODO: Replace 'None' with all expected Actions */
export enum AnalyticsAction {
	Record = '1',
}
export enum ApiAction {
	None = '0',
}
export enum AuthAction {
	None = '0',
}
export enum DataStoreAction {
	None = '0',
}
export enum GeoAction {
	None = '0',
}
export enum InteractionsAction {
	None = '0',
}
export enum InAppMessagingAction {
	None = '0',
}
export enum PredictionsAction {
	None = '0',
}
export enum PubSubAction {
	None = '0',
}
export enum PushNotificationAction {
	None = '0',
}
export enum StorageAction {
	None = '0',
}

type ActionMap = {
	[Category.Auth]: AuthAction;
	[Category.API]: ApiAction;
	[Category.DataStore]: DataStoreAction;
	[Category.Geo]: GeoAction;
	[Category.Interactions]: InteractionsAction;
	[Category.InAppMessaging]: InAppMessagingAction;
	[Category.Predictions]: PredictionsAction;
	[Category.PubSub]: PubSubAction;
	[Category.PushNotification]: PushNotificationAction;
	[Category.Storage]: StorageAction;
};

type UserAgentDetailsWithCategory<T extends Category> =
	CustomUserAgentDetailsBase & {
		category: T;
		action: T extends keyof ActionMap ? ActionMap[T] : never;
	};

type CustomUserAgentDetailsBase = {
	framework?: Framework;
};

export type CustomUserAgentDetails =
	| (CustomUserAgentDetailsBase & { category?: never; action?: never })
	| UserAgentDetailsWithCategory<Category.API>
	| UserAgentDetailsWithCategory<Category.Auth>
	| UserAgentDetailsWithCategory<Category.DataStore>
	| UserAgentDetailsWithCategory<Category.Geo>
	| UserAgentDetailsWithCategory<Category.Interactions>
	| UserAgentDetailsWithCategory<Category.InAppMessaging>
	| UserAgentDetailsWithCategory<Category.Predictions>
	| UserAgentDetailsWithCategory<Category.PubSub>
	| UserAgentDetailsWithCategory<Category.PushNotification>
	| UserAgentDetailsWithCategory<Category.Storage>;
