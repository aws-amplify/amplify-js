// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SessionListener } from '../../../src/utils/sessionListener/SessionListener';

describe('[Web] Session Listener', () => {
	let sessionListener;
	let eventListenerCallback;

	beforeEach(() => {
		jest.resetAllMocks();
		jest
			.spyOn(document, 'addEventListener')
			.mockImplementation((event, callback) => {
				eventListenerCallback = callback;
			});
		jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

		sessionListener = new SessionListener();
	});

	it('Should register an event listener on initialization', () => {
		expect(document.addEventListener).toHaveBeenCalledWith(
			'visibilitychange',
			expect.any(Function),
			false,
		);
	});

	it('Should notify subscribers on add if specified', () => {
		const mockStateListener = jest.fn();
		sessionListener.addStateChangeListener(mockStateListener, true);

		expect(mockStateListener).toHaveBeenCalledWith('started');
		expect(mockStateListener).toHaveBeenCalledTimes(1);
	});

	it('Should notify subscribers when the app state changes', () => {
		const mockStateListener = jest.fn();
		sessionListener.addStateChangeListener(mockStateListener);

		// Simulate a hidden tab
		jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
		eventListenerCallback();

		expect(mockStateListener).toHaveBeenCalledWith('ended');

		// Simulate a visible table
		jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
		eventListenerCallback();

		expect(mockStateListener).toHaveBeenCalledWith('started');
	});

	it('Should remove subscribers correctly', () => {
		const mockStateListener = jest.fn();
		sessionListener.addStateChangeListener(mockStateListener);

		// Check that the listener is working
		eventListenerCallback();
		expect(mockStateListener).toHaveBeenCalledWith('started');

		// Remove the listener and confirm it stops receiving updates
		sessionListener.removeStateChangeListener(mockStateListener);
		eventListenerCallback();
		expect(mockStateListener).toHaveBeenCalledTimes(1);
	});
});
