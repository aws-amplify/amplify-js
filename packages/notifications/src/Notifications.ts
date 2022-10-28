// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';
import InAppMessaging from './InAppMessaging';
import { NotificationsCategory, NotificationsConfig } from './types';

const logger = new Logger('Notifications');

class NotificationsClass {
	private config: Record<string, any> = {};
	private inAppMessaging: InAppMessaging;

	constructor() {
		this.inAppMessaging = new InAppMessaging();
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

		return this.config;
	};

	get InAppMessaging() {
		return this.inAppMessaging;
	}
}

const Notifications = new NotificationsClass();

export default Notifications;
Amplify.register(Notifications);
