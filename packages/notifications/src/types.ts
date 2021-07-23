/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

export type EventValidatedHandler = (messages: any) => void;

export interface ValidateEventOptions {
	validator?: (...args: any[]) => boolean;
}

export type NotificationsCategory = 'Notifications';

export interface NotificationsConfig {
	listenForAnalyticsEvents?: boolean;
	eventValidatedHandler?: EventValidatedHandler;
}

export type NotificationEvent = {
	name: string;
	// Pinpoint analytics events have these properties. Unsure at this time what is useful to this feature
	// since this event type would be exposed as a common type to customers trying to call notifier directly
	eventId?: string;
	attributes?: string;
	metrics?: string;
	session?: object;
	immediate?: boolean;
};

export interface NotificationsProvider {
	// you need to implement these methods

	// configure your provider
	configure(config: object): object;

	// return 'Notification';
	getCategory(): NotificationsCategory;

	// return the name of you provider
	getProviderName(): string;

	syncInAppMessages(): Promise<any>;
}

export type AppMessageLayout =
	| 'BOTTOM_BANNER'
	| 'CAROUSEL'
	| 'MIDDLE_BANNER'
	| 'OVERLAYS'
	| 'TOP_BANNER';

export interface AppMessage {
	CampaignId: string;
	InAppMessage: {
		Content: string[];
		Layout: AppMessageLayout;
	};
	Priority: number;
	Schedule: {
		EndDate: string;
		EventFilter: any;
		QuietTime: any;
	};
	SessionCap: number;
	TreatmentId: string;
}

export type InAppNotificationsResponse = {
	InAppMessagesResponse: { InAppMessageCampaigns: AppMessage[] };
};
