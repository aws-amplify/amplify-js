// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener, AWSPinpointProviderCommon } from '../../../common';
import { ChannelType } from '../../../common/AWSPinpointProviderCommon/types';
import {
	PushNotificationMessage,
	PushNotificationProvider,
	NotificationsSubCategory,
} from '../../types';
import { AWSPinpointMessageEvent } from './types';
import { logger } from './utils';

export default class AWSPinpointProvider
	extends AWSPinpointProviderCommon
	implements PushNotificationProvider
{
	static subCategory: NotificationsSubCategory = 'PushNotification';

	private configured = false;

	constructor() {
		super(logger);
	}

	/**
	 * get the sub-category of the plugin
	 */
	getSubCategory() {
		return AWSPinpointProvider.subCategory;
	}

	configure = (config = {}): Record<string, any> => {
		this.config = {
			...super.configure(config),
			endpointInfo: { channelType: this.getChannelType() },
		};

		// some configuration steps should not be re-run even if provider is re-configured for some reason
		if (!this.configured) {
			// wire up default Pinpoint message event handling
			addEventListener('backgroundMessageReceived', message =>
				this.recordMessageEvent(
					message,
					AWSPinpointMessageEvent.BACKGROUND_MESSAGE_RECEIVED
				)
			);
			addEventListener('foregroundMessageReceived', message =>
				this.recordMessageEvent(
					message,
					AWSPinpointMessageEvent.FOREGROUND_MESSAGE_RECEIVED
				)
			);
			const launchNotificationOpenedListener = addEventListener(
				'launchNotificationsOpened',
				message => {
					this.recordMessageEvent(
						message,
						AWSPinpointMessageEvent.NOTIFICATION_OPENED
					);
					// once we are done with it we can remove the listener
					launchNotificationOpenedListener?.remove();
				}
			);
			addEventListener('notificationOpened', message => {
				this.recordMessageEvent(
					message,
					AWSPinpointMessageEvent.NOTIFICATION_OPENED
				);
				// if we are in this state, we no longer need the listener as the app was launched via some other means
				launchNotificationOpenedListener?.remove();
			});
		}

		this.configured = true;
		return this.config;
	};

	registerDevice = async (address: string): Promise<void> => {
		throw new Error('WIP');
	};

	private getChannelType = (): ChannelType => {
		throw new Error('WIP');
	};

	private recordMessageEvent = async (
		message: PushNotificationMessage,
		event: AWSPinpointMessageEvent
	): Promise<void> => {
		throw new Error('WIP');
	};
}
