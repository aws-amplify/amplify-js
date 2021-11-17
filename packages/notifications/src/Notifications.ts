/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

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
		this.inAppMessaging.configure(this.config.InAppMessages);

		return this.config;
	};

	get InAppMessaging() {
		return this.inAppMessaging;
	}
}

const Notifications = new NotificationsClass();

export default Notifications;
Amplify.register(Notifications);
