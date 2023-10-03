// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type SessionTrackingOpts = {
	attributes?: TrackerAttributes;
};

export type PageViewTrackingOpts = {
	attributes?: TrackerAttributes;
	eventName?: string;
	urlProvider?: () => string;
	appType?: 'multiPage' | 'singlePage';
};

export type EventTrackingOpts = {
	attributes?: TrackerAttributes;
	events?: DOMEvents[];
	selectorPrefix?: string;
};

export type TrackerType = 'event' | 'pageView' | 'session';

export type TrackerAttributes = Record<string, string>;

export type TrackerEventRecorder = (
	eventName: string,
	attributes: TrackerAttributes
) => void;

export type DOMEvents = keyof GlobalEventHandlersEventMap;

export interface TrackerInterface {
	configure(eventRecorder: TrackerEventRecorder, options?: object): void;
	cleanup(): void;
}
