/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { ICredentials } from '@aws-amplify/core';

/**
 * Analytics instance options
 */
export interface AnalyticsOptions {
	appId: string;
	platform?: string;
	clientId?: string;
	region?: string;
	credentials?: ICredentials;
}

export interface EventAttributes {
	[key: string]: string;
}

export interface EventMetrics {
	[key: string]: number;
}

export interface pageViewTrackOpts {
	enable: boolean;
	type?: string;
	eventName?: string;
	provider?: string;
	attributes?:
		| EventAttributes
		| (() => EventAttributes | Promise<EventAttributes>);
	getUrl?: () => string;
}

export interface EventTrackOpts {
	enable: boolean;
	events?: Array<string>;
	selectorPrefix?: string;
	provider?: string;
	attributes?:
		| EventAttributes
		| (() => EventAttributes | Promise<EventAttributes>);
}

export interface SessionTrackOpts {
	enable: boolean;
	attributes?:
		| EventAttributes
		| (() => EventAttributes | Promise<EventAttributes>);
	provider?: string;
}

export type AutoTrackAttributes =
	| (() => EventAttributes | Promise<EventAttributes>)
	| EventAttributes;

export interface AutoTrackSessionOpts {
	enable: boolean;
	attributes?: AutoTrackAttributes;
	provider?: string;
}

export interface AutoTrackPageViewOpts {
	enable: boolean;
	eventName?: string;
	attributes?: AutoTrackAttributes;
	type?: 'SPA' | 'multiPageApp';
	provider?: string;
	getUrl?: () => string;
}

export interface AutoTrackEventOpts {
	enable: boolean;
	events?: string[];
	selectorPrefix?: string;
	provider?: string;
	attributes?: AutoTrackAttributes;
}

export interface AnalyticsEvent {
	name: string;
	attributes?: EventAttributes;
	metrics?: EventMetrics;
	immediate?: boolean;
}

export { PersonalizeAnalyticsEvent } from './Providers/AmazonPersonalizeProvider';
export { KinesisAnalyticsEvent } from './Providers/AWSKinesisProvider';
