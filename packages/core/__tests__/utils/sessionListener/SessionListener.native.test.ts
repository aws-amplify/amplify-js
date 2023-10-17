// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SessionListenerClass } from '../../../src/utils/sessionListener/SessionListener.native';

const mockAddEventListener = jest.fn();

jest.mock('react-native');
jest.mock('@aws-amplify/react-native', () => ({
	loadAppState: () => ({
		addEventListener: mockAddEventListener,
	}),
}));

describe('[RN] Session Listener', () => {
	let sessionListener;
	let eventListenerCallback;

	beforeEach(() => {
		jest.resetAllMocks();
		mockAddEventListener.mockImplementation((event, callback) => {
			eventListenerCallback = callback;
		});

		sessionListener = new SessionListenerClass();
	});

	it('Should register an event listener on initialization', () => {
		expect(mockAddEventListener).toHaveBeenCalledWith(
			'change',
			expect.any(Function),
			false
		);
	});

	it('Should notify subscribers on add if specified', () => {
		// Simulate the app being in the background on add
		eventListenerCallback('background');
		const mockStateListener = jest.fn();
		sessionListener.addStateChangeListener(mockStateListener, true);

		expect(mockStateListener).toBeCalledWith('ended');
		expect(mockStateListener).toHaveBeenCalledTimes(1);

		// Simulate the app being already being in the foreground on add
		eventListenerCallback('active');

		const mockStateListener2 = jest.fn();
		sessionListener.addStateChangeListener(mockStateListener2, true);

		expect(mockStateListener2).toBeCalledWith('started');
		expect(mockStateListener2).toHaveBeenCalledTimes(1);
	});

	it('Should notify subscribers when the app state changes', () => {
		const mockStateListener = jest.fn();
		sessionListener.addStateChangeListener(mockStateListener);

		// Simulate the app being in the foreground
		eventListenerCallback('active');

		expect(mockStateListener).toBeCalledWith('started');

		// Simulate the app moving to inactive
		eventListenerCallback('inactive');

		expect(mockStateListener).toBeCalledWith('ended');

		// Simulate the app moving to background from inactive (shouldn't generate another call)
		eventListenerCallback('background');
		expect(mockStateListener).toHaveBeenCalledTimes(2);
	});

	it('Should remove subscribers correctly', () => {
		const mockStateListener = jest.fn();
		sessionListener.addStateChangeListener(mockStateListener);

		// Check that the listener is working
		eventListenerCallback('active');
		expect(mockStateListener).toBeCalledWith('started');

		// Remove the listener and confirm it stops receiving updates
		sessionListener.removeStateChangeHandler(mockStateListener);
		eventListenerCallback('background');
		expect(mockStateListener).toBeCalledTimes(1);
	});
});
