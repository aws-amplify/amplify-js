// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserInfo } from '../types';
import {
	InAppMessagingInterface,
	InAppMessagingEvent,
	NotificationsSubCategory,
} from './types';
import { InternalInAppMessagingClass } from './internals/InternalInAppMessaging';

export default class InAppMessaging
	extends InternalInAppMessagingClass
	implements InAppMessagingInterface
{
	/**
	 * Get the name of this module
	 * @returns {string} name of this module
	 */
	getModuleName(): NotificationsSubCategory {
		return 'InAppMessaging';
	}

	/**
	 * Get the map resources that are currently available through the provider
	 * @param {string} provider
	 * @returns - Array of available map resources
	 */
	syncMessages = (): Promise<void[]> => super.syncMessages();

	clearMessages = (): Promise<void[]> => super.clearMessages();

	dispatchEvent = async (event: InAppMessagingEvent): Promise<void> =>
		super.dispatchEvent(event);

	identifyUser = (userId: string, userInfo: UserInfo): Promise<void[]> =>
		super.identifyUser(userId, userInfo);
}
