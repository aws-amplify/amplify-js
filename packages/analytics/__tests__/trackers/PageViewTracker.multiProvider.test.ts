// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PageViewTracker } from '../../src/trackers/PageViewTracker';

/**
 * Regression coverage for concurrent `PageViewTracker` instances.
 *
 * Before `configureAutoTrack` existed on more than one provider, at most one
 * `PageViewTracker` could be active at a time. Now that Pinpoint, Kinesis and
 * Kinesis Firehose can each enable `pageView` auto-track, multiple instances can
 * coexist. These tests exercise that scenario end-to-end (real history patch +
 * a functional `sessionStorage`), which the per-provider suites — that mock the
 * trackers — cannot.
 */

const PREV_URL_STORAGE_KEY = 'aws-amplify-analytics-prevUrl';

const createSessionStorage = () => {
	const store = new Map<string, string>();

	return {
		store,
		getItem: jest.fn((key: string) =>
			store.has(key) ? (store.get(key) as string) : null,
		),
		setItem: jest.fn((key: string, value: string) => {
			store.set(key, String(value));
		}),
		removeItem: jest.fn((key: string) => {
			store.delete(key);
		}),
	};
};

let mockSessionStorage = createSessionStorage();

Object.defineProperty(window, 'sessionStorage', {
	get: () => mockSessionStorage,
	configurable: true,
});

describe('PageViewTracker: multiple concurrent providers', () => {
	// The native history methods captured before any tracker patches them.
	const nativePushState = window.history.pushState;
	const nativeReplaceState = window.history.replaceState;

	let currentUrl: string;
	const urlProvider = () => currentUrl;
	const activeTrackers: PageViewTracker[] = [];

	const createTracker = (recorder: jest.Mock, namespace?: string) => {
		const tracker = new PageViewTracker(
			recorder,
			{ appType: 'singlePage', urlProvider },
			namespace,
		);
		activeTrackers.push(tracker);

		return tracker;
	};

	beforeEach(() => {
		mockSessionStorage = createSessionStorage();
		currentUrl = 'http://localhost:3000/page-1';
	});

	afterEach(() => {
		// Tear down every tracker so the shared, ref-counted history patch is
		// fully removed between tests (cleanup is idempotent).
		while (activeTrackers.length) {
			activeTrackers.pop()!.cleanup();
		}
		jest.clearAllMocks();
	});

	it('records the page view to every provider on SPA navigation (no shared-key clobbering)', () => {
		const pinpointRecorder = jest.fn();
		const kinesisRecorder = jest.fn();

		createTracker(pinpointRecorder, 'pinpoint');
		createTracker(kinesisRecorder, 'kinesis');

		// Neither tracker records on setup for SPAs.
		expect(pinpointRecorder).not.toHaveBeenCalled();
		expect(kinesisRecorder).not.toHaveBeenCalled();

		// A single SPA navigation must reach BOTH providers.
		currentUrl = 'http://localhost:3000/page-2';
		window.history.pushState({}, '', '/page-2');

		expect(pinpointRecorder).toHaveBeenCalledTimes(1);
		expect(pinpointRecorder).toHaveBeenCalledWith('pageView', {
			url: 'http://localhost:3000/page-2',
		});
		expect(kinesisRecorder).toHaveBeenCalledTimes(1);
		expect(kinesisRecorder).toHaveBeenCalledWith('pageView', {
			url: 'http://localhost:3000/page-2',
		});

		// Each provider persists its previous URL under its own namespaced key.
		expect(
			mockSessionStorage.store.get(`${PREV_URL_STORAGE_KEY}-pinpoint`),
		).toBe('http://localhost:3000/page-2');
		expect(
			mockSessionStorage.store.get(`${PREV_URL_STORAGE_KEY}-kinesis`),
		).toBe('http://localhost:3000/page-2');
	});

	it('keeps other providers tracking after one provider is disabled', () => {
		const pinpointRecorder = jest.fn();
		const kinesisRecorder = jest.fn();

		const pinpointTracker = createTracker(pinpointRecorder, 'pinpoint');
		createTracker(kinesisRecorder, 'kinesis');

		currentUrl = 'http://localhost:3000/page-2';
		window.history.pushState({}, '', '/page-2');
		expect(pinpointRecorder).toHaveBeenCalledTimes(1);
		expect(kinesisRecorder).toHaveBeenCalledTimes(1);

		// Disable the first provider; the shared history patch must remain
		// installed for the still-active provider.
		pinpointTracker.cleanup();

		currentUrl = 'http://localhost:3000/page-3';
		window.history.pushState({}, '', '/page-3');

		// Pinpoint stops receiving events; Kinesis keeps working.
		expect(pinpointRecorder).toHaveBeenCalledTimes(1);
		expect(kinesisRecorder).toHaveBeenCalledTimes(2);
		expect(kinesisRecorder).toHaveBeenLastCalledWith('pageView', {
			url: 'http://localhost:3000/page-3',
		});
	});

	it('restores native history methods and does not throw once all providers are disabled', () => {
		const pinpointTracker = createTracker(jest.fn(), 'pinpoint');
		const kinesisTracker = createTracker(jest.fn(), 'kinesis');

		// Disable in the order that used to leave a revoked proxy installed.
		pinpointTracker.cleanup();
		kinesisTracker.cleanup();

		// The next navigation must not throw (old code left a revoked Proxy here).
		expect(() => {
			window.history.pushState({}, '', '/page-4');
		}).not.toThrow();

		// Native History methods are fully restored (patch reference count hit 0).
		expect(window.history.pushState).toBe(nativePushState);
		expect(window.history.replaceState).toBe(nativeReplaceState);
	});

	it('dispatches to every active provider on popstate navigation', () => {
		const pinpointRecorder = jest.fn();
		const kinesisRecorder = jest.fn();

		createTracker(pinpointRecorder, 'pinpoint');
		createTracker(kinesisRecorder, 'kinesis');

		currentUrl = 'http://localhost:3000/page-2';
		window.dispatchEvent(new Event('popstate'));

		expect(pinpointRecorder).toHaveBeenCalledTimes(1);
		expect(kinesisRecorder).toHaveBeenCalledTimes(1);
	});

	it('uses the un-namespaced default storage key when no namespace is provided', () => {
		// Locks in backwards-compatible behaviour for providers (e.g. Pinpoint)
		// that do not pass a namespace.
		const recorder = jest.fn();
		const tracker = new PageViewTracker(
			recorder,
			{ appType: 'multiPage', urlProvider },
			// no namespace
		);
		activeTrackers.push(tracker);

		expect(recorder).toHaveBeenCalledWith('pageView', {
			url: 'http://localhost:3000/page-1',
		});
		expect(mockSessionStorage.store.get(PREV_URL_STORAGE_KEY)).toBe(
			'http://localhost:3000/page-1',
		);
		expect(
			mockSessionStorage.store.has(`${PREV_URL_STORAGE_KEY}-pinpoint`),
		).toBe(false);
	});
});
