// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	SESSION_START_EVENT,
	SESSION_STOP_EVENT,
	SessionState,
	sessionListener,
} from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';

import {
	SessionTrackingOptions,
	TrackerEventRecorder,
	TrackerInterface,
} from '../types/trackers';

const logger = new ConsoleLogger('SessionTracker');

export class SessionTracker implements TrackerInterface {
	private options: SessionTrackingOptions;
	private eventRecorder: TrackerEventRecorder;
	private sessionTrackingActive: boolean;
	private initialEventSent: boolean;

	constructor(
		eventRecorder: TrackerEventRecorder,
		options?: SessionTrackingOptions,
	) {
		this.options = {};
		this.eventRecorder = eventRecorder;
		this.sessionTrackingActive = false;
		this.initialEventSent = false;
		this.handleStateChange = this.handleStateChange.bind(this);

		this.configure(eventRecorder, options);
	}

	public configure(
		eventRecorder: TrackerEventRecorder,
		options?: SessionTrackingOptions,
	) {
		this.eventRecorder = eventRecorder;

		// Clean up any existing listeners
		this.cleanup();

		// Apply defaults
		this.options = {
			attributes: options?.attributes ?? {},
		};

		// Setup state listeners
		if (!this.sessionTrackingActive) {
			sessionListener.addStateChangeListener(
				this.handleStateChange,
				!this.initialEventSent,
			);

			this.sessionTrackingActive = true;
		}
	}

	public cleanup() {
		if (this.sessionTrackingActive) {
			sessionListener.removeStateChangeListener(this.handleStateChange);
		}

		this.sessionTrackingActive = false;
	}

	private handleStateChange(state: SessionState) {
		if (state === 'started') {
			this.sessionStarted();
		} else {
			this.sessionStopped();
		}
	}

	private sessionStarted() {
		const attributes = this.options.attributes ?? {};

		logger.debug('Recording automatically tracked page view event', {
			SESSION_START_EVENT,
			attributes,
		});

		this.eventRecorder(SESSION_START_EVENT, attributes);

		// NOTE: The initial event will not be re-sent on re-configuration (e.g. to add additional custom attributes)
		if (!this.initialEventSent) {
			this.initialEventSent = true;
		}
	}

	private sessionStopped() {
		const attributes = this.options.attributes ?? {};

		logger.debug('Recording automatically tracked page view event', {
			SESSION_STOP_EVENT,
			attributes,
		});

		this.eventRecorder(SESSION_STOP_EVENT, attributes);
	}
}
