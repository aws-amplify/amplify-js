// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AppRegistry } from 'react-native';
import { ConsoleLogger } from '@aws-amplify/core';
import { AmplifyRTNPushNotification } from '@aws-amplify/rtn-push-notification';

import {
	pushModuleConstants,
	pushToken,
	simplePushMessage,
	subcategoryConfig,
	userId,
	userInfo,
} from '../../__mocks__/data';
import { mockPushNotificationProvider } from '../../__mocks__/mocks';
import {
	addEventListener,
	notifyEventListeners,
	notifyEventListenersAndAwaitHandlers,
} from '../../src/common/eventListeners';
import PushNotification from '../../src/pushNotifications/pushNotifications.native';
import { PushNotificationEvent } from '../../src/pushNotifications/types';
import { normalizeNativeMessage } from '../../src/pushNotifications/utils';

jest.mock('react-native', () => ({
	AppRegistry: {
		registerHeadlessTask: jest.fn(),
	},
	NativeEventEmitter: jest.fn(() => ({
		addListener: mockAddListener,
	})),
}));
jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/rtn-push-notification', () => ({
	AmplifyRTNPushNotification: {
		getConstants: jest.fn(() => pushModuleConstants),
		getBadgeCount: jest.fn(),
		getLaunchNotification: jest.fn(),
		getPermissionStatus: jest.fn(),
		requestPermissions: jest.fn(),
		setBadgeCount: jest.fn(),
	},
}));
jest.mock('../../src/common/eventListeners');
jest.mock('../../src/pushNotifications/Providers', () => ({
	AWSPinpointProvider: () => ({
		getCategory: jest.fn,
		getSubCategory: jest.fn,
		getProviderName: jest.fn,
		configure: jest.fn,
	}),
}));
jest.mock('../../src/pushNotifications/utils');

const PROVIDER_NAME = 'PushNotificationProvider';
const SUBCATEGORY_NAME = 'PushNotification';
const { NativeEvent, NativeHeadlessTaskKey } = pushModuleConstants;

const loggerDebugSpy = jest.spyOn(ConsoleLogger.prototype, 'debug');
const loggerErrorSpy = jest.spyOn(ConsoleLogger.prototype, 'error');
const loggerInfoSpy = jest.spyOn(ConsoleLogger.prototype, 'info');
const mockRegisterHeadlessTask = AppRegistry.registerHeadlessTask as jest.Mock;
const mockAddListener = jest.fn();
const mockGetConstants = AmplifyRTNPushNotification.getConstants as jest.Mock;

const notEnabledError = /Function is unavailable/;

