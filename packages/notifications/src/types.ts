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

export type FilteredInAppMessagesHandler = (messages: any) => void;

export type NotificationsCategory = 'Notifications';

export interface NotificationsConfig {
	listenForAnalyticsEvents?: boolean;
	filteredInAppMessagesHandler?: FilteredInAppMessagesHandler;
}

export type NotificationEvent = {
	name: string;
	attributes?: Record<string, string>;
	metrics?: Record<string, number>;
};

export interface NotificationsProvider {
	// you need to implement these methods

	// configure your provider
	configure(config: object): object;

	// return 'Notification';
	getCategory(): NotificationsCategory;

	// return the name of you provider
	getProviderName(): string;

	// syncs in-app messages locally
	syncInAppMessages(): Promise<any>;

	// filters in-app messages based on event input and provider logic
	filterMessages(
		messages: InAppMessage[],
		event: NotificationEvent
	): InAppMessage[];
}

export type Layout =
	| 'BOTTOM_BANNER'
	| 'CAROUSEL'
	| 'MIDDLE_BANNER'
	| 'OVERLAYS'
	| 'TOP_BANNER';

export type ComparisonOperator =
	| 'EQUAL'
	| 'GREATER_THAN'
	| 'GREATER_THAN_OR_EQUAL'
	| 'LESS_THAN'
	| 'LESS_THAN_OR_EQUAL';

export type MetricsComparator = (
	metricsVal: number,
	eventVal: number
) => boolean;

type Attribute = {
	AttributeType: any;
	Values: string[];
};

type EventType = {
	DimensionType: any;
	Values: string[];
};

type Metric = {
	ComparisonOperator: ComparisonOperator;
	Value: number;
};

type Dimensions = {
	Attributes?: Record<string, Attribute>;
	EventType?: EventType;
	Metrics?: Record<string, Metric>;
};

type EventFilter = {
	Dimensions: Dimensions;
	FilterType: any;
};

export type InAppMessage = {
	CampaignId: string;
	InAppMessage: {
		Content: string[];
		Layout: Layout;
	};
	Priority: number;
	Schedule: {
		EndDate: string;
		EventFilter: EventFilter;
		QuietTime: any;
	};
	SessionCap: number;
	TreatmentId: string;
};

export type InAppNotificationsResponse = {
	InAppMessagesResponse: { InAppMessageCampaigns: InAppMessage[] };
};
