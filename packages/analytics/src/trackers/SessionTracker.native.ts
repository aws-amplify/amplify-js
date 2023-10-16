// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Logger as ConsoleLogger,
	SessionListener,
	SessionState,
} from '@aws-amplify/core/internals/utils';
import {
	SessionTrackingOpts,
	TrackerEventRecorder,
	TrackerInterface,
} from '../types/trackers';

const SESSION_START_EVENT = '_session.start';
const SESSION_STOP_EVENT = '_session.stop';

const logger = new ConsoleLogger('SessionTracker');

export class SessionTracker implements TrackerInterface {
	private options: SessionTrackingOpts;
	private eventRecoder: TrackerEventRecorder;
	private initialEventSent: boolean;
	private sessionTrackingActive: boolean;

	constructor(
		eventRecorder: TrackerEventRecorder,
		options?: SessionTrackingOpts
	) {
		this.options = {};
		this.eventRecoder = eventRecorder;
		this.initialEventSent = false;
		this.sessionTrackingActive = false;
		this.handleStateChange = this.handleStateChange.bind(this);

		this.configure(eventRecorder, options);
	}

	public configure(
		eventRecorder: TrackerEventRecorder,
		options?: SessionTrackingOpts
	) {
		this.eventRecoder = eventRecorder;

		// Clean up any existing listeners
		this.cleanup();

		// Apply defaults
		this.options = {
			attributes: options?.attributes || {},
		};

		// Setup state listeners
		if (!this.sessionTrackingActive) {
			SessionListener.addStateChangeListener(
				this.handleStateChange,
				!this.initialEventSent
			);

			this.sessionTrackingActive = true;
		}
	}

	public cleanup() {
		if (this.sessionTrackingActive) {
			SessionListener.removeStateChangeHandler(this.handleStateChange);
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

		this.eventRecoder(SESSION_START_EVENT, attributes);

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

		this.eventRecoder(SESSION_STOP_EVENT, attributes);
	}
}
