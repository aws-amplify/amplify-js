// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AppRegistry, NativeEventEmitter } from 'react-native';
import { Logger } from '@aws-amplify/core/internals/utils';
import {
	AmplifyRTNPushNotification,
	PushNotificationNativeModule,
} from '@aws-amplify/rtn-push-notification';

import {
	addEventListener,
	EventListener,
	notifyEventListeners,
	notifyEventListenersAndAwaitHandlers,
} from '../common';
import { UserInfo } from '../types';
import NotEnabledError from './NotEnabledError';
import {
	OnTokenReceivedHandler,
	PushNotificationEvent,
	PushNotificationInterface,
	PushNotificationPermissions,
	PushNotificationPermissionStatus,
	PushNotificationProvider,
} from './types';
import {
	normalizeNativePermissionStatus,
	normalizeNativeMessage,
} from './utils';
import AWSPinpointProvider from './providers/AWSPinpointProvider';
import { Amplify } from '@aws-amplify/core';

const logger = new Logger('Notifications.PushNotification');
const RTN_MODULE = '@aws-amplify/rtn-push-notification';
const BACKGROUND_TASK_TIMEOUT = 25; // seconds

class PushNotification implements PushNotificationInterface {
	private isEnabled = false;
	private nativeEvent: Record<string, string>;
	private nativeEventEmitter: NativeEventEmitter;
	private nativeHeadlessTaskKey: string;
	private nativeModule: PushNotificationNativeModule;
	private provider: PushNotificationProvider;
	private token: string;

	constructor() {
		try {
			this.nativeModule = AmplifyRTNPushNotification;
			// If constructing this, Push is configured in the Amplify root config. If the native module is missing at this
			// point, throw an error to give a hint that the module is missing.
			if (!this.nativeModule) {
				throw new Error();
			}
			const { NativeEvent, NativeHeadlessTaskKey } =
				this.nativeModule.getConstants();
			this.nativeEvent = NativeEvent;
			this.nativeHeadlessTaskKey = NativeHeadlessTaskKey;
			this.nativeEventEmitter = new NativeEventEmitter(
				AmplifyRTNPushNotification
			);
			this.provider = new AWSPinpointProvider();
			// TODO(V6): Add config from singleton
			const amplifyConfig = Amplify.getConfig();
			this.provider.configure(amplifyConfig);
		} catch (err) {
			err.message = `Unable to find ${RTN_MODULE}. ${err.message}`;
			throw err;
		}
	}

