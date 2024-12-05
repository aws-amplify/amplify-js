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
	AI = 'ai',
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

export enum AiAction {
	CreateConversation = '1',
	GetConversation = '2',
	ListConversations = '3',
	DeleteConversation = '4',
	SendMessage = '5',
	ListMessages = '6',
	OnMessage = '7',
	Generation = '8',
	UpdateConversation = '9',
}

export enum AnalyticsAction {
	Record = '1',
	IdentifyUser = '2',
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
	ResendSignUpCode = '3',
	SignIn = '4',
	FetchMFAPreference = '6',
	UpdateMFAPreference = '7',
	SetUpTOTP = '10',
	VerifyTOTPSetup = '11',
	ConfirmSignIn = '12',
	DeleteUserAttributes = '15',
	DeleteUser = '16',
	UpdateUserAttributes = '17',
	FetchUserAttributes = '18',
	ConfirmUserAttribute = '22',
	SignOut = '26',
	UpdatePassword = '27',
	ResetPassword = '28',
	ConfirmResetPassword = '29',
	FederatedSignIn = '30',
	RememberDevice = '32',
	ForgetDevice = '33',
	FetchDevices = '34',
	SendUserAttributeVerificationCode = '35',
	SignInWithRedirect = '36',
	StartWebAuthnRegistration = '37',
	CompleteWebAuthnRegistration = '38',
	ListWebAuthnCredentials = '39',
	DeleteWebAuthnCredential = '40',
}
export enum DataStoreAction {
	Subscribe = '1',
	GraphQl = '2',
}
export enum GeoAction {
	SearchByText = '0',
	SearchByCoordinates = '1',
	SearchForSuggestions = '2',
	SearchByPlaceId = '3',
	SaveGeofences = '4',
	GetGeofence = '5',
	ListGeofences = '6',
	DeleteGeofences = '7',
}
export enum InAppMessagingAction {
	SyncMessages = '1',
	IdentifyUser = '2',
	NotifyMessageInteraction = '3',
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
	InitializePushNotifications = '1',
	IdentifyUser = '2',
}
export enum StorageAction {
	UploadData = '1',
	DownloadData = '2',
	List = '3',
	Copy = '4',
	Remove = '5',
	GetProperties = '6',
	GetUrl = '7',
	GetDataAccess = '8',
	ListCallerAccessGrants = '9',
}

interface ActionMap {
	[Category.AI]: AiAction;
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
}

type UserAgentDetailsWithCategory<T extends Category> =
	CustomUserAgentDetailsBase & {
		category: T;
		action: T extends keyof ActionMap ? ActionMap[T] : never;
	};

interface CustomUserAgentDetailsBase {
	framework?: Framework;
}

export type CustomUserAgentDetails =
	| (CustomUserAgentDetailsBase & { category?: never; action?: never })
	| UserAgentDetailsWithCategory<Category.AI>
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

/**
 * `refCount` tracks how many consumers have set state for a particular API to avoid it being cleared before all
 * consumers are done using it.
 *
 * Category -> Action -> Custom State
 */
export type CategoryUserAgentStateMap = Record<
	string,
	{ refCount: number; additionalDetails: AdditionalDetails }
>;
export type CustomUserAgentStateMap = Record<string, CategoryUserAgentStateMap>;

export type AdditionalDetails = [string, string?][];

export interface StorageUserAgentInput {
	category: Category.Storage;
	apis: StorageAction[];
	additionalDetails: AdditionalDetails;
}

export interface AiUserAgentInput {
	category: Category.AI;
	apis: AiAction[];
	additionalDetails: AdditionalDetails;
}

export interface AuthUserAgentInput {
	category: Category.Auth;
	apis: AuthAction[];
	additionalDetails: AdditionalDetails;
}

export interface InAppMessagingUserAgentInput {
	category: Category.InAppMessaging;
	apis: InAppMessagingAction[];
	additionalDetails: AdditionalDetails;
}

export interface GeoUserAgentInput {
	category: Category.Geo;
	apis: GeoAction[];
	additionalDetails: AdditionalDetails;
}

export type SetCustomUserAgentInput =
	| StorageUserAgentInput
	| AuthUserAgentInput
	| InAppMessagingUserAgentInput
	| GeoUserAgentInput
	| AiUserAgentInput;
