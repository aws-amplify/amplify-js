// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import PlatformNotSupportedError from '.';
import {
	NotificationsSubCategory,
	OnPushNotificationMessageHandler,
	OnTokenReceivedHandler,
	PushNotificationConfig,
	PushNotificationInterface,
	PushNotificationMessage,
	PushNotificationPermissions,
	PushNotificationPermissionStatus,
} from './types';

export default class PushNotification implements PushNotificationInterface {
	/**
	 * Configure PushNotification
	 * @param {Object} config - PushNotification configuration object
	 */
	configure = (_): PushNotificationConfig => {
		throw new PlatformNotSupportedError();
	};

	/**
	 * Get the name of this module
	 * @returns {string} name of this module
	 */
	getModuleName(): NotificationsSubCategory {
		throw new PlatformNotSupportedError();
	}

	/**
	 * Get a plugin from added plugins
	 * @param {string} providerName - the name of the plugin to get
	 */
	getPluggable = () => {
		throw new PlatformNotSupportedError();
	};

	/**
	 * Add plugin into PushNotification
	 * @param {PushNotificationProvider} pluggable - an instance of the plugin
	 */
	addPluggable = (): void => {
		throw new PlatformNotSupportedError();
	};

	/**
	 * Remove a plugin from added plugins
	 * @param {string} providerName - the name of the plugin to remove
	 */
	removePluggable = (): void => {
		throw new PlatformNotSupportedError();
	};

	identifyUser = (): Promise<void[]> => {
		throw new PlatformNotSupportedError();
	};

	getLaunchNotification = (): Promise<PushNotificationMessage> => {
		throw new PlatformNotSupportedError();
	};

	getBadgeCount = async (): Promise<number | null> => {
		throw new PlatformNotSupportedError();
	};

	setBadgeCount = (_: number): void => {
		throw new PlatformNotSupportedError();
	};

	getPermissionStatus = (): Promise<PushNotificationPermissionStatus> => {
		throw new PlatformNotSupportedError();
	};

	requestPermissions = (_?: PushNotificationPermissions): Promise<boolean> => {
		throw new PlatformNotSupportedError();
	};

	onBackgroundNotificationReceived = (
		_: OnPushNotificationMessageHandler
	): any => {
		throw new PlatformNotSupportedError();
	};

	onForegroundNotificationReceived = (
		_: OnPushNotificationMessageHandler
	): any => {
		throw new PlatformNotSupportedError();
	};

	onTokenReceived = (_: OnTokenReceivedHandler): any => {
		throw new PlatformNotSupportedError();
	};

	onNotificationOpened = (_: OnPushNotificationMessageHandler): any => {
		throw new PlatformNotSupportedError();
	};
}
