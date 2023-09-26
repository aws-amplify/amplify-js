// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AppState } from 'react-native';
import SessionTracker from '../../../src/inAppMessaging/SessionTracker/SessionTracker.native';

jest.mock('react-native', () => ({
	AppState: {
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
	},
}));
jest.mock('@aws-amplify/core');

const mockAddEventListener = AppState.addEventListener as jest.Mock;
const mockRemoveEventListener = AppState.removeEventListener as jest.Mock;

describe('SessionTracker', () => {
	const mockAppStateChangeHandler = jest.fn();
	let tracker;

	beforeEach(() => {
		jest.clearAllMocks();
		tracker = new SessionTracker(mockAppStateChangeHandler);
	});

	test('starts tracking', () => {
		tracker.start();
		expect(mockAddEventListener).toBeCalled();
	});

	test('ends tracking', () => {
		tracker.end();
		expect(mockRemoveEventListener).toBeCalled();
	});

	test('calls a change handler with ended if going inactive', () => {
		mockAddEventListener.mockImplementation((_, handler) => {
			handler('inactive');
		});
		tracker.start();
		expect(mockAppStateChangeHandler).toBeCalledWith('ended');
	});

	test('calls a change handler with ended if going background', () => {
		mockAddEventListener.mockImplementation((_, handler) => {
			handler('background');
		});
		tracker.start();
		expect(mockAppStateChangeHandler).toBeCalledWith('ended');
	});

	test('calls a change handler with started if going active', () => {
		mockAddEventListener.mockImplementation((_, handler) => {
			handler('inactive');
			handler('active');
		});
		tracker.start();
		expect(mockAppStateChangeHandler).toBeCalledWith('started');
	});
});
