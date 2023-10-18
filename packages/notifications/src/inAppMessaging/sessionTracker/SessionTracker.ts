// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { isBrowser } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';
import noop from 'lodash/noop';
import {
	SessionState,
	SessionStateChangeHandler,
	SessionTrackerInterface,
} from './types';

const logger = new ConsoleLogger('InAppMessagingSessionTracker');

export default class SessionTracker implements SessionTrackerInterface {
	// Per https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
	private hiddenType: string = 'hidden';
	private visibilityChange: string = 'visibilitychange';
	private localDocument: any;

	private sessionStateChangeHandler: SessionStateChangeHandler;

	constructor(sessionStateChangeHandler: SessionStateChangeHandler = noop) {
		this.sessionStateChangeHandler = sessionStateChangeHandler;
		if (isBrowser() && document) {
			this.localDocument = document;
			if (typeof this.localDocument.hidden !== 'undefined') {
				this.hiddenType = 'hidden';
				this.visibilityChange = 'visibilitychange';
			} else if (typeof this.localDocument['msHidden'] !== 'undefined') {
				this.hiddenType = 'msHidden';
				this.visibilityChange = 'msvisibilitychange';
			} else if (typeof this.localDocument['webkitHidden'] !== 'undefined') {
				this.hiddenType = 'webkitHidden';
				this.visibilityChange = 'webkitvisibilitychange';
			}
		}
	}

	start = (): SessionState => {
		if (isBrowser()) {
			this.localDocument?.addEventListener(
				this.visibilityChange,
				this.visibilityChangeHandler
			);
		}
		return this.getSessionState();
	};

	end = (): SessionState => {
		if (isBrowser()) {
			this.localDocument?.removeEventListener(
				this.visibilityChange,
				this.visibilityChangeHandler
			);
		}
		return this.getSessionState();
	};

	private getSessionState = (): SessionState => {
		if (
			isBrowser() &&
			this.localDocument &&
			!this.localDocument[this.hiddenType]
		) {
			return 'started';
		}
		// If, for any reason, document is undefined the session will never start
		return 'ended';
	};

	private visibilityChangeHandler = () => {
		if (!isBrowser() || !this.localDocument) {
			return;
		}
		if (this.localDocument[this.hiddenType]) {
			logger.debug('App is now hidden');
			this.sessionStateChangeHandler('ended');
		} else {
			logger.debug('App is now visible');
			this.sessionStateChangeHandler('started');
		}
	};
}
