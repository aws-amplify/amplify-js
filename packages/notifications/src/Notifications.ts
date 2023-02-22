// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';

import InAppMessagingClass from './InAppMessaging';
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

		if (this.config.PushNotification) {
			try {
				const PushNotification = require('./PushNotification').default;
				this.pushNotification = new PushNotification();
				this.pushNotification.configure(this.config.PushNotification);
			} catch (err) {
				logger.error(err);
			}
		}

		return this.config;
	};

	get InAppMessaging() {
		return this.inAppMessaging;
	}

	get Push() {
		return this.pushNotification;
	}

	identifyUser = (userId: string, userInfo: UserInfo): Promise<void[][]> => {
		const promises: Promise<void[]>[] = [];
		if (this.InAppMessaging) {
			promises.push(this.InAppMessaging.identifyUser(userId, userInfo));
		}
		if (this.Push) {
			promises.push(this.Push.identifyUser(userId, userInfo));
		}
		return Promise.all<void[]>(promises);
	};
}

const Notifications = new NotificationsClass();

export default Notifications;
Amplify.register(Notifications);
