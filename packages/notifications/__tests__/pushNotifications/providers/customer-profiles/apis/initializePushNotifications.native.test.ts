// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';

import {
	notifyEventListeners,
	notifyEventListenersAndAwaitHandlers,
} from '../../../../../src/eventListeners';
import {
	getToken,
	initialize,
	isInitialized,
	setToken,
} from '../../../../../src/pushNotifications/utils';
import {
	rejectInflightDeviceRegistration,
	resolveInflightDeviceRegistration,
} from '../../../../../src/pushNotifications/providers/customer-profiles/utils';
import { registerDevice } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/registerDevice';
import { removeDevice } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/removeDevice';
import {
	completionHandlerId,
	pushModuleConstants,
	pushToken,
	simplePushMessage,
} from '../../../../testUtils/data';

jest.mock('@aws-amplify/core', () => ({
	ConsoleLogger: jest.fn(() => ({
		info: jest.fn(),
		error: jest.fn(),
	})),
	Hub: { listen: jest.fn() },
}));
jest.mock('@aws-amplify/react-native', () => ({
	getOperatingSystem: jest.fn(),
	loadAmplifyPushNotification: jest.fn(() => ({
		addMessageEventListener: mockAddMessageEventListener,
		addTokenEventListener: mockAddTokenEventListener,
		completeNotification: mockCompleteNotification,
		getConstants: mockGetConstants,
		registerHeadlessTask: mockRegisterHeadlessTask,
	})),
}));
jest.mock('../../../../../src/eventListeners');
jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/utils',
);
jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/apis/registerDevice',
);
jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/apis/removeDevice',
);
jest.mock('../../../../../src/pushNotifications/utils');

// module level mocks
const mockAddMessageEventListener = jest.fn();
const mockAddTokenEventListener = jest.fn();
const mockCompleteNotification = jest.fn();
const mockGetConstants = jest.fn();
const mockRegisterHeadlessTask = jest.fn();

