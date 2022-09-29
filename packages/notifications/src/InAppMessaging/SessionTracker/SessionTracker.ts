/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
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
