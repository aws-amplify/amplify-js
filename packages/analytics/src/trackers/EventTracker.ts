// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';
import { isBrowser } from '@aws-amplify/core/internals/utils';

import {
	DOMEvent,
	EventTrackingOptions,
	TrackerEventRecorder,
	TrackerInterface,
} from '../types/trackers';

const DEFAULT_EVENTS = ['click'] as DOMEvent[];
const DEFAULT_SELECTOR_PREFIX = 'data-amplify-analytics-';
const DEFAULT_EVENT_NAME = 'event'; // Default event name as sent to the analytics provider

const logger = new ConsoleLogger('EventTracker');

export class EventTracker implements TrackerInterface {
	private trackerActive: boolean;
	private options: EventTrackingOptions;
	private eventRecorder: TrackerEventRecorder;

	constructor(
		eventRecorder: TrackerEventRecorder,
		options?: EventTrackingOptions,
	) {
		this.options = {};
		this.trackerActive = false;
		this.eventRecorder = eventRecorder;
		this.handleDocEvent = this.handleDocEvent.bind(this);

		this.configure(eventRecorder, options);
	}

	public configure(
		eventRecorder: TrackerEventRecorder,
		options?: EventTrackingOptions,
	) {
		this.eventRecorder = eventRecorder;

		// Clean up any existing listeners
		this.cleanup();

		// Apply defaults
		this.options = {
			attributes: options?.attributes ?? undefined,
			events: options?.events ?? DEFAULT_EVENTS,
			selectorPrefix: options?.selectorPrefix ?? DEFAULT_SELECTOR_PREFIX,
		};

		// Register event listeners
		if (isBrowser()) {
			this.options.events?.forEach(targetEvent => {
				document.addEventListener(targetEvent, this.handleDocEvent, {
					capture: true,
				});
			});

			this.trackerActive = true;
		}
	}

	public cleanup() {
		// No-op if document listener is not active
		if (!this.trackerActive) {
			return;
		}

		// Clean up event listeners
		this.options.events?.forEach(targetEvent => {
			document.removeEventListener(targetEvent, this.handleDocEvent, {
				capture: true,
			});
		});
	}

	private handleDocEvent(event: Event) {
		/**
		 * Example DOM element:
		 *
		 * ```
		 * <button
		 *   data-amplify-analytics-on="click"
		 *   data-amplify-analytics-name="click"
		 *   data-amplify-analytics-attrs="attr1:attr1_value,attr2:attr2_value"
		 * />
		 * ```
		 */
		const triggerSelector = `[${this.options.selectorPrefix}on]`;
		const attrSelector = `${this.options.selectorPrefix}attrs`;
		const eventNameSelector = `${this.options.selectorPrefix}name`;
		const eventSource = event.target;

		// Validate that the triggering event type is being tracked
		if (!this.options.events?.includes(event.type as DOMEvent)) {
			return;
		}

		if (eventSource instanceof HTMLElement) {
			const target = eventSource.closest(triggerSelector);

			if (target) {
				// Parse event name from the element
				const eventName =
					target.getAttribute(eventNameSelector) || DEFAULT_EVENT_NAME;

				// Parse attributes from the element
				const elementAttributes: Record<string, string> = {};
				const rawElementAttributes = target.getAttribute(attrSelector);
				rawElementAttributes?.split(/\s*,\s*/).forEach(attr => {
					const tmp = attr.trim().split(/\s*:\s*/);
					elementAttributes[tmp[0]] = tmp[1];
				});

				// Assemble final list of attributes
				const attributes = Object.assign(
					{
						type: event.type,
						target: `${target.localName} with id ${target.id}`,
					},
					this.options.attributes,
					elementAttributes,
				);

				logger.debug('Recording automatically tracked DOM event', {
					eventName,
					attributes,
				});

				this.eventRecorder(eventName, attributes);
			}
		}
	}
}
