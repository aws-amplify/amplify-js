// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isBrowser } from '../isBrowser';
import {
	SessionStateChangeListener,
	SessionState,
	SessionListenerInterface,
} from './types';

let stateChangeListeners = new Set<SessionStateChangeListener>();

export class SessionListenerClass implements SessionListenerInterface {
	constructor() {
		this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

		// Setup state listeners
		if (typeof window !== 'undefined') {
			document.addEventListener(
				'visibilitychange',
				this.handleVisibilityChange,
				false
			);
		}
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

	private handleVisibilityChange() {
		this.notifyHandlers();
	}

	private notifyHandlers() {
		const sessionState = this.getSessionState();

		stateChangeListeners.forEach(listener => {
			listener(sessionState);
		});
	}

	private getSessionState = (): SessionState => {
		if (
			isBrowser() &&
			typeof window !== 'undefined' &&
			document.visibilityState !== 'hidden'
		) {
			return 'started';
		}

		// If, for any reason, document is undefined the session will never start
		return 'ended';
	};
}
