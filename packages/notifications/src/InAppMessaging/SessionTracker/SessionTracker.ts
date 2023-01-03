// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { browserOrNode, ConsoleLogger as Logger } from '@aws-amplify/core';
import noop from 'lodash/noop';
import {
	SessionState,
	SessionStateChangeHandler,
	SessionTrackerInterface,
} from './types';

// Per https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
let hidden: string;
let visibilityChange: string;
const { isBrowser } = browserOrNode();

if (isBrowser && document) {
	if (typeof document.hidden !== 'undefined') {
		hidden = 'hidden';
		visibilityChange = 'visibilitychange';
	} else if (typeof document['msHidden'] !== 'undefined') {
		hidden = 'msHidden';
		visibilityChange = 'msvisibilitychange';
	} else if (typeof document['webkitHidden'] !== 'undefined') {
		hidden = 'webkitHidden';
		visibilityChange = 'webkitvisibilitychange';
	}
}

const logger = new Logger('InAppMessagingSessionTracker');

export default class SessionTracker implements SessionTrackerInterface {
	private sessionStateChangeHandler: SessionStateChangeHandler;

	constructor(sessionStateChangeHandler: SessionStateChangeHandler = noop) {
		this.sessionStateChangeHandler = sessionStateChangeHandler;
	}

	start = (): SessionState => {
		if (isBrowser) {
			document?.addEventListener(
				visibilityChange,
				this.visibilityChangeHandler
			);
		}
		return this.getSessionState();
	};

	end = (): SessionState => {
		if (isBrowser) {
			document?.removeEventListener(
				visibilityChange,
				this.visibilityChangeHandler
			);
		}
		return this.getSessionState();
	};

	private getSessionState = (): SessionState => {
		if (isBrowser && document && !document[hidden]) {
			return 'started';
		}
		// If, for any reason, document is undefined the session will never start
		return 'ended';
	};

	private visibilityChangeHandler = () => {
		if (!isBrowser || !document) {
			return;
		}
		if (document[hidden]) {
			logger.debug('App is now hidden');
			this.sessionStateChangeHandler('ended');
		} else {
			logger.debug('App is now visible');
			this.sessionStateChangeHandler('started');
		}
	};
}
