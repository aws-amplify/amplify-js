// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * This Symbol is used to reference an internal-only PubSub provider that
 * is used for AppSync/GraphQL subscriptions in the API category.
 */
const hasSymbol =
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function';

/**
 * @deprecated Unused, all usecases have migrated to INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER
 */
export const INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER = hasSymbol
	? Symbol.for('INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER')
	: '@@INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER';

export const INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER = hasSymbol
	? Symbol.for('INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER')
	: '@@INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER';

export const USER_AGENT_HEADER = 'x-amz-user-agent';

export enum Category {
	Auth = '1:1',
	API = '1:2',
	DataStore = '1:3',
	Geo = '1:4',
	Interactions = '1:5',
	Notifications = '1:6',
	Predictions = '1:7',
	PubSub = '1:8',
	PushNotification = '1:9',
	Storage = '1:10',
}

export enum CategoryAction {
	AuthSignUp = '2:1',
	AuthSignIn = '2:2',
	APIQuery = '2:3',
	DataStoreJitteredRetry = '2:4',
}

export enum UIComponent {
	Authenticator = '3:1',
	AccountSettings = '3:2',
	MapView = '3:3',
	FileUploader = '3:4',
}

export enum Framework {
	JS = '4:0',
	React = '4:1',
	Next = '4:2',
	Angular = '4:3',
	Angular2Plus = '4:4',
	Vue = '4:5',
}
