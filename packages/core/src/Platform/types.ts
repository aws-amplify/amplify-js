// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import type { UserAgent as AWSUserAgent } from '@aws-sdk/types';

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

export enum AnalyticsAction {
	Record = '1',
	UpdateEndpoint = '2',
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
	SignUp = '1',
	ConfirmSignUp = '2',
	ResendSignUp = '3',
	SignIn = '4',
	GetMFAOptions = '5',
	GetPreferredMFA = '6',
	SetPreferredMFA = '7',
	DisableSMS = '8',
	EnableSMS = '9',
	SetupTOTP = '10',
	VerifyTotpToken = '11',
	ConfirmSignIn = '12',
	CompleteNewPassword = '13',
	SendCustomChallengeAnswer = '14',
	DeleteUserAttributes = '15',
	DeleteUser = '16',
	UpdateUserAttributes = '17',
	UserAttributes = '18',
	CurrentUserPoolUser = '19',
	CurrentAuthenticatedUser = '20',
	CurrentSession = '21',
	VerifyUserAttribute = '22',
	VerifyUserAttributeSubmit = '23',
	VerifyCurrentUserAttribute = '24',
	VerifyCurrentUserAttributeSubmit = '25',
	SignOut = '26',
	ChangePassword = '27',
	ForgotPassword = '28',
	ForgotPasswordSubmit = '29',
	FederatedSignIn = '30',
	CurrentUserInfo = '31',
	RememberDevice = '32',
	ForgetDevice = '33',
	FetchDevices = '34',
	UserSession = '35',
}
export enum DataStoreAction {
	Subscribe = '1',
	GraphQl = '2',
}
export enum GeoAction {
	SearchByText = '1',
	SearchForSuggestions = '2',
	SearchByPlaceId = '3',
	SearchByCoordinates = '4',
	SaveGeofences = '5',
	GetGeofence = '6',
	ListGeofences = '7',
	DeleteGeofences = '8',
}
export enum InAppMessagingAction {
	None = '0',
	SyncMessages = '1',
	IdentifyUser = '2',
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
	Put = '1',
	Get = '2',
	List = '3',
	Copy = '4',
	Remove = '5',
	GetProperties = '6',
	Cancel = '7',
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
	// DO NOT REMOVE:
	// Used by other Amplify teams to pass information to the custom user agent
	/** Accepts an array of arrays with exactly 1 or 2 values and translates 
	those arrays to "item" or "item1/item2" strings on the custom user agent */
	additionalInfo?: AWSUserAgent;
};

// DO NOT MAKE ANY PROP REQUIRED on CustomUserAgentDetails
// This object is used by other Amplify teams to pass information to the user agent
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
