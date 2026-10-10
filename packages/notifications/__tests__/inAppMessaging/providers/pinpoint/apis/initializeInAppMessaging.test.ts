// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import { Hub } from '@aws-amplify/core';
import {
	clearGlobalContext,
	sessionListener,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import {
	addEventListener,
	notifyEventListeners,
} from '../../../../../src/eventListeners';
import { initializeInAppMessaging } from '../../../../../src/inAppMessaging/providers/pinpoint/apis';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	Hub: { listen: jest.fn() },
}));
jest.mock('../../../../../src/eventListeners');
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	sessionListener: { addStateChangeListener: jest.fn() },
}));

const mockNotifyEventListeners = notifyEventListeners as jest.Mock;
const mockAddEventListener = addEventListener as jest.Mock;

describe('initializeInAppMessaging', () => {
	beforeAll(() => {
		setGlobalContext(createMockAmplifyContext());
	});

	afterAll(() => {
		clearGlobalContext();
	});

	beforeEach(() => {
		mockNotifyEventListeners.mockClear();
	});
	it('will intialize session tracking, analytics listeners and in-app events listeners', async () => {
		initializeInAppMessaging();

		expect(sessionListener.addStateChangeListener).toHaveBeenCalledTimes(1);
		expect(mockAddEventListener).toHaveBeenNthCalledWith(
			1,
			'messageDisplayed',
			expect.any(Function),
		);
		expect(mockAddEventListener).toHaveBeenNthCalledWith(
			2,
			'messageDismissed',
			expect.any(Function),
		);
		expect(mockAddEventListener).toHaveBeenNthCalledWith(
			3,
			'messageActionTaken',
			expect.any(Function),
		);
		expect(Hub.listen).toHaveBeenCalledWith('analytics', expect.any(Function));
	});
});
