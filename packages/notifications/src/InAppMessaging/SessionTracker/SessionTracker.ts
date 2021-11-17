import noop from 'lodash/noop';
import { SessionStateChangeHandler, SessionTrackerInterface } from './types';

export default class SessionTracker implements SessionTrackerInterface {
	constructor(sessionStateChangeHandler: SessionStateChangeHandler = noop) {}
	start = noop as SessionTrackerInterface['start'];
	end = noop as SessionTrackerInterface['end'];
}
