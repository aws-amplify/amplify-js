/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { AppState, AppStateStatus } from 'react-native';
import noop from 'lodash/noop';
import {
	SessionState,
	SessionStateChangeHandler,
	SessionTrackerInterface,
} from './types';

const isActive = (appState) => appState === 'active';
const isInactive = (appState) =>
	appState === 'inactive' || appState === 'background';

const logger = new Logger('InAppMessagingSessionTracker');

export default class SessionTracker implements SessionTrackerInterface {
	private currentAppState: AppStateStatus;
	private sessionStateChangeHandler: SessionStateChangeHandler;

	constructor(sessionStateChangeHandler: SessionStateChangeHandler = noop) {
		this.currentAppState = 'active';
		this.sessionStateChangeHandler = sessionStateChangeHandler;
	}

	start = (): SessionState => {
		AppState.addEventListener('change', this.appStateChangeHandler);
		return this.getSessionState();
	};

	end = (): SessionState => {
		AppState.removeEventListener('change', this.appStateChangeHandler);
		return this.getSessionState();
	};

	private getSessionState = (): SessionState => {
		if (isActive(this.currentAppState)) {
			return 'started';
		}
		// consider any other app state as session ended
		return 'ended';
	};

	private appStateChangeHandler = (nextAppState) => {
		// if going from active to inactive
		if (isActive(this.currentAppState) && isInactive(nextAppState)) {
			logger.debug('App has gone to the background');
			this.sessionStateChangeHandler('ended');
		}
		// if going from inactive to active
		if (isInactive(this.currentAppState) && isActive(nextAppState)) {
			logger.debug('App has come to the foreground');
			this.sessionStateChangeHandler('started');
		}
		// otherwise do nothing but always update current state
		this.currentAppState = nextAppState;
	};
}
