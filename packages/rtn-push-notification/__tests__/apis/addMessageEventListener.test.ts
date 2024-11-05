// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addMessageEventListener } from '../../src/apis/addMessageEventListener';
import { nativeEventEmitter } from '../../src/nativeModule';
import { normalizeNativeMessage } from '../../src/utils';
import { completionHandlerId, nativeMessage } from '../testUtils/data';

jest.mock('../../src/nativeModule', () => ({
	nativeEventEmitter: {
		addListener: jest.fn(),
	},
}));
jest.mock('../../src/utils');

describe('addMessageEventListener', () => {
	const event = 'event-type';
	// assert mocks
	const mockAddListenerNative = nativeEventEmitter.addListener as jest.Mock;
	const mockNormalizeNativeMessage = normalizeNativeMessage as jest.Mock;

	afterEach(() => {
		mockNormalizeNativeMessage.mockReset();
		mockAddListenerNative.mockClear();
	});

	it('calls the native addMessageEventListener', () => {
		addMessageEventListener(event, jest.fn());

		expect(mockAddListenerNative).toHaveBeenCalledWith(
			event,
			expect.any(Function),
		);
	});

	it('calls the registered handler with a normalized message', () => {
		mockNormalizeNativeMessage.mockImplementation(message => ({
			...message,
			body: `normalized-${message.body}`,
		}));
		mockAddListenerNative.mockImplementation((_, handler) => {
			handler(nativeMessage);
		});
		const listener = jest.fn();
		addMessageEventListener(event, listener);

		expect(listener).toHaveBeenCalledWith(
			expect.objectContaining({
				body: `normalized-${nativeMessage.body}`,
			}),
			undefined,
		);
	});

	it('passes a completion handler id', () => {
		mockNormalizeNativeMessage.mockImplementation(message => ({
			...message,
			body: `normalized-${message.body}`,
		}));
		mockAddListenerNative.mockImplementation((_, handler) => {
			handler({
				...nativeMessage,
				completionHandlerId,
			});
		});
		const listener = jest.fn();
		addMessageEventListener(event, listener);
		expect(listener).toHaveBeenCalledWith(
			expect.objectContaining({
				body: `normalized-${nativeMessage.body}`,
			}),
			completionHandlerId,
		);
	});
});
