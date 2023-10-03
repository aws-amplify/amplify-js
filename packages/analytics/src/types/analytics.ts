// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Analytics instance options
 */

export interface EventAttributes {
	[key: string]: string;
}

export interface EventMetrics {
	[key: string]: number;
}

export interface PageViewTrackOpts {
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
