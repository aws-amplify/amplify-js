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

const RTN_MODULE = '@aws-amplify/rtn-push-notification';
const logger = new Logger('Notifications.PushNotification');

export default class PushNotification implements PushNotificationInterface {
	private config: Record<string, any> = {};
	private configured = false;
	private nativeEvent: Record<string, string>;
	private nativeEventEmitter: NativeEventEmitter;
	private nativeHeadlessTaskKey: string;
	private nativeModule: PushNotificationNativeModule;
	private pluggables: PushNotificationProvider[] = [];
	private token: string;

	constructor() {
		try {
			this.nativeModule = AmplifyRTNPushNotification;
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

		// some configuration steps should not be re-run even if provider is re-configured for some reason
		if (!this.configured) {
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
			} else if (this.nativeEvent.BACKGROUND_MESSAGE_RECEIVED) {
				// on platforms that can't handle headless tasks, listen for native background message received event and
				// broadcast to library listeners
				this.nativeEventEmitter.addListener(
					`${this.nativeEvent.BACKGROUND_MESSAGE_RECEIVED}`,
					async message => {
						// keep background task running until handlers have completed their work
						await notifyEventListenersAndAwaitHandlers(
							PushNotificationEvent.BACKGROUND_MESSAGE_RECEIVED,
							normalizeNativeMessage(message)
						);
						// notify native module handlers have completed their work
						this.nativeModule.completeNotification?.(
							message.completionHandlerId
						);
					}
				);
			}

			this.nativeEventEmitter.addListener(
				// listen for native foreground message received event and broadcast to library listeners
				`${this.nativeEvent.FOREGROUND_MESSAGE_RECEIVED}`,
				message => {
					notifyEventListeners(
						PushNotificationEvent.FOREGROUND_MESSAGE_RECEIVED,
						normalizeNativeMessage(message)
					);
				}
			);

			const launchNotificationOpenedListener = this.nativeEvent
				.LAUNCH_NOTIFICATION_OPENED
				? this.nativeEventEmitter.addListener(
						// listen for native notification opened app (user tapped on notification, opening the app from quit -
						// not background - state) event. This is broadcasted to an internal listener only as it is not intended
						// for use otherwise as it produces inconsistent results when used within React Native app context
						`${this.nativeEvent.LAUNCH_NOTIFICATION_OPENED}`,
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
				`${this.nativeEvent.NOTIFICATION_OPENED}`,
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
				`${this.nativeEvent.TOKEN_RECEIVED}`,
				({ token }) => {
					this.token = token;
					this.registerDevice();
					notifyEventListeners(PushNotificationEvent.TOKEN_RECEIVED, token);
				}
			);
		}

		this.configured = true;
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

	identifyUser = (userId: string, userInfo: UserInfo): Promise<void[]> =>
		Promise.all<void>(
			this.pluggables.map(async pluggable => {
				try {
					await pluggable.identifyUser(userId, userInfo);
				} catch (err) {
					logger.error('Failed to identify user', err);
					throw err;
				}
			})
		);

	getLaunchNotification = async (): Promise<PushNotificationMessage | null> => {
		const { getLaunchNotification } = this.nativeModule;
		return normalizeNativeMessage(await getLaunchNotification?.());
	};

	requestPermissions = async (
		permissions: PushNotificationPermissions = {
			alert: true,
			badge: true,
			sound: true,
		}
	): Promise<PushNotificationPermissionStatus> => {
		const { requestPermissions } = this.nativeModule;
		return normalizeNativePermissionStatus(
			await requestPermissions?.(permissions)
		);
	};

	/**
	 * Background notifications on will start the app (as a headless JS instance running on a background service on
	 * Android) in the background. Handlers registered via `onBackgroundNotificationReceived` should return Promises if
	 * it needs to be asynchronous (e.g. to perform some network requests). The app should run in the background as long
	 * as there are handlers still running (however, if they run for more than 30 seconds on iOS, subsequent tasks could
	 * get deprioritized!). If it is necessary for a handler to execute while the app is in quit state, it should be
	 * registered in the application entry point (e.g. index.js) since the application will not fully mount in that case.
	 *
	 * @param handler a function to be run when a BACKGROUND_MESSAGE_RECEIVED event is received
	 * @returns an event listener which should be removed when no longer needed
	 */
	onBackgroundNotificationReceived = (
		handler: OnPushNotificationMessageHandler
	): EventListener<OnPushNotificationMessageHandler> =>
		addEventListener(
			PushNotificationEvent.BACKGROUND_MESSAGE_RECEIVED,
			handler
		);

	onForegroundNotificationReceived = (
		handler: OnPushNotificationMessageHandler
	): EventListener<OnPushNotificationMessageHandler> =>
		addEventListener(
			PushNotificationEvent.FOREGROUND_MESSAGE_RECEIVED,
			handler
		);

	onNotificationOpened = (
		handler: OnPushNotificationMessageHandler
	): EventListener<OnPushNotificationMessageHandler> =>
		addEventListener(PushNotificationEvent.NOTIFICATION_OPENED, handler);

	onTokenReceived = (
		handler: OnTokenReceivedHandler
	): EventListener<OnTokenReceivedHandler> =>
		addEventListener(PushNotificationEvent.TOKEN_RECEIVED, handler);

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
}
