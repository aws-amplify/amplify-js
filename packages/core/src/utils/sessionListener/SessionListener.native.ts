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
		console.log('+ handleStateChange currentAppState', this.currentAppState);

		if (
			(this.currentAppState === undefined ||
				this.currentAppState.match(/inactive|background/)) &&
			nextAppState === 'active'
		) {
			console.log('+ Session listener active');
			this.currentAppState = nextAppState;
			this.notifyHandlers();
		} else if (
			this.currentAppState?.match(/active/) &&
			nextAppState.match(/inactive|background/)
		) {
			console.log('+ Session listener background');
			this.currentAppState = nextAppState;
			this.notifyHandlers();
		}
	}

	private notifyHandlers() {
		const sessionState = this.getSessionState();

		console.log('+ Notify handlers state', sessionState);

		stateChangeListeners.forEach(listener => {
			listener(sessionState);
		});
	}

	private getSessionState = (): SessionState => {
		console.log('+ getSessionState current state', this.currentAppState);

		// Current app state will be undefined when the app is first started
		if (
			this.currentAppState === undefined ||
			this.currentAppState === 'active'
		) {
			return 'started';
		}

		// Consider any other app state as ended
		return 'ended';
	};
}
