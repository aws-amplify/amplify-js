// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';
import {
	AppState,
	AppStateStatus,
	NativeEventSubscription,
} from 'react-native';
import noop from 'lodash/noop';
import {
	SessionState,
	SessionStateChangeHandler,
	SessionTrackerInterface,
} from './types';

const isActive = (appState: AppStateStatus) => appState === 'active';
const isInactive = (appState: AppStateStatus) =>
	appState === 'inactive' || appState === 'background';

const logger = new ConsoleLogger('InAppMessagingSessionTracker');

export default class SessionTracker implements SessionTrackerInterface {
	private currentAppState: AppStateStatus;
	private sessionStateChangeHandler: SessionStateChangeHandler;
	private eventSubcription: NativeEventSubscription | undefined;
	constructor(sessionStateChangeHandler: SessionStateChangeHandler = noop) {
		this.currentAppState = 'active';
		this.sessionStateChangeHandler = sessionStateChangeHandler;
	}

	start = (): SessionState => {
		this.eventSubcription = AppState.addEventListener(
			'change',
			this.appStateChangeHandler
		);
		return this.getSessionState();
	};

	end = (): SessionState => {
		this.eventSubcription?.remove();
		return this.getSessionState();
	};

	private getSessionState = (): SessionState => {
		if (isActive(this.currentAppState)) {
			return 'started';
		}
		// consider any other app state as session ended
		return 'ended';
	};

	private appStateChangeHandler = (nextAppState: AppStateStatus) => {
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
