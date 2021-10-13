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

import {
	Amplify,
	ConsoleLogger as Logger,
	parseMobileHubConfig,
} from '@aws-amplify/core';
import InAppMessaging from './inAppMessaging';
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
	configure = ({ ...config }: NotificationsConfig = {}) => {
		this.config = Object.assign(
			{},
			this.config,
			parseMobileHubConfig(config).Notifications ?? {},
			config
		);

		logger.debug('configure Notifications', config);

		const inAppMessagingConfig = this.inAppMessaging.configure(
			this.config.InAppMessaging
		);

		return { ...inAppMessagingConfig };
	};

	get InAppMessaging() {
		return this.inAppMessaging;
	}
}

const Notifications = new NotificationsClass();

export default Notifications;
Amplify.register(Notifications);
