import { EventTrackOpts } from '../types';
export default class EventTracker {
	private _tracker;
	private _config;
	private _delegates;
	constructor(tracker: any, opts: any);
	configure(opts?: EventTrackOpts): EventTrackOpts;
	private _trackFunc;
}
