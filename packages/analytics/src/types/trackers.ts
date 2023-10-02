// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type SessionTrackingOpts = {
	type: 'session';
	options?: {
		attributes?: TrackerAttributes;
	};
};

export type PageViewTrackingOpts = {
	type: 'pageView';
	options?: {
		attributes?: TrackerAttributes;
		eventName?: string;
		urlProvider?: () => string;
		appType?: 'multiPage' | 'singlePage';
	};
};

export type EventTrackingOpts = {
	type: 'event';
	options?: {
		attributes?: TrackerAttributes;
		events?: Array<DOMEvents>;
		selectorPrefix?: string;
	};
};

export type TrackerType = 'event' | 'pageView' | 'session';

export type TrackerAttributes = Record<string, string>;

export type DOMEvents = keyof GlobalEventHandlersEventMap;

export interface TrackerInterface {
	configure(): void;
	cleanup(): void;
}
