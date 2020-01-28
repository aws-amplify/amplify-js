import { pageViewTrackOpts } from '../types';
export default class PageViewTracker {
	private _config;
	private _tracker;
	private _hasEnabled;
	constructor(tracker: any, opts: any);
	configure(opts?: pageViewTrackOpts): pageViewTrackOpts;
	private _isSameUrl;
	private _pageViewTrackDefault;
	private _trackFunc;
	private _pageViewTrackSPA;
}
