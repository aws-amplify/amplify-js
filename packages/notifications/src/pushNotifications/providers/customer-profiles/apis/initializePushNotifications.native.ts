// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	ConsoleLogger,
	Hub,
	getGlobalContext,
	isAmplifyContext,
} from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';
import { loadAmplifyPushNotification } from '@aws-amplify/react-native';

import {
	notifyEventListeners,
	notifyEventListenersAndAwaitHandlers,
} from '../../../../eventListeners';
import { getToken, initialize, isInitialized, setToken } from '../../../utils';
import {
	rejectInflightDeviceRegistration,
	resolveInflightDeviceRegistration,
} from '../utils';

import { registerDevice } from './registerDevice';

const {
	addMessageEventListener,
	addTokenEventListener,
	completeNotification,
	getConstants,
	registerHeadlessTask,
} = loadAmplifyPushNotification();

const logger = new ConsoleLogger('Notifications.PushNotification');

const BACKGROUND_TASK_TIMEOUT = 25; // seconds

/**
 * Initialize and set up the push notification category. The category must be first initialized before all other
 * functionalities become available.
 *
 * @remarks
 * It is recommended that this be called as early in your app as possible at the root of your application to allow
 * background processing of notifications.
 * @example
 * ```ts
 * Amplify.configure(config);
 * initializePushNotifications();
 * ```
 */
export async function initializePushNotifications(): Promise<void>;
/**
 * @param ctx - The {@link AmplifyContext} to use for config and credentials.
 */
export async function initializePushNotifications(
	ctx: AmplifyContext,
): Promise<void>;
// The body is synchronous listener wiring; the function is `async` so the
// return type matches the web stub overloads (`Promise<void>`) — the unified
// not-supported stubs reject asynchronously for a consistent cross-platform
// contract. This deliberately surfaces the not-configured
// `resolveCtxArgs` throw as a rejection, consistent with the web stubs which
// reject with `PlatformNotSupportedError`.
export async function initializePushNotifications(
	...args: any[]
): Promise<void> {
	// Validate that config is available (rejects if not configured yet)
	resolveCtxArgs<[]>(args);

	// Reconfigure support: the global context is a frozen snapshot swapped on
	// each Amplify.configure() call. If the caller passed an explicit ctx we pin
	// it for the lifetime of the listeners; otherwise we resolve the CURRENT
	// global context at each event so listeners pick up reconfigured values.
	const explicitCtx = isAmplifyContext(args[0])
		? (args[0] as AmplifyContext)
		: undefined;
	const resolveCtx = (): AmplifyContext => explicitCtx ?? getGlobalContext();

	if (isInitialized()) {
		logger.info('Push notifications have already been enabled');

		return;
	}
	addNativeListeners(resolveCtx);
	addAuthListener(resolveCtx);
	initialize();
}

const addNativeListeners = (resolveCtx: () => AmplifyContext): void => {
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
			// avoid a race condition where two registrations are created with the same token on a fresh install
			if (getToken() === token) {
				return;
			}
			setToken(token);
			notifyEventListeners('tokenReceived', token);
			try {
				await registerReceivedDevice(resolveCtx(), token);
			} catch (err) {
				logger.error('Failed to register device for push notifications', err);
				throw err;
			}
		},
	);
};

const addAuthListener = (resolveCtx: () => AmplifyContext): void => {
	// Re-register the device at sign-in so it is re-homed from the guest
	// principal to the now-authenticated one. The push token is unchanged across
	// a sign-in, so the native token listener short-circuits and would never
	// re-register on its own. The backend register-device is an idempotent
	// last-writer-wins upsert keyed on `deviceId`, so this moves the existing
	// registration rather than creating a duplicate. Best-effort — failures are
	// logged.
	Hub.listen('auth', ({ payload }) => {
		if (payload.event === 'signedIn') {
			const token = getToken();
			if (!token) {
				// no token yet — the TOKEN_RECEIVED path performs first registration
				return;
			}
			registerDevice(resolveCtx(), { token }).catch(err => {
				logger.error(
					'Failed to re-register device for push notifications on sign-in',
					err,
				);
			});
		}
	});
};

const registerReceivedDevice = async (
	ctx: AmplifyContext,
	token: string,
): Promise<void> => {
	try {
		await registerDevice(ctx, { token });
		// always resolve inflight device registration promise here even though the promise is only awaited on by
		// consumers when device registration is still in flight
		resolveInflightDeviceRegistration();
	} catch (underlyingError) {
		rejectInflightDeviceRegistration(underlyingError);
		throw underlyingError;
	}
};
