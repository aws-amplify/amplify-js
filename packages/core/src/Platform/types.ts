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
	InAppMessaging = 'inappmessaging',
	Interactions = 'interactions',
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
	GraphQl = '1',
	Get = '2',
	Post = '3',
	Put = '4',
	Patch = '5',
	Del = '6',
	Head = '7',
}
export enum AuthAction {
	// Standard Auth Actions currently defined in amazon-cognito-identity-js/Platform/constants.js
	OAuthToken = '25',
}
export enum DataStoreAction {
	Subscribe = '1',
	GraphQl = '2',
}
export enum GeoAction {
	None = '0',
}
export enum InAppMessagingAction {
	None = '0',
}
export enum InteractionsAction {
	None = '0',
}
export enum PredictionsAction {
	Convert = '1',
	Identify = '2',
	Interpret = '3',
}
export enum PubSubAction {
	Subscribe = '1',
}
export enum PushNotificationAction {
	None = '0',
}
export enum StorageAction {
	// UploadFile = '1',
	UploadData = '2',
	DownloadData = '3',
	// DownloadFile = '4',
	GetUrl = '5',
	// GetProperties = '6',
	List = '7',
	Copy = '8',
	Remove = '9',
}

type ActionMap = {
	[Category.Auth]: AuthAction;
	[Category.API]: ApiAction;
	[Category.Analytics]: AnalyticsAction;
	[Category.DataStore]: DataStoreAction;
	[Category.Geo]: GeoAction;
	[Category.InAppMessaging]: InAppMessagingAction;
	[Category.Interactions]: InteractionsAction;
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
	| UserAgentDetailsWithCategory<Category.Analytics>
	| UserAgentDetailsWithCategory<Category.DataStore>
	| UserAgentDetailsWithCategory<Category.Geo>
	| UserAgentDetailsWithCategory<Category.Interactions>
	| UserAgentDetailsWithCategory<Category.InAppMessaging>
	| UserAgentDetailsWithCategory<Category.Predictions>
	| UserAgentDetailsWithCategory<Category.PubSub>
	| UserAgentDetailsWithCategory<Category.PushNotification>
	| UserAgentDetailsWithCategory<Category.Storage>;
