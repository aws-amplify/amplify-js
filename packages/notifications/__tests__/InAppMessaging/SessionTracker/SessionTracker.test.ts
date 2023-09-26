// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { browserOrNode, ConsoleLogger as Logger } from '@aws-amplify/core';

jest.mock('@aws-amplify/core');

const documentSpy = jest.spyOn(global as any, 'document', 'get');
const mockBrowserOrNode = browserOrNode as jest.Mock;
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

const MODULE_PATH = '../../../src/inAppMessaging/sessionTracker';

describe('SessionTracker', () => {
	let tracker, SessionTracker;
	beforeEach(() => {
		jest.clearAllMocks();
		documentSpy.mockReturnValue({
			addEventListener: mockAddEventListener,
			removeEventListener: mockRemoveEventListener,
		});
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	test('only starts on browser', () => {
		jest.isolateModules(() => {
			mockBrowserOrNode.mockReturnValue({ isBrowser: false });
			SessionTracker = require(MODULE_PATH).default;
			tracker = new SessionTracker();
			tracker.start();
			expect(mockAddEventListener).not.toBeCalled();
		});
	});

	describe('on browser', () => {
		beforeEach(() => {
			mockBrowserOrNode.mockReturnValue({ isBrowser: true });
			jest.isolateModules(() => {
				SessionTracker = require(MODULE_PATH).default;
				tracker = new SessionTracker();
			});
		});

		test('starts tracking', () => {
			tracker.start();
			expect(mockAddEventListener).toBeCalled();
		});

		test('ends tracking', () => {
			tracker.end();
			expect(mockRemoveEventListener).toBeCalled();
		});
	});

	describe('visibility change handling', () => {
		const mockVisibilityChangeHandler = jest.fn();

		const commonVisibilityTest = ({
			visibilityChange = 'visibilitychange',
			state = 'started',
			hidden = 'hidden',
			isHidden = false,
		}) => {
			jest.isolateModules(() => {
				mockAddEventListener.mockImplementation((_, handler) => {
					handler();
				});
				documentSpy.mockReturnValue({
					addEventListener: mockAddEventListener,
					[hidden]: isHidden,
				});
				SessionTracker = require(MODULE_PATH).default;
				tracker = new SessionTracker(mockVisibilityChangeHandler);
				tracker.start();
				expect(mockAddEventListener).toBeCalledWith(
					visibilityChange,
					expect.any(Function)
				);
				expect(mockVisibilityChangeHandler).toBeCalledWith(state);
			});
		};

		const expectHandlerToBeCalledWith = (isHidden, state) => {
			commonVisibilityTest({ isHidden, state });
		};

		const expectBrowserCompatibilityWith = (hidden, visibilityChange) => {
			commonVisibilityTest({ hidden, visibilityChange });
		};

		beforeEach(() => {
			mockBrowserOrNode.mockReturnValue({ isBrowser: true });
		});

		test('calls a change handler with session started', () => {
			expectHandlerToBeCalledWith(false, 'started');
		});

		test('calls a change handler with session ended', () => {
			expectHandlerToBeCalledWith(true, 'ended');
		});

		test('works with ms browser', () => {
			expectBrowserCompatibilityWith('msHidden', 'msvisibilitychange');
		});
		test('works with webkit browser', () => {
			expectBrowserCompatibilityWith('webkitHidden', 'webkitvisibilitychange');
		});
	});
});
