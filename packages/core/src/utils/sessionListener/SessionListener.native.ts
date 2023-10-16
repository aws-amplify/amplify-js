// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAppState } from '@aws-amplify/react-native';
import { isBrowser } from '../isBrowser';
import {
	SessionStateChangeListener,
	SessionState,
	SessionListenerInterface,
} from './types';

let stateChangeListeners = new Set<SessionStateChangeListener>();

export class SessionListenerClass implements SessionListenerInterface {
	private currentAppState?: string;

	constructor() {
		this.currentAppState = loadAppState().currentAppState;
		this.handleStateChange = this.handleStateChange.bind(this);

		// Setup state listeners
		loadAppState().addEventListener('change', this.handleStateChange, false);
	}

	public addStateChangeListener(
		listener: SessionStateChangeListener,
		notifyOnAdd: boolean = false
	) {
		stateChangeListeners.add(listener);

		// Notify new handlers of the current status on add
		if (notifyOnAdd) {
			listener(this.getSessionState());
		}
	}

	public removeStateChangeHandler(handler: SessionStateChangeListener) {
		stateChangeListeners.delete(handler);
	}

	private handleStateChange(nextAppState: string) {
		if (
			(this.currentAppState === undefined ||
				this.currentAppState.match(/inactive|background/)) &&
			nextAppState === 'active'
		) {
			this.notifyHandlers();
		} else if (
			this.currentAppState?.match(/active/) &&
			nextAppState.match(/inactive|background/)
		) {
			this.notifyHandlers();
		}

		this.currentAppState = nextAppState;
	}

	private notifyHandlers() {
		const sessionState = this.getSessionState();

		stateChangeListeners.forEach(listener => {
			listener(sessionState);
		});
	}

	private getSessionState = (): SessionState => {
		if (loadAppState().currentAppState === 'active') {
			return 'started';
		}

		// Consider any other app state as ended
		return 'ended';
	};
}
