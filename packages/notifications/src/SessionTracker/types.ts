export type SessionState = 'started' | 'ended';

export type SessionStateChangeHandler = (state: SessionState) => void;

export interface SessionTrackerInterface {
	start: () => SessionState;
	end: () => SessionState;
}
