// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger as ConsoleLogger } from '@aws-amplify/core/internals/utils';
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
	private sessionTrackingActive: boolean;
	private initialEventSend: boolean;

	constructor(
		eventRecorder: TrackerEventRecorder,
		options?: SessionTrackingOpts
	) {
		this.options = {};
		this.eventRecoder = eventRecorder;
		this.sessionTrackingActive = false;
		this.initialEventSend = false;
		this.handleUnload = this.handleUnload.bind(this);
		this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

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

		// Send the initial session start event
		// NOTE: The initial event will not be re-sent on re-configuration (e.g. to add additional custom attributes)
		if (!this.initialEventSend) {
			this.startSession();
			this.initialEventSend = true;
		}

		// Setup state listeners
		if (!this.sessionTrackingActive) {
			document.addEventListener(
				'visibilitychange',
				this.handleVisibilityChange,
				false
			);
			window.addEventListener('beforeunload', this.handleUnload, false);

			this.sessionTrackingActive = true;
		}
	}

	public cleanup() {
		if (this.sessionTrackingActive) {
			document.removeEventListener(
				'visibilitychange',
				this.handleVisibilityChange,
				false
			);
			window.removeEventListener('beforeunload', this.handleUnload, false);
		}

		this.sessionTrackingActive = false;
	}

	private handleVisibilityChange() {
		if (document.visibilityState === 'hidden') {
			this.stopSession();
		} else {
			this.startSession();
		}
	}

	private handleUnload() {
		this.stopSession();
	}

	private startSession() {
		const attributes = this.options.attributes ?? {};

		logger.debug('Recording automatically tracked page view event', {
			SESSION_START_EVENT,
			attributes,
		});

		this.eventRecoder(SESSION_START_EVENT, attributes);
	}

	private stopSession() {
		const attributes = this.options.attributes ?? {};

		logger.debug('Recording automatically tracked page view event', {
			SESSION_STOP_EVENT,
			attributes,
		});

		this.eventRecoder(SESSION_STOP_EVENT, attributes);
	}
}