describe('PushNotification', () => {
	let pushNotification: PushNotification;

	const expectListenerForEvent = (event: string) => ({
		toBeAdded: () => {
			expect(mockAddListener).toBeCalledWith(event, expect.any(Function));
		},
		notToBeAdded: () => {
			expect(mockAddListener).not.toBeCalledWith(event, expect.any(Function));
		},
	});

	const listenForEvent = (event: string) => {
		mockAddListener.mockImplementation((heardEvent, handler) => {
			if (heardEvent === event) {
				handler(simplePushMessage);
			}
		});
	};

	beforeEach(() => {
		jest.clearAllMocks();
		pushNotification = new PushNotification();
		pushNotification.addPluggable(mockPushNotificationProvider);
		mockPushNotificationProvider.getCategory.mockReturnValue('Notifications');
		mockPushNotificationProvider.getProviderName.mockReturnValue(PROVIDER_NAME);
		mockPushNotificationProvider.getSubCategory.mockReturnValue(
			SUBCATEGORY_NAME
		);
		(normalizeNativeMessage as jest.Mock).mockImplementation(str => str);
	});

	test('returns the correct module name', () => {
		expect(pushNotification.getModuleName()).toBe(SUBCATEGORY_NAME);
	});

	test('returns the correct module name', () => {
		expect(pushNotification.getModuleName()).toBe(SUBCATEGORY_NAME);
	});

	describe('Pluggables', () => {
		test('can be added', () => {
			expect(mockPushNotificationProvider.configure).toBeCalled();
		});

		test('can be gotten', () => {
			expect(pushNotification.getPluggable(PROVIDER_NAME)).not.toBeNull();
		});

		test('can be removed', () => {
			pushNotification.removePluggable(PROVIDER_NAME);

			expect(pushNotification.getPluggable(PROVIDER_NAME)).toBeNull();
		});

		test('cannot be removed if not found', () => {
			pushNotification.removePluggable('InvalidProvider');

			expect(loggerDebugSpy).toBeCalledWith(
				expect.stringContaining('InvalidProvider')
			);
		});

		test('cannot be added if duplicate', () => {
			expect(() => {
				pushNotification.addPluggable(mockPushNotificationProvider);
			}).toThrow(/has already been added/);
		});

		test('cannot be added if invalid', () => {
			pushNotification.removePluggable(PROVIDER_NAME);
			mockPushNotificationProvider.configure.mockClear();
			mockPushNotificationProvider.getSubCategory.mockReturnValue(
				'InvalidSubCategory'
			);

			expect(mockPushNotificationProvider.configure).not.toBeCalled();
		});
	});

	describe('configure', () => {
		test('can be called without input', () => {
			const config = pushNotification.configure();

			expect(config).toMatchObject({});
		});

		test('should be called with config', () => {
			const config = pushNotification.configure(subcategoryConfig);

			expect(config).toStrictEqual(subcategoryConfig);
		});
	});

	describe('enable', () => {
		describe('background notification', () => {
			test('registers a headless task if able', () => {
				pushNotification.enable();

				expect(mockRegisterHeadlessTask).toBeCalledWith(
					NativeHeadlessTaskKey,
					expect.any(Function)
				);
				expectListenerForEvent(
					NativeEvent.BACKGROUND_MESSAGE_RECEIVED
				).notToBeAdded();
			});

			test('calls background notification handlers when headless task is run', () => {
				mockRegisterHeadlessTask.mockImplementationOnce((_, task) => {
					task()(simplePushMessage);
				});
				pushNotification.enable();

				expect(notifyEventListenersAndAwaitHandlers).toBeCalledWith(
					PushNotificationEvent.BACKGROUND_MESSAGE_RECEIVED,
					simplePushMessage
				);
			});

			test('registers and calls background notification listener if unable to register headless task', () => {
				listenForEvent(NativeEvent.BACKGROUND_MESSAGE_RECEIVED);
				mockGetConstants.mockReturnValue({ NativeEvent });
				pushNotification = new PushNotification();
				pushNotification.enable();

				expectListenerForEvent(
					NativeEvent.BACKGROUND_MESSAGE_RECEIVED
				).toBeAdded();
				expect(mockRegisterHeadlessTask).not.toBeCalled();
				expect(notifyEventListenersAndAwaitHandlers).toBeCalledWith(
					PushNotificationEvent.BACKGROUND_MESSAGE_RECEIVED,
					simplePushMessage
				);
			});
		});

		describe('launch notification', () => {
			test('registers and calls launch notification listener if able', () => {
				listenForEvent(NativeEvent.LAUNCH_NOTIFICATION_OPENED);
				pushNotification.enable();

				expectListenerForEvent(
					NativeEvent.LAUNCH_NOTIFICATION_OPENED
				).toBeAdded();
				expect(notifyEventListeners).toBeCalledWith(
					PushNotificationEvent.LAUNCH_NOTIFICATION_OPENED,
					simplePushMessage
				);
			});

			test('does not register launch notification listener if unable', () => {
				listenForEvent(NativeEvent.LAUNCH_NOTIFICATION_OPENED);
				mockGetConstants.mockReturnValue({
					NativeEvent: {
						...NativeEvent,
						LAUNCH_NOTIFICATION_OPENED: undefined,
					},
				});
				pushNotification = new PushNotification();
				pushNotification.enable();

				expectListenerForEvent(
					NativeEvent.LAUNCH_NOTIFICATION_OPENED
				).notToBeAdded();
				expect(notifyEventListeners).not.toBeCalled();
				expect(normalizeNativeMessage).not.toBeCalled();
			});
		});

		test('registers and calls foreground message listener', () => {
			listenForEvent(NativeEvent.FOREGROUND_MESSAGE_RECEIVED);
			pushNotification.enable();

			expectListenerForEvent(
				NativeEvent.FOREGROUND_MESSAGE_RECEIVED
			).toBeAdded();
			expect(notifyEventListeners).toBeCalledWith(
				PushNotificationEvent.FOREGROUND_MESSAGE_RECEIVED,
				simplePushMessage
			);
		});

		test('registers and calls notification opened listener', () => {
			listenForEvent(NativeEvent.NOTIFICATION_OPENED);
			pushNotification.enable();

			expectListenerForEvent(NativeEvent.NOTIFICATION_OPENED).toBeAdded();
			expect(notifyEventListeners).toBeCalledWith(
				PushNotificationEvent.NOTIFICATION_OPENED,
				simplePushMessage
			);
		});

		test('registers and calls token received listener', () => {
			mockAddListener.mockImplementation((heardEvent, handler) => {
				if (heardEvent === NativeEvent.TOKEN_RECEIVED) {
					handler({ token: pushToken });
				}
			});
			pushNotification.enable();

			expectListenerForEvent(NativeEvent.TOKEN_RECEIVED).toBeAdded();
			expect(notifyEventListeners).toBeCalledWith(
				PushNotificationEvent.TOKEN_RECEIVED,
				pushToken
			);
		});

		test('token received should not be invoked with the same token twice', () => {
			mockAddListener.mockImplementation((heardEvent, handler) => {
				if (heardEvent === NativeEvent.TOKEN_RECEIVED) {
					handler({ token: pushToken });
					handler({ token: pushToken });
				}
			});
			pushNotification.enable();

			expect(notifyEventListeners).toBeCalledTimes(1);
		});

		test('token received should be invoked with different tokens', () => {
			mockAddListener.mockImplementation((heardEvent, handler) => {
				if (heardEvent === NativeEvent.TOKEN_RECEIVED) {
					handler({ token: pushToken });
					handler({ token: 'bar-foo' });
				}
			});
			pushNotification.enable();

			expect(notifyEventListeners).toBeCalledTimes(2);
		});

		test('handles device registration failure', () => {
			mockPushNotificationProvider.registerDevice.mockImplementationOnce(() => {
				throw new Error();
			});
			mockAddListener.mockImplementation((heardEvent, handler) => {
				if (heardEvent === NativeEvent.TOKEN_RECEIVED) {
					handler({ token: pushToken });
				}
			});
			pushNotification.enable();

			expect(loggerErrorSpy).toBeCalledWith(
				expect.stringContaining('Failed to register device'),
				expect.any(Error)
			);
		});

		test('only enables once', () => {
			pushNotification.enable();
			expect(loggerInfoSpy).not.toBeCalled();
			pushNotification.enable();
			expect(loggerInfoSpy).toBeCalledWith(
				expect.stringContaining('already been enabled')
			);
		});
	});

	describe('identifyUser', () => {
		test('throws error if Push is not enabled', async () => {
			expect(() => pushNotification.identifyUser(userId, userInfo)).toThrow(
				notEnabledError
			);
			expect(mockPushNotificationProvider.identifyUser).not.toBeCalled();
		});

		describe('enabled', () => {
			beforeEach(() => {
				pushNotification.enable();
			});
			test('identifies users with pluggables', async () => {
				await pushNotification.identifyUser(userId, userInfo);

				expect(mockPushNotificationProvider.identifyUser).toBeCalledWith(
					userId,
					userInfo
				);
			});

			test('rejects if there is a failure identifying user', async () => {
				mockPushNotificationProvider.identifyUser.mockImplementation(() => {
					throw new Error();
				});

				await expect(
					pushNotification.identifyUser(userId, userInfo)
				).rejects.toStrictEqual(expect.any(Error));
			});
		});
	});

	describe('getLaunchNotification', () => {
		test('throws error if Push is not enabled', async () => {
			await expect(pushNotification.getLaunchNotification()).rejects.toThrow(
				notEnabledError
			);
			expect(AmplifyRTNPushNotification.getLaunchNotification).not.toBeCalled();
		});

		test('returns a launch notification', async () => {
			pushNotification.enable();
			await pushNotification.getLaunchNotification();
			expect(AmplifyRTNPushNotification.getLaunchNotification).toBeCalled();
		});
	});

	describe('getBadgeCount', () => {
		test('throws error if Push is not enabled', async () => {
			await expect(pushNotification.getBadgeCount()).rejects.toThrow(
				notEnabledError
			);
			expect(AmplifyRTNPushNotification.getBadgeCount).not.toBeCalled();
		});

		test('returns badge count', async () => {
			pushNotification.enable();
			await pushNotification.getBadgeCount();
			expect(AmplifyRTNPushNotification.getBadgeCount).toBeCalled();
		});
	});

	describe('setBadgeCount', () => {
		const count = 12;
		test('throws error if Push is not enabled', () => {
			expect(() => pushNotification.setBadgeCount(count)).toThrow(
				notEnabledError
			);
			expect(AmplifyRTNPushNotification.setBadgeCount).not.toBeCalled();
		});

		test('sets badge count', async () => {
			pushNotification.enable();
			await pushNotification.setBadgeCount(count);
			expect(AmplifyRTNPushNotification.setBadgeCount).toBeCalledWith(count);
		});
	});

	describe('getPermissionStatus', () => {
		test('throws error if Push is not enabled', async () => {
			await expect(pushNotification.getPermissionStatus()).rejects.toThrow(
				notEnabledError
			);
			expect(AmplifyRTNPushNotification.getPermissionStatus).not.toBeCalled();
		});

		test('returns permission status', async () => {
			pushNotification.enable();
			await pushNotification.getPermissionStatus();
			expect(AmplifyRTNPushNotification.getPermissionStatus).toBeCalled();
		});
	});

	describe('requestPermissions', () => {
		test('throws error if Push is not enabled', async () => {
			await expect(pushNotification.requestPermissions()).rejects.toThrow(
				notEnabledError
			);
			expect(AmplifyRTNPushNotification.requestPermissions).not.toBeCalled();
		});

		test('requests permissions', async () => {
			const permissions = { sound: false };
			pushNotification.enable();
			await pushNotification.requestPermissions(permissions);
			expect(AmplifyRTNPushNotification.requestPermissions).toBeCalledWith(
				permissions
			);
		});
	});

	describe('Notification listeners', () => {
		test('throw errors if Push is not enabled', () => {
			const handler = jest.fn();
			expect(() =>
				pushNotification.onNotificationReceivedInBackground(handler)
			).toThrow(notEnabledError);
			expect(() =>
				pushNotification.onNotificationReceivedInForeground(handler)
			).toThrow(notEnabledError);
			expect(() => pushNotification.onNotificationOpened(handler)).toThrow(
				notEnabledError
			);
			expect(() => pushNotification.onTokenReceived(handler)).toThrow(
				notEnabledError
			);
		});

		test('can add handlers', () => {
			const handler = jest.fn();
			pushNotification.enable();
			pushNotification.onNotificationReceivedInBackground(handler);
			pushNotification.onNotificationReceivedInForeground(handler);
			pushNotification.onNotificationOpened(handler);
			pushNotification.onTokenReceived(handler);
			expect(addEventListener).toBeCalledWith(
				PushNotificationEvent.BACKGROUND_MESSAGE_RECEIVED,
				handler
			);
			expect(addEventListener).toBeCalledWith(
				PushNotificationEvent.FOREGROUND_MESSAGE_RECEIVED,
				handler
			);
			expect(addEventListener).toBeCalledWith(
				PushNotificationEvent.NOTIFICATION_OPENED,
				handler
			);
			expect(addEventListener).toBeCalledWith(
				PushNotificationEvent.TOKEN_RECEIVED,
				handler
			);
		});
	});
});
