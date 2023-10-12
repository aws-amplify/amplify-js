// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAppState } from '@aws-amplify/react-native';
import {
	SessionTrackingOpts,
	TrackerEventRecorder,
	TrackerInterface,
} from '../types/trackers';

const SESSION_START_EVENT = '_session.start';
const SESSION_STOP_EVENT = '_session.stop';

export class SessionTracker implements TrackerInterface {
	private options: SessionTrackingOpts;
	private eventRecoder: TrackerEventRecorder;
	private initialEventSend: boolean;
	private sessionTrackingActive: boolean;

	constructor(
		eventRecorder: TrackerEventRecorder,
		options?: SessionTrackingOpts
	) {
		this.options = {};
		this.eventRecoder = eventRecorder;
		this.initialEventSend = false;
		this.sessionTrackingActive = false;

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
			loadAppState().addEventListener('change', this.handleStateChange, false);

			this.sessionTrackingActive = true;
		}
	}

	public cleanup() {
		if (this.sessionTrackingActive) {
			loadAppState().removeEventListener(
				'change',
				this.handleStateChange,
				false
			);
		}

		this.sessionTrackingActive = false;
	}

	private handleStateChange(nextAppState: string) {
		const currentState = loadAppState().currentState;

		if (
			currentState.match(/inactive|background/) &&
			nextAppState === 'active'
		) {
			this.startSession();
		} else if (
			currentState.match(/active/) &&
			nextAppState.match(/inactive|background/)
		) {
			this.stopSession();
		}

		this.stopSession();
	}

	private startSession() {
		this.eventRecoder(SESSION_START_EVENT, this.options.attributes ?? {});
	}

	private stopSession() {
		this.eventRecoder(SESSION_STOP_EVENT, this.options.attributes ?? {});
	}
}
