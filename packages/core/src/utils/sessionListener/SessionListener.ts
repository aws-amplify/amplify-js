// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isBrowser } from '../isBrowser';
import { SessionStateChangeListener, SessionListenerInterface } from './types';

const stateChangeListeners = new Set<SessionStateChangeListener>();

export class SessionListener implements SessionListenerInterface {
	private listenerActive: boolean;

	constructor() {
		this.listenerActive = false;
		this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

		// Setup state listeners
		if (isBrowser()) {
			document.addEventListener(
				'visibilitychange',
				this.handleVisibilityChange,
				false
			);

			this.listenerActive = true;
		}
	}

	public addStateChangeListener(
		listener: SessionStateChangeListener,
		notifyOnAdd: boolean = false
	) {
		// No-op if document listener is not active
		if (!this.listenerActive) {
			return;
		}

		stateChangeListeners.add(listener);

		// Notify new handlers of the current status on add
		if (notifyOnAdd) {
			listener(this.getSessionState());
		}
	}

	public removeStateChangeListener(handler: SessionStateChangeListener) {
		// No-op if document listener is not active
		if (!this.listenerActive) {
			return;
		}

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

	private getSessionState() {
		if (isBrowser() && document.visibilityState !== 'hidden') {
			return 'started';
		}

		// If, for any reason, document is undefined the session will never start
		return 'ended';
	}
}
