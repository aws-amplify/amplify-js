// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';
import { PushNotificationAction } from '@aws-amplify/core/internals/utils';
import { updateEndpoint } from '@aws-amplify/core/internals/providers/pinpoint';
import { loadAmplifyPushNotification } from '@aws-amplify/react-native';

import {
	EventListenerRemover,
	addEventListener,
	notifyEventListeners,
	notifyEventListenersAndAwaitHandlers,
} from '../../../../eventListeners';
import {
	getPushNotificationUserAgentString,
	getToken,
	initialize,
	isInitialized,
	resolveCredentials,
	setToken,
} from '../../../utils';
import {
	createMessageEventRecorder,
	getChannelType,
	rejectInflightDeviceRegistration,
	resolveConfig,
	resolveInflightDeviceRegistration,
} from '../utils';

const {
	addMessageEventListener,
	addTokenEventListener,
	completeNotification,
	getConstants,
	registerHeadlessTask,
} = loadAmplifyPushNotification();

const logger = new ConsoleLogger('Notifications.PushNotification');

const BACKGROUND_TASK_TIMEOUT = 25; // seconds

export const initializePushNotifications = (): void => {
	if (isInitialized()) {
		logger.info('Push notifications have already been enabled');

		return;
	}
	addNativeListeners();
	addAnalyticsListeners();
	initialize();
};

const addNativeListeners = (): void => {
	let launchNotificationOpenedListener:
		| ReturnType<typeof addMessageEventListener>
		| undefined;
	const { NativeEvent, NativeHeadlessTaskKey } = getConstants();
	const {
		BACKGROUND_MESSAGE_RECEIVED,
		FOREGROUND_MESSAGE_RECEIVED,
		LAUNCH_NOTIFICATION_OPENED,
		NOTIFICATION_OPENED,
		TOKEN_RECEIVED,
	} = NativeEvent;
	// on platforms that can handle headless tasks, register one to broadcast background message received to
	// library listeners
	if (NativeHeadlessTaskKey) {
		registerHeadlessTask(async message => {
			// keep headless task running until handlers have completed their work
			await notifyEventListenersAndAwaitHandlers(
				'backgroundMessageReceived',
				message,
			);
		});
	} else if (BACKGROUND_MESSAGE_RECEIVED) {
		// on platforms that can't handle headless tasks, listen for native background message received event and
		// broadcast to library listeners
		addMessageEventListener(
			BACKGROUND_MESSAGE_RECEIVED,
			async (message, completionHandlerId) => {
				// keep background task running until handlers have completed their work
				try {
					await Promise.race([
						notifyEventListenersAndAwaitHandlers(
							'backgroundMessageReceived',
							message,
						),
						// background tasks will get suspended and all future tasks be deprioritized by the OS if they run for
						// more than 30 seconds so we reject with a error in a shorter amount of time to prevent this from
						// happening
						new Promise((_resolve, reject) => {
							setTimeout(() => {
								reject(
									new Error(
										`onNotificationReceivedInBackground handlers should complete their work within ${BACKGROUND_TASK_TIMEOUT} seconds, but they did not.`,
									),
								);
							}, BACKGROUND_TASK_TIMEOUT * 1000);
						}),
					]);
				} catch (err) {
					logger.error(err);
				} finally {
					// notify native module that handlers have completed their work (or timed out)
					if (completionHandlerId) {
						completeNotification(completionHandlerId);
					}
				}
			},
		);
	}

	addMessageEventListener(
		// listen for native foreground message received event and broadcast to library listeners
		FOREGROUND_MESSAGE_RECEIVED,
		message => {
			notifyEventListeners('foregroundMessageReceived', message);
		},
	);

	launchNotificationOpenedListener = LAUNCH_NOTIFICATION_OPENED
		? addMessageEventListener(
				// listen for native notification opened app (user tapped on notification, opening the app from quit -
				// not background - state) event. This is broadcasted to an internal listener only as it is not intended
				// for use otherwise as it produces inconsistent results when used within React Native app context
				LAUNCH_NOTIFICATION_OPENED,
				message => {
					notifyEventListeners('launchNotificationOpened', message);
					// once we are done with it we can remove the listener
					launchNotificationOpenedListener?.remove();
					launchNotificationOpenedListener = undefined;
				},
			)
		: undefined;

	addMessageEventListener(
		// listen for native notification opened (user tapped on notification, opening the app from background -
		// not quit - state) event and broadcast to library listeners
		NOTIFICATION_OPENED,
		message => {
			notifyEventListeners('notificationOpened', message);
			// if we are in this state, we no longer need the listener as the app was launched via some other means
			launchNotificationOpenedListener?.remove();
		},
	);

	addTokenEventListener(
		// listen for native new token event, automatically re-register device with provider using new token and
		// broadcast to library listeners
		TOKEN_RECEIVED,
		async token => {
			// avoid a race condition where two endpoints are created with the same token on a fresh install
			if (getToken() === token) {
				return;
			}
			setToken(token);
			notifyEventListeners('tokenReceived', token);
			try {
				await registerDevice(token);
			} catch (err) {
				logger.error('Failed to register device for push notifications', err);
				throw err;
			}
		},
	);
};

const addAnalyticsListeners = (): void => {
	let launchNotificationOpenedListenerRemover: EventListenerRemover | undefined;

	// wire up default Pinpoint message event handling
	addEventListener(
		'backgroundMessageReceived',
		createMessageEventRecorder('received_background'),
	);
	addEventListener(
		'foregroundMessageReceived',
		createMessageEventRecorder('received_foreground'),
	);
	launchNotificationOpenedListenerRemover = addEventListener(
		'launchNotificationOpened',
		createMessageEventRecorder(
			'opened_notification',
			// once we are done with it we can remove the listener
			() => {
				launchNotificationOpenedListenerRemover?.remove();
				launchNotificationOpenedListenerRemover = undefined;
			},
		),
	);
	addEventListener(
		'notificationOpened',
		createMessageEventRecorder(
			'opened_notification',
			// if we are in this state, we no longer need the listener as the app was launched via some other means
			() => {
				launchNotificationOpenedListenerRemover?.remove();
				launchNotificationOpenedListenerRemover = undefined;
			},
		),
	);
};

const registerDevice = async (address: string): Promise<void> => {
	const { credentials, identityId } = await resolveCredentials();
	const { appId, region } = resolveConfig();
	try {
		await updateEndpoint({
			address,
			appId,
			category: 'PushNotification',
			credentials,
			region,
			channelType: getChannelType(),
			identityId,
			userAgentValue: getPushNotificationUserAgentString(
				PushNotificationAction.InitializePushNotifications,
			),
		});
		// always resolve inflight device registration promise here even though the promise is only awaited on by
		// `identifyUser` when no endpoint is found in the cache
		resolveInflightDeviceRegistration();
	} catch (underlyingError) {
		rejectInflightDeviceRegistration(underlyingError);
		throw underlyingError;
	}
};
