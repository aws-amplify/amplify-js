// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';

import InAppMessagingClass from './InAppMessaging';
import PushNotificationClass from './PushNotification';
import { InAppMessagingInterface as InAppMessaging } from './InAppMessaging/types';
import { PushNotificationInterface as PushNotification } from './PushNotification/types';
import { NotificationsCategory, NotificationsConfig, UserInfo } from './types';

const logger = new Logger('Notifications');

class NotificationsClass {
	private config: Record<string, any> = {};
	private inAppMessaging: InAppMessaging;
	private pushNotification?: PushNotification;

	constructor() {
		this.inAppMessaging = new InAppMessagingClass();
	}

	/**
	 * Get the name of the module category
	 * @returns {string} name of the module category
	 */
	getModuleName(): NotificationsCategory {
		return 'Notifications';
	}

	/**
	 * Configure Notifications
	 * @param {Object} config - Notifications configuration object
	 */
	configure = ({ Notifications: config }: NotificationsConfig = {}) => {
		this.config = { ...this.config, ...config };

		logger.debug('configure Notifications', config);

		// Configure sub-categories
		this.inAppMessaging.configure(this.config.InAppMessaging);

		if (this.config.Push) {
			try {
				// only instantiate once
				if (!this.pushNotification) {
					this.pushNotification = new PushNotificationClass();
				}
				this.pushNotification.configure(this.config.Push);
			} catch (err) {
				logger.error(err);
			}
		}

		return this.config;
	};

	get InAppMessaging(): InAppMessaging {
		return this.inAppMessaging;
	}

	get Push(): PushNotification {
		return this.pushNotification ?? ({} as PushNotification);
	}

	identifyUser = (userId: string, userInfo: UserInfo): Promise<void[]> => {
		const identifyFunctions: Function[] = [];
		if (this.inAppMessaging) {
			identifyFunctions.push(this.inAppMessaging.identifyUser);
		}
		if (this.pushNotification) {
			identifyFunctions.push(this.pushNotification.identifyUser);
		}
		return Promise.all<void>(
			identifyFunctions.map(async identifyFunction => {
				try {
					await identifyFunction(userId, userInfo);
				} catch (err) {
					logger.error('Failed to identify user', err);
					throw err;
				}
			})
		);
	};
}

const Notifications = new NotificationsClass();

export default Notifications;
Amplify.register(Notifications);