describe('initializePushNotifications (customer-profiles, native)', () => {
	let initializePushNotifications: () => void;
	const { NativeEvent } = pushModuleConstants;
	// create mocks
	const mockEventListenerRemover = { remove: jest.fn() };
	// assert mocks
	const mockRegisterDevice = registerDevice as jest.Mock;
	const mockRemoveDevice = removeDevice as jest.Mock;
	const mockHubListen = Hub.listen as jest.Mock;
	const mockGetToken = getToken as jest.Mock;
	const mockInitialize = initialize as jest.Mock;
	const mockIsInitialized = isInitialized as jest.Mock;
	const mockRejectInflightDeviceRegistration =
		rejectInflightDeviceRegistration as jest.Mock;
	const mockResolveInflightDeviceRegistration =
		resolveInflightDeviceRegistration as jest.Mock;
	const mockSetToken = setToken as jest.Mock;
	const mockNotifyEventListeners = notifyEventListeners as jest.Mock;
	const mockNotifyEventListenersAndAwaitHandlers =
		notifyEventListenersAndAwaitHandlers as jest.Mock;
	// helpers
	const expectListenerForEvent = (event: string) => ({
		toBeAdded: () => {
			expect(mockAddMessageEventListener).toHaveBeenCalledWith(
				event,
				expect.any(Function),
			);
		},
		notToBeAdded: () => {
			expect(mockAddMessageEventListener).not.toHaveBeenCalledWith(
				event,
				expect.any(Function),
			);
		},
	});

	const listenForEvent = (event: string) => {
		mockAddMessageEventListener.mockImplementation((heardEvent, handler) => {
			if (heardEvent === event) {
				handler(simplePushMessage);
			}
		});
	};

	beforeAll(() => {
		({
			initializePushNotifications,
		} = require('../../../../../src/pushNotifications/providers/customer-profiles/apis/initializePushNotifications.native'));
		mockAddMessageEventListener.mockReturnValue(mockEventListenerRemover);
		mockRegisterDevice.mockResolvedValue(undefined);
		mockRemoveDevice.mockResolvedValue(undefined);
	});

	beforeEach(() => {
		mockGetConstants.mockReturnValue(pushModuleConstants);
		mockIsInitialized.mockReturnValue(false);
	});

	afterEach(() => {
		mockGetToken.mockReset();
		mockIsInitialized.mockReset();
		mockGetConstants.mockReset();
		mockRegisterHeadlessTask.mockReset();
		mockAddMessageEventListener.mockReset();
		mockAddTokenEventListener.mockReset();
		mockRegisterDevice.mockReset();
		mockRemoveDevice.mockReset();
		mockHubListen.mockReset();
		mockInitialize.mockClear();
		mockSetToken.mockClear();
		mockCompleteNotification.mockClear();
		mockEventListenerRemover.remove.mockClear();
		mockNotifyEventListeners.mockClear();
		mockNotifyEventListenersAndAwaitHandlers.mockClear();
		mockRejectInflightDeviceRegistration.mockClear();
		mockResolveInflightDeviceRegistration.mockClear();
		// restore default resolved values cleared by mockReset above
		mockRegisterDevice.mockResolvedValue(undefined);
		mockRemoveDevice.mockResolvedValue(undefined);
		mockAddMessageEventListener.mockReturnValue(mockEventListenerRemover);
	});

	it('only enables once', () => {
		mockIsInitialized.mockReturnValue(true);
		initializePushNotifications();
		expect(mockInitialize).not.toHaveBeenCalled();
	});

	describe('background notification', () => {
		it('registers a headless task if able', () => {
			initializePushNotifications();
			expect(mockRegisterHeadlessTask).toHaveBeenCalledWith(
				expect.any(Function),
			);
			expectListenerForEvent(
				NativeEvent.BACKGROUND_MESSAGE_RECEIVED,
			).notToBeAdded();
		});

		it('calls background notification handlers when headless task is run', () => {
			mockRegisterHeadlessTask.mockImplementation(task => {
				task(simplePushMessage);
			});
			initializePushNotifications();
			expect(mockNotifyEventListenersAndAwaitHandlers).toHaveBeenCalledWith(
				'backgroundMessageReceived',
				simplePushMessage,
			);
		});

		it('registers and calls background notification listener if unable to register headless task', () => {
			listenForEvent(NativeEvent.BACKGROUND_MESSAGE_RECEIVED);
			mockGetConstants.mockReturnValue({ NativeEvent });
			initializePushNotifications();
			expectListenerForEvent(
				NativeEvent.BACKGROUND_MESSAGE_RECEIVED,
			).toBeAdded();
			expect(mockRegisterHeadlessTask).not.toHaveBeenCalled();
			expect(mockNotifyEventListenersAndAwaitHandlers).toHaveBeenCalledWith(
				'backgroundMessageReceived',
				simplePushMessage,
			);
		});

		it('completes the notification if completionHandlerId is provided', done => {
			mockAddMessageEventListener.mockImplementation((heardEvent, handler) => {
				if (heardEvent === NativeEvent.BACKGROUND_MESSAGE_RECEIVED) {
					handler(simplePushMessage, completionHandlerId);
				}
			});
			mockCompleteNotification.mockImplementation(() => {
				expect(mockCompleteNotification).toHaveBeenCalled();
				done();
			});
			mockGetConstants.mockReturnValue({ NativeEvent });
			initializePushNotifications();
			expectListenerForEvent(
				NativeEvent.BACKGROUND_MESSAGE_RECEIVED,
			).toBeAdded();
			expect(mockRegisterHeadlessTask).not.toHaveBeenCalled();
			expect(mockNotifyEventListenersAndAwaitHandlers).toHaveBeenCalledWith(
				'backgroundMessageReceived',
				simplePushMessage,
			);
		});
	});

	describe('launch notification', () => {
		it('registers and calls launch notification listener if able', () => {
			listenForEvent(NativeEvent.LAUNCH_NOTIFICATION_OPENED);
			initializePushNotifications();

			expectListenerForEvent(
				NativeEvent.LAUNCH_NOTIFICATION_OPENED,
			).toBeAdded();
			expect(mockNotifyEventListeners).toHaveBeenCalledWith(
				'launchNotificationOpened',
				simplePushMessage,
			);
		});

		it('does not register launch notification listener if unable', () => {
			listenForEvent(NativeEvent.LAUNCH_NOTIFICATION_OPENED);
			mockGetConstants.mockReturnValue({
				NativeEvent: {
					...NativeEvent,
					LAUNCH_NOTIFICATION_OPENED: undefined,
				},
			});
			initializePushNotifications();

			expectListenerForEvent(
				NativeEvent.LAUNCH_NOTIFICATION_OPENED,
			).notToBeAdded();
			expect(mockNotifyEventListeners).not.toHaveBeenCalled();
		});
	});

	it('registers and calls foreground message listener', () => {
		listenForEvent(NativeEvent.FOREGROUND_MESSAGE_RECEIVED);
		initializePushNotifications();

		expectListenerForEvent(NativeEvent.FOREGROUND_MESSAGE_RECEIVED).toBeAdded();
		expect(mockNotifyEventListeners).toHaveBeenCalledWith(
			'foregroundMessageReceived',
			simplePushMessage,
		);
	});

	it('registers and calls notification opened listener', () => {
		listenForEvent(NativeEvent.NOTIFICATION_OPENED);
		initializePushNotifications();

		expectListenerForEvent(NativeEvent.NOTIFICATION_OPENED).toBeAdded();
		expect(mockNotifyEventListeners).toHaveBeenCalledWith(
			'notificationOpened',
			simplePushMessage,
		);
	});

	describe('token received', () => {
		it('registers the device with Customer Profiles and resolves the inflight registration', done => {
			expect.assertions(6);
			mockGetToken.mockReturnValue(undefined);
			mockAddTokenEventListener.mockImplementation(
				async (heardEvent, handler) => {
					if (heardEvent === NativeEvent.TOKEN_RECEIVED) {
						await handler(pushToken);
						expect(mockAddTokenEventListener).toHaveBeenCalledWith(
							NativeEvent.TOKEN_RECEIVED,
							expect.any(Function),
						);
						expect(mockSetToken).toHaveBeenCalledWith(pushToken);
						expect(mockNotifyEventListeners).toHaveBeenCalledWith(
							'tokenReceived',
							pushToken,
						);
						expect(mockRegisterDevice).toHaveBeenCalledWith({
							token: pushToken,
						});
						expect(mockResolveInflightDeviceRegistration).toHaveBeenCalled();
						expect(mockRejectInflightDeviceRegistration).not.toHaveBeenCalled();
						done();
					}
				},
			);
			initializePushNotifications();
		});

		it('should not invoke token received listener with the same token twice', () => {
			mockGetToken
				.mockReturnValueOnce(undefined)
				.mockReturnValueOnce(pushToken);
			mockAddTokenEventListener.mockImplementation((heardEvent, handler) => {
				if (heardEvent === NativeEvent.TOKEN_RECEIVED) {
					handler(pushToken);
					handler(pushToken);
				}
			});
			initializePushNotifications();

			expect(mockNotifyEventListeners).toHaveBeenCalledTimes(1);
		});

		it('token received should be invoked with different tokens', () => {
			mockGetToken
				.mockReturnValueOnce(undefined)
				.mockReturnValueOnce(pushToken);
			mockAddTokenEventListener.mockImplementation((heardEvent, handler) => {
				if (heardEvent === NativeEvent.TOKEN_RECEIVED) {
					handler(pushToken);
					handler('bar-foo');
				}
			});
			initializePushNotifications();

			expect(mockNotifyEventListeners).toHaveBeenCalledTimes(2);
		});

		it('throws if device registration fails', done => {
			expect.assertions(3);
			mockRegisterDevice.mockImplementation(() => {
				throw new Error();
			});
			mockAddTokenEventListener.mockImplementation(
				async (heardEvent, handler) => {
					if (heardEvent === NativeEvent.TOKEN_RECEIVED) {
						await expect(handler(pushToken)).rejects.toThrow();
						expect(
							mockResolveInflightDeviceRegistration,
						).not.toHaveBeenCalled();
						expect(mockRejectInflightDeviceRegistration).toHaveBeenCalled();
						done();
					}
				},
			);
			initializePushNotifications();
		});
	});

	describe('sign-out de-registration', () => {
		it('removes the device when an auth signedOut event is received', async () => {
			initializePushNotifications();

			expect(mockHubListen).toHaveBeenCalledWith('auth', expect.any(Function));
			const authHandler = mockHubListen.mock.calls.find(
				call => call[0] === 'auth',
			)![1];
			authHandler({ payload: { event: 'signedOut' } });
			await Promise.resolve();

			expect(mockRemoveDevice).toHaveBeenCalledTimes(1);
		});

		it('does not remove the device for non-signedOut auth events', () => {
			initializePushNotifications();

			const authHandler = mockHubListen.mock.calls.find(
				call => call[0] === 'auth',
			)![1];
			authHandler({ payload: { event: 'signedIn' } });

			expect(mockRemoveDevice).not.toHaveBeenCalled();
		});

		it('swallows errors from removeDevice on sign-out', async () => {
			mockRemoveDevice.mockRejectedValue(new Error('remove failed'));
			initializePushNotifications();

			const authHandler = mockHubListen.mock.calls.find(
				call => call[0] === 'auth',
			)![1];
			expect(() =>
				authHandler({ payload: { event: 'signedOut' } }),
			).not.toThrow();
			await Promise.resolve();
			expect(mockRemoveDevice).toHaveBeenCalled();
		});
	});
});
