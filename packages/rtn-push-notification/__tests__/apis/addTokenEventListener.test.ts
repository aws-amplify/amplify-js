// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addTokenEventListener } from '../../src/apis/addTokenEventListener';
import { nativeEventEmitter } from '../../src/nativeModule';
import { eventType } from '../testUtils/data';

jest.mock('../../src/nativeModule', () => ({
	nativeEventEmitter: {
		addListener: jest.fn(),
	},
}));

describe('addTokenEventListener', () => {
	const token = 'token';
	// assert mocks
	const mockAddListenerNative = nativeEventEmitter.addListener as jest.Mock;

	afterEach(() => {
		mockAddListenerNative.mockClear();
	});

	it('calls the native addTokenEventListener', () => {
		addTokenEventListener(eventType, jest.fn());

		expect(mockAddListenerNative).toHaveBeenCalledWith(
			eventType,
			expect.any(Function)
		);
	});

	it('calls the registered handler with a token', () => {
		mockAddListenerNative.mockImplementation((_, handler) => {
			handler({ token });
		});
		const listener = jest.fn();
		addTokenEventListener(eventType, listener);

		expect(listener).toHaveBeenCalledWith(token);
	});
});
