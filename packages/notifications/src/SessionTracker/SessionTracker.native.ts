import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { AppState, AppStateStatus } from 'react-native';
import noop from 'lodash/noop';
import {
	SessionState,
	SessionStateChangeHandler,
	SessionTrackerInterface,
} from './types';

const isActive = appState => appState === 'active';
const isInactive = appState =>
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

	private appStateChangeHandler = nextAppState => {
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
