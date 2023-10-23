// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../../src/eventListeners';
import { assertIsInitialized } from '../../../../../src/pushNotifications/errors/errorHelpers';
import { onNotificationOpened } from '../../../../../src/pushNotifications/providers/pinpoint/apis/onNotificationOpened.native';

jest.mock('../../../../../src/eventListeners');
jest.mock('../../../../../src/pushNotifications/errors/errorHelpers');

describe('onNotificationOpened (native)', () => {
	// create mocks
	const mockHandler = jest.fn();
	// assert mocks
	const mockAddEventListener = addEventListener as jest.Mock;
	const mockAssertIsInitialized = assertIsInitialized as jest.Mock;

	afterEach(() => {
		mockAssertIsInitialized.mockReset();
		mockAddEventListener.mockClear();
	});

	it('must be initialized', () => {
		mockAssertIsInitialized.mockImplementation(() => {
			throw new Error();
		});
		expect(() => onNotificationOpened(mockHandler)).toThrow();
	});

	it('adds an event listener', () => {
		onNotificationOpened(mockHandler);
		expect(mockAddEventListener).toBeCalledWith(
			'notificationOpened',
			mockHandler
		);
	});
});
