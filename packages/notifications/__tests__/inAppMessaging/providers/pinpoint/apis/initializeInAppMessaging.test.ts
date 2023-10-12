// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import {
	notifyEventListeners,
	addEventListener,
} from '../../../../../src/common';
import { initializeInAppMessaging } from '../../../../../src/inAppMessaging/providers/pinpoint/apis';
import SessionTracker from '../../../../../src/inAppMessaging/sessionTracker';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/utils');
jest.mock('../../../../../src/common/eventListeners');
jest.mock('../../../../../src/inAppMessaging/sessionTracker', () => {
	return jest.fn().mockImplementation(() => {
		return { start: jest.fn() };
	});
});

const mockNotifyEventListeners = notifyEventListeners as jest.Mock;
const mockAddEventListener = addEventListener as jest.Mock;

describe('InializeInAppMessaging', () => {
	beforeEach(() => {
		mockNotifyEventListeners.mockClear();
	});
	it('will intialize session tracking, analytics listeners and in-app events listeners', async () => {
		initializeInAppMessaging();

		expect(SessionTracker).toHaveBeenCalledTimes(1);
		expect(mockAddEventListener).toHaveBeenNthCalledWith(
			1,
			'messageDisplayed',
			expect.any(Function)
		);
		expect(mockAddEventListener).toHaveBeenNthCalledWith(
			2,
			'messageDismissed',
			expect.any(Function)
		);
		expect(mockAddEventListener).toHaveBeenNthCalledWith(
			3,
			'messageActionTaken',
			expect.any(Function)
		);
		expect(Hub.listen).toHaveBeenCalledWith('analytics', expect.any(Function));
	});
});
