// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AppRegistry, NativeEventEmitter } from 'react-native';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
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
import { AWSPinpointProvider } from './Providers';
import {
	NotificationsSubCategory,
	OnPushNotificationMessageHandler,
	OnTokenReceivedHandler,
	PushNotificationConfig,
	PushNotificationEvent,
	PushNotificationInterface,
	PushNotificationMessage,
	PushNotificationPermissions,
	PushNotificationPermissionStatus,
	PushNotificationProvider,
} from './types';
import {
	normalizeNativePermissionStatus,
	normalizeNativeMessage,
} from './utils';

const logger = new Logger('Notifications.PushNotification');
const RTN_MODULE = '@aws-amplify/rtn-push-notification';
const BACKGROUND_TASK_TIMEOUT = 25; // seconds

export default class PushNotification implements PushNotificationInterface {
	private isEnabled = false;
	private config: Record<string, any> = {};
	private nativeEvent: Record<string, string>;
	private nativeEventEmitter: NativeEventEmitter;
	private nativeHeadlessTaskKey: string;
	private nativeModule: PushNotificationNativeModule;
	private pluggables: PushNotificationProvider[] = [];
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
		} catch (err) {
			err.message = `Unable to find ${RTN_MODULE}. ${err.message}`;
			throw err;
		}
	}

	/**
	 * Configure PushNotification
	 * @param {Object} config - PushNotification configuration object
	 */
	configure = (config: PushNotificationConfig = {}): PushNotificationConfig => {
		this.config = { ...this.config, ...config };

		logger.debug('configure PushNotification', this.config);

		this.pluggables.forEach(pluggable => {
			pluggable.configure(this.config[pluggable.getProviderName()]);
		});

		if (this.pluggables.length === 0) {
			this.addPluggable(new AWSPinpointProvider());
		}

		return this.config;
	};

	/**
	 * Get the name of this module
	 * @returns {string} name of this module
	 */
	getModuleName(): NotificationsSubCategory {
		return 'PushNotification';
	}

	/**
	 * Get a plugin from added plugins
	 * @param {string} providerName - the name of the plugin to get
	 */
	getPluggable = (providerName: string): PushNotificationProvider => {
		const pluggable =
			this.pluggables.find(
				pluggable => pluggable.getProviderName() === providerName
			) ?? null;

		if (!pluggable) {
			logger.debug(`No plugin found with name ${providerName}`);
		}

		return pluggable;
	};

	/**
	 * Add plugin into PushNotification
	 * @param {PushNotificationProvider} pluggable - an instance of the plugin
	 */
	addPluggable = (pluggable: PushNotificationProvider): void => {
		if (
			pluggable &&
			pluggable.getCategory() === 'Notifications' &&
			pluggable.getSubCategory() === 'PushNotification'
		) {
			if (this.getPluggable(pluggable.getProviderName())) {
				throw new Error(
					`Pluggable ${pluggable.getProviderName()} has already been added.`
				);
			}
			this.pluggables.push(pluggable);
			pluggable.configure(this.config[pluggable.getProviderName()]);
		}
	};

	/**
	 * Remove a plugin from added plugins
	 * @param {string} providerName - the name of the plugin to remove
	 */
	removePluggable = (providerName: string): void => {
		const index = this.pluggables.findIndex(
			pluggable => pluggable.getProviderName() === providerName
		);
		if (index === -1) {
			logger.debug(`No plugin found with name ${providerName}`);
		} else {
			this.pluggables.splice(index, 1);
		}
	};

	enable = (): void => {
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
						logger.error(err);
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
	};

	identifyUser = (userId: string, userInfo: UserInfo): Promise<void[]> => {
		this.assertIsEnabled();
		return Promise.all<void>(
			this.pluggables.map(async pluggable => {
				try {
					await pluggable.identifyUser(userId, userInfo);
				} catch (err) {
					logger.error('Failed to identify user', err);
					throw err;
				}
			})
		);
	};

	getLaunchNotification = async (): Promise<PushNotificationMessage | null> => {
		this.assertIsEnabled();
		return normalizeNativeMessage(
			await this.nativeModule.getLaunchNotification?.()
		);
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

	/**
	 * Background notifications on will start the app (as a headless JS instance running on a background service on
	 * Android) in the background. Handlers registered via `onNotificationReceivedInBackground` should return Promises if
	 * it needs to be asynchronous (e.g. to perform some network requests). The app should run in the background as long
	 * as there are handlers still running (however, if they run for more than 30 seconds on iOS, subsequent tasks could
	 * get deprioritized!). If it is necessary for a handler to execute while the app is in quit state, it should be
	 * registered in the application entry point (e.g. index.js) since the application will not fully mount in that case.
	 *
	 * @param handler a function to be run when a BACKGROUND_MESSAGE_RECEIVED event is received
	 * @returns an event listener which should be removed when no longer needed
	 */
	onNotificationReceivedInBackground = (
		handler: OnPushNotificationMessageHandler
	): EventListener<OnPushNotificationMessageHandler> => {
		this.assertIsEnabled();
		return addEventListener(
			PushNotificationEvent.BACKGROUND_MESSAGE_RECEIVED,
			handler
		);
	};

	onNotificationReceivedInForeground = (
		handler: OnPushNotificationMessageHandler
	): EventListener<OnPushNotificationMessageHandler> => {
		this.assertIsEnabled();
		return addEventListener(
			PushNotificationEvent.FOREGROUND_MESSAGE_RECEIVED,
			handler
		);
	};

	onNotificationOpened = (
		handler: OnPushNotificationMessageHandler
	): EventListener<OnPushNotificationMessageHandler> => {
		this.assertIsEnabled();
		return addEventListener(PushNotificationEvent.NOTIFICATION_OPENED, handler);
	};

	onTokenReceived = (
		handler: OnTokenReceivedHandler
	): EventListener<OnTokenReceivedHandler> => {
		this.assertIsEnabled();
		return addEventListener(PushNotificationEvent.TOKEN_RECEIVED, handler);
	};

	private registerDevice = async (): Promise<void[]> => {
		return Promise.all<void>(
			this.pluggables.map(async pluggable => {
				try {
					await pluggable.registerDevice(this.token);
				} catch (err) {
					logger.error('Failed to register device for push notifications', err);
					throw err;
				}
			})
		);
	};

	private assertIsEnabled = (): void => {
		if (!this.isEnabled) {
			throw new NotEnabledError();
		}
	};
}