	enable = (): void => {
		console.log('Enabling push');

		if (this.isEnabled) {
			logger.info('Notification listeners have already been enabled');
			return;
		}
		const {
			BACKGROUND_MESSAGE_RECEIVED,
			FOREGROUND_MESSAGE_RECEIVED,
			LAUNCH_NOTIFICATION_OPENED,
			NOTIFICATION_OPENED,
			TOKEN_RECEIVED,
		} = this.nativeEvent;
		if (this.nativeHeadlessTaskKey) {
			// on platforms that can handle headless tasks, register one to broadcast background message received to
			// library listeners
			AppRegistry.registerHeadlessTask(
				this.nativeHeadlessTaskKey,
				() => async message => {
					// keep headless task running until handlers have completed their work
					await notifyEventListenersAndAwaitHandlers(
						PushNotificationEvent.BACKGROUND_MESSAGE_RECEIVED,
						normalizeNativeMessage(message)
					);
				}
			);
		} else if (BACKGROUND_MESSAGE_RECEIVED) {
			// on platforms that can't handle headless tasks, listen for native background message received event and
			// broadcast to library listeners
			this.nativeEventEmitter.addListener(
				BACKGROUND_MESSAGE_RECEIVED,
				async message => {
					// keep background task running until handlers have completed their work
					try {
						await Promise.race([
							notifyEventListenersAndAwaitHandlers(
								PushNotificationEvent.BACKGROUND_MESSAGE_RECEIVED,
								normalizeNativeMessage(message)
							),
							// background tasks will get suspended and all future tasks be deprioritized by the OS if they run for
							// more than 30 seconds so we reject with a error in a shorter amount of time to prevent this from
							// happening
							new Promise((_, reject) => {
								setTimeout(
									() =>
										reject(
											`onNotificationReceivedInBackground handlers should complete their work within ${BACKGROUND_TASK_TIMEOUT} seconds, but they did not.`
										),
									BACKGROUND_TASK_TIMEOUT * 1000
								);
							}),
						]);
					} catch (err) {
						// logger.error(err);
					} finally {
						// notify native module that handlers have completed their work (or timed out)
						this.nativeModule.completeNotification?.(
							message.completionHandlerId
						);
					}
				}
			);
		}

		this.nativeEventEmitter.addListener(
			// listen for native foreground message received event and broadcast to library listeners
			FOREGROUND_MESSAGE_RECEIVED,
			message => {
				notifyEventListeners(
					PushNotificationEvent.FOREGROUND_MESSAGE_RECEIVED,
					normalizeNativeMessage(message)
				);
			}
		);

		const launchNotificationOpenedListener = LAUNCH_NOTIFICATION_OPENED
			? this.nativeEventEmitter.addListener(
					// listen for native notification opened app (user tapped on notification, opening the app from quit -
					// not background - state) event. This is broadcasted to an internal listener only as it is not intended
					// for use otherwise as it produces inconsistent results when used within React Native app context
					LAUNCH_NOTIFICATION_OPENED,
					message => {
						notifyEventListeners(
							PushNotificationEvent.LAUNCH_NOTIFICATION_OPENED,
							normalizeNativeMessage(message)
						);
						// once we are done with it we can remove the listener
						launchNotificationOpenedListener?.remove();
					}
			  )
			: null;

		this.nativeEventEmitter.addListener(
			// listen for native notification opened (user tapped on notification, opening the app from background -
			// not quit - state) event and broadcast to library listeners
			NOTIFICATION_OPENED,
			message => {
				notifyEventListeners(
					PushNotificationEvent.NOTIFICATION_OPENED,
					normalizeNativeMessage(message)
				);
				// if we are in this state, we no longer need the listener as the app was launched via some other means
				launchNotificationOpenedListener?.remove();
			}
		);

		this.nativeEventEmitter.addListener(
			// listen for native new token event, automatically re-register device with provider using new token and
			// broadcast to library listeners
			TOKEN_RECEIVED,
			({ token }) => {
				console.log('Token: ', token);
				// avoid a race condition where two endpoints are created with the same token on a fresh install
				if (this.token === token) {
					return;
				}
				this.token = token;
				this.registerDevice();
				notifyEventListeners(PushNotificationEvent.TOKEN_RECEIVED, token);
			}
		);
		this.isEnabled = true;
		console.log('Enabled push');
	};

	identifyUser = (userId: string, userInfo: UserInfo): Promise<void> => {
		this.assertIsEnabled();
		return this.provider.identifyUser(userId, userInfo);
	};

	getBadgeCount = async (): Promise<number | null> => {
		this.assertIsEnabled();
		return this.nativeModule.getBadgeCount?.();
	};

	setBadgeCount = (count: number): void => {
		this.assertIsEnabled();
		return this.nativeModule.setBadgeCount?.(count);
	};

	getPermissionStatus = async (): Promise<PushNotificationPermissionStatus> => {
		this.assertIsEnabled();
		return normalizeNativePermissionStatus(
			await this.nativeModule.getPermissionStatus?.()
		);
	};

	requestPermissions = async (
		permissions: PushNotificationPermissions = {
			alert: true,
			badge: true,
			sound: true,
		}
	): Promise<boolean> => {
		this.assertIsEnabled();
		return this.nativeModule.requestPermissions?.(permissions);
	};

	onTokenReceived = (
		handler: OnTokenReceivedHandler
	): EventListener<OnTokenReceivedHandler> => {
		this.assertIsEnabled();
		return addEventListener(PushNotificationEvent.TOKEN_RECEIVED, handler);
	};

	private registerDevice = async (): Promise<void> => {
		return this.provider.registerDevice(this.token);
	};

	private assertIsEnabled = (): void => {
		if (!this.isEnabled) {
			throw new NotEnabledError();
		}
	};
}

export const pushNotification = new PushNotification();
