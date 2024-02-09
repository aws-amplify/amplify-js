// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateEndpoint } from '@aws-amplify/core/internals/providers/pinpoint';
import {
	notifyEventListeners,
	notifyEventListenersAndAwaitHandlers,
} from '../../../../../src/eventListeners';
import {
	getToken,
	initialize,
	isInitialized,
	resolveCredentials,
	setToken,
} from '../../../../../src/pushNotifications/utils';
import { resolveConfig } from '../../../../../src/pushNotifications//providers/pinpoint/utils';
import {
	completionHandlerId,
	credentials,
	pinpointConfig,
	pushModuleConstants,
	pushToken,
	simplePushMessage,
} from '../../../../testUtils/data';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/providers/pinpoint');
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
jest.mock('../../../../../src/pushNotifications/providers/pinpoint/utils');
jest.mock('../../../../../src/pushNotifications/utils');

// module level mocks
const mockAddMessageEventListener = jest.fn();
const mockAddTokenEventListener = jest.fn();
const mockCompleteNotification = jest.fn();
const mockGetConstants = jest.fn();
const mockRegisterHeadlessTask = jest.fn();

describe('initializePushNotifications (native)', () => {
	let initializePushNotifications;
	const { NativeEvent } = pushModuleConstants;
	// create mocks
	const mockEventListenerRemover = { remove: jest.fn() };
	// assert mocks
	const mockUpdateEndpoint = updateEndpoint as jest.Mock;
	const mockGetToken = getToken as jest.Mock;
	const mockInitialize = initialize as jest.Mock;
	const mockIsInitialized = isInitialized as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockSetToken = setToken as jest.Mock;
	const mockNotifyEventListeners = notifyEventListeners as jest.Mock;
	const mockNotifyEventListenersAndAwaitHandlers =
		notifyEventListenersAndAwaitHandlers as jest.Mock;
	// helpers
	const expectListenerForEvent = (event: string) => ({
		toBeAdded: () => {
			expect(mockAddMessageEventListener).toHaveBeenCalledWith(
				event,
				expect.any(Function)
			);
		},
		notToBeAdded: () => {
			expect(mockAddMessageEventListener).not.toHaveBeenCalledWith(
				event,
				expect.any(Function)
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
		} = require('../../../../../src/pushNotifications/providers/pinpoint/apis/initializePushNotifications.native'));
		mockAddMessageEventListener.mockReturnValue(mockEventListenerRemover);
		mockResolveCredentials.mockResolvedValue(credentials);
		mockResolveConfig.mockReturnValue(pinpointConfig);
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
		mockUpdateEndpoint.mockReset();
		mockInitialize.mockClear();
		mockSetToken.mockClear();
		mockCompleteNotification.mockClear();
		mockEventListenerRemover.remove.mockClear();
		mockNotifyEventListeners.mockClear();
		mockNotifyEventListenersAndAwaitHandlers.mockClear();
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
				expect.any(Function)
			);
			expectListenerForEvent(
				NativeEvent.BACKGROUND_MESSAGE_RECEIVED
			).notToBeAdded();
		});

		it('calls background notification handlers when headless task is run', () => {
			mockRegisterHeadlessTask.mockImplementation(task => {
				task(simplePushMessage);
			});
			initializePushNotifications();
			expect(mockNotifyEventListenersAndAwaitHandlers).toHaveBeenCalledWith(
				'backgroundMessageReceived',
				simplePushMessage
			);
		});

		it('registers and calls background notification listener if unable to register headless task', () => {
			listenForEvent(NativeEvent.BACKGROUND_MESSAGE_RECEIVED);
			mockGetConstants.mockReturnValue({ NativeEvent });
			initializePushNotifications();
			expectListenerForEvent(
				NativeEvent.BACKGROUND_MESSAGE_RECEIVED
			).toBeAdded();
			expect(mockRegisterHeadlessTask).not.toHaveBeenCalled();
			expect(mockNotifyEventListenersAndAwaitHandlers).toHaveBeenCalledWith(
				'backgroundMessageReceived',
				simplePushMessage
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
				NativeEvent.BACKGROUND_MESSAGE_RECEIVED
			).toBeAdded();
			expect(mockRegisterHeadlessTask).not.toHaveBeenCalled();
			expect(mockNotifyEventListenersAndAwaitHandlers).toHaveBeenCalledWith(
				'backgroundMessageReceived',
				simplePushMessage
			);
		});
	});

	describe('launch notification', () => {
		it('registers and calls launch notification listener if able', () => {
			listenForEvent(NativeEvent.LAUNCH_NOTIFICATION_OPENED);
			initializePushNotifications();

			expectListenerForEvent(
				NativeEvent.LAUNCH_NOTIFICATION_OPENED
			).toBeAdded();
			expect(mockNotifyEventListeners).toHaveBeenCalledWith(
				'launchNotificationOpened',
				simplePushMessage
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
				NativeEvent.LAUNCH_NOTIFICATION_OPENED
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
			simplePushMessage
		);
	});

	it('registers and calls notification opened listener', () => {
		listenForEvent(NativeEvent.NOTIFICATION_OPENED);
		initializePushNotifications();

		expectListenerForEvent(NativeEvent.NOTIFICATION_OPENED).toBeAdded();
		expect(mockNotifyEventListeners).toHaveBeenCalledWith(
			'notificationOpened',
			simplePushMessage
		);
	});

	describe('token received', () => {
		it('registers and calls token received listener', done => {
			mockGetToken.mockReturnValue(undefined);
			mockAddTokenEventListener.mockImplementation(
				async (heardEvent, handler) => {
					if (heardEvent === NativeEvent.TOKEN_RECEIVED) {
						await handler(pushToken);
					}
				}
			);
			mockUpdateEndpoint.mockImplementation(() => {
				expect(mockUpdateEndpoint).toHaveBeenCalled();
				done();
			});
			initializePushNotifications();

			expect(mockAddTokenEventListener).toHaveBeenCalledWith(
				NativeEvent.TOKEN_RECEIVED,
				expect.any(Function)
			);
			expect(mockSetToken).toHaveBeenCalledWith(pushToken);
			expect(mockNotifyEventListeners).toHaveBeenCalledWith(
				'tokenReceived',
				pushToken
			);
		});

		it('should not be invoke token received listener with the same token twice', () => {
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
			mockUpdateEndpoint.mockImplementation(() => {
				throw new Error();
			});
			mockAddTokenEventListener.mockImplementation(
				async (heardEvent, handler) => {
					if (heardEvent === NativeEvent.TOKEN_RECEIVED) {
						await expect(handler(pushToken)).rejects.toThrow();
						done();
					}
				}
			);
			initializePushNotifications();
		});
	});
});
