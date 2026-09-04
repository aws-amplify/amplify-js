// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { addEventListener } from '../../../../../src/eventListeners';
import { recordAnalyticsEvent } from '../../../../../src/inAppMessaging/providers/pinpoint/utils/helpers';
import { isInitialized } from '../../../../../src/inAppMessaging/utils';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	Hub: { listen: jest.fn() },
}));
jest.mock('../../../../../src/eventListeners');
jest.mock('../../../../../src/inAppMessaging/providers/pinpoint/utils/helpers');
jest.mock('../../../../../src/inAppMessaging/utils', () => ({
	...jest.requireActual('../../../../../src/inAppMessaging/utils'),
	isInitialized: jest.fn(),
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	sessionListener: { addStateChangeListener: jest.fn() },
}));

const mockAddEventListener = addEventListener as jest.Mock;
const mockRecordAnalyticsEvent = recordAnalyticsEvent as jest.Mock;
const mockIsInitialized = isInitialized as jest.Mock;

describe('initializeInAppMessaging — reconfigure support', () => {
	// Must import after mocks are set up
	let initializeInAppMessaging: (...args: any[]) => void;

	const configA = { appId: 'app-A', region: 'us-west-2' };
	const configB = { appId: 'app-B', region: 'us-east-1' };
	const ctxA = createMockAmplifyContext({
		Notifications: { InAppMessaging: { Pinpoint: configA } },
	});
	const ctxB = createMockAmplifyContext({
		Notifications: { InAppMessaging: { Pinpoint: configB } },
	});

	beforeAll(() => {
		({
			initializeInAppMessaging,
		} = require('../../../../../src/inAppMessaging/providers/pinpoint/apis'));
	});

	beforeEach(() => {
		mockIsInitialized.mockReturnValue(false);
	});

	afterEach(() => {
		jest.clearAllMocks();
		clearGlobalContext();
	});

	it('event listeners use updated global context after reconfigure', () => {
		setGlobalContext(ctxA);

		// Capture the event handlers registered by initializeInAppMessaging
		const handlers: Record<string, (message: any) => void> = {};
		mockAddEventListener.mockImplementation((event: string, handler: any) => {
			handlers[event] = handler;
		});

		initializeInAppMessaging();

		// Fire messageDisplayed event — should use ctxA
		const testMessage = { id: 'msg-1', layout: 'TOP_BANNER', content: [] };
		handlers.messageDisplayed(testMessage);
		expect(mockRecordAnalyticsEvent).toHaveBeenCalledWith(
			ctxA,
			expect.anything(),
			testMessage,
		);

		// Reconfigure — swap global context to ctxB
		setGlobalContext(ctxB);
		mockRecordAnalyticsEvent.mockClear();

		// Fire messageDismissed event — should now use ctxB
		handlers.messageDismissed(testMessage);
		expect(mockRecordAnalyticsEvent).toHaveBeenCalledWith(
			ctxB,
			expect.anything(),
			testMessage,
		);
	});

	it('explicit ctx remains pinned even after global context changes', () => {
		const explicitCtx = createMockAmplifyContext({
			Notifications: { InAppMessaging: { Pinpoint: configA } },
		});

		setGlobalContext(ctxB);

		const handlers: Record<string, (message: any) => void> = {};
		mockAddEventListener.mockImplementation((event: string, handler: any) => {
			handlers[event] = handler;
		});

		// Initialize with explicit context
		initializeInAppMessaging(explicitCtx);

		// Change global context
		setGlobalContext(ctxA);

		// Fire event — should still use explicitCtx
		const testMessage = { id: 'msg-2', layout: 'BOTTOM_BANNER', content: [] };
		handlers.messageActionTaken(testMessage);
		expect(mockRecordAnalyticsEvent).toHaveBeenCalledWith(
			explicitCtx,
			expect.anything(),
			testMessage,
		);
	});
});
