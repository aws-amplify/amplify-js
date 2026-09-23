// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';
import { isBrowser } from '@aws-amplify/core/internals/utils';

import {
	PageViewTrackingOptions,
	TrackerEventRecorder,
	TrackerInterface,
} from '../types/trackers';

const logger = new ConsoleLogger('PageViewTracker');

const DEFAULT_EVENT_NAME = 'pageView';
const DEFAULT_APP_TYPE = 'singlePage';
const DEFAULT_URL_PROVIDER = () => {
	return window.location.origin + window.location.pathname;
};
const PREV_URL_STORAGE_KEY = 'aws-amplify-analytics-prevUrl';

/**
 * Custom event broadcast by the shared history patch (see below) whenever
 * `history.pushState` / `history.replaceState` is invoked. Every active
 * `PageViewTracker` subscribes to it, so a single global patch can drive any
 * number of concurrent tracker instances.
 */
const SPA_NAVIGATION_EVENT = 'amplify-analytics-spa-navigation';

/**
 * Reference-counted, process-global patch of the History API.
 *
 * `PageViewTracker` instances previously each installed their own revocable
 * proxy on `window.history.pushState` / `replaceState`. That is not safe once
 * more than one instance can exist at a time (e.g. `pageView` auto-track enabled
 * on both Pinpoint and Kinesis): the proxies stacked (each instance captured the
 * previous instance's proxy as its "original"), so only the last-installed
 * instance actually received SPA navigations, and disabling providers in the
 * wrong order could leave a revoked proxy installed — throwing on the next
 * `pushState`.
 *
 * Instead the History API is patched exactly once (guarded by a reference
 * count). The patch simply forwards to the native implementation and broadcasts
 * {@link SPA_NAVIGATION_EVENT}; each tracker instance listens for that event.
 * The patch is removed and the native methods restored only when the last
 * instance tears down, so any number of trackers can be enabled / disabled in
 * any order safely.
 */
let historyPatchRefCount = 0;
let nativePushState: History['pushState'] | undefined;
let nativeReplaceState: History['replaceState'] | undefined;

const installHistoryPatch = () => {
	historyPatchRefCount += 1;

	// The patch is shared across all instances; only install it once.
	if (historyPatchRefCount > 1) {
		return;
	}

	nativePushState = window.history.pushState;
	nativeReplaceState = window.history.replaceState;

	const dispatchNavigation = () => {
		window.dispatchEvent(new Event(SPA_NAVIGATION_EVENT));
	};

	window.history.pushState = function pushState(
		...args: Parameters<History['pushState']>
	) {
		nativePushState!.apply(this, args);
		dispatchNavigation();
	};
	window.history.replaceState = function replaceState(
		...args: Parameters<History['replaceState']>
	) {
		nativeReplaceState!.apply(this, args);
		dispatchNavigation();
	};
};

const uninstallHistoryPatch = () => {
	if (historyPatchRefCount === 0) {
		return;
	}

	historyPatchRefCount -= 1;

	// Keep the patch installed while other instances still rely on it.
	if (historyPatchRefCount > 0) {
		return;
	}

	if (nativePushState) {
		window.history.pushState = nativePushState;
		nativePushState = undefined;
	}
	if (nativeReplaceState) {
		window.history.replaceState = nativeReplaceState;
		nativeReplaceState = undefined;
	}
};

export class PageViewTracker implements TrackerInterface {
	private trackerActive: boolean;
	private options: PageViewTrackingOptions;
	private eventRecorder: TrackerEventRecorder;

	/**
	 * `sessionStorage` key used to persist the last-recorded URL. It is
	 * namespaced per provider so that concurrent trackers (e.g. Pinpoint +
	 * Kinesis) each keep their own "previous URL" and every provider records the
	 * page view, rather than the first tracker clobbering the shared key and the
	 * rest silently skipping the event.
	 */
	private readonly storageKey: string;

	// SPA tracking helpers
	private spaTrackingActive: boolean;

	constructor(
		eventRecorder: TrackerEventRecorder,
		options?: PageViewTrackingOptions,
		namespace?: string,
	) {
		this.options = {};
		this.trackerActive = true;
		this.eventRecorder = eventRecorder;
		this.spaTrackingActive = false;
		this.storageKey = namespace
			? `${PREV_URL_STORAGE_KEY}-${namespace}`
			: PREV_URL_STORAGE_KEY;
		this.handleLocationChange = this.handleLocationChange.bind(this);

		this.configure(eventRecorder, options);
	}

	public configure(
		eventRecorder: TrackerEventRecorder,
		options?: PageViewTrackingOptions,
	) {
		this.eventRecorder = eventRecorder;

		// Clean up any existing listeners
		this.cleanup();

		// Apply defaults
		this.options = {
			appType: options?.appType ?? DEFAULT_APP_TYPE,
			attributes: options?.attributes ?? undefined,
			eventName: options?.eventName ?? DEFAULT_EVENT_NAME,
			urlProvider: options?.urlProvider ?? DEFAULT_URL_PROVIDER,
		};

		// Configure SPA or MPA page view tracking
		if (isBrowser()) {
			if (this.options.appType === 'singlePage') {
				this.setupSPATracking();
			} else {
				this.setupMPATracking();
			}

			this.trackerActive = true;
		}
	}

	public cleanup() {
		// No-op if document listener is not active
		if (!this.trackerActive) {
			return;
		}

		// Clean up SPA page view listeners
		if (this.spaTrackingActive) {
			window.removeEventListener(
				SPA_NAVIGATION_EVENT,
				this.handleLocationChange,
			);
			window.removeEventListener('popstate', this.handleLocationChange);
			uninstallHistoryPatch();

			this.spaTrackingActive = false;
		}
	}

	private setupSPATracking() {
		if (!this.spaTrackingActive) {
			// Subscribe to the shared history patch (installed once, ref-counted)
			// plus native `popstate`. Both funnel through `handleLocationChange`.
			installHistoryPatch();
			window.addEventListener(SPA_NAVIGATION_EVENT, this.handleLocationChange);
			window.addEventListener('popstate', this.handleLocationChange);
			sessionStorage.removeItem(this.storageKey);

			this.spaTrackingActive = true;
		}
	}

	private setupMPATracking() {
		this.handleLocationChange();
	}

	private handleLocationChange() {
		const currentUrl = this.options.urlProvider!();
		const eventName = this.options.eventName || DEFAULT_EVENT_NAME;

		if (this.urlHasChanged()) {
			sessionStorage.setItem(this.storageKey, currentUrl);

			// Assemble attribute list
			const attributes = Object.assign(
				{
					url: currentUrl,
				},
				this.options.attributes,
			);

			logger.debug('Recording automatically tracked page view event', {
				eventName,
				attributes,
			});

			this.eventRecorder(eventName, attributes);
		}
	}

	private urlHasChanged() {
		const prevUrl = sessionStorage.getItem(this.storageKey);
		const currUrl = this.options.urlProvider!();

		return currUrl !== prevUrl;
	}
}
