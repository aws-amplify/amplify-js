// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';

import { NotificationsCategory } from './types';
import { InternalNotificationsClass } from './internals/InternalNotifications';

const logger = new Logger('Notifications');

class NotificationsClass extends InternalNotificationsClass {
	constructor() {
		super(false);
	}

	/**
	 * Get the name of the module category
	 * @returns {string} name of the module category
	 */
	getModuleName(): NotificationsCategory {
		return 'Notifications';
	}
}

const Notifications = new NotificationsClass();

export default Notifications;
Amplify.register(Notifications);
