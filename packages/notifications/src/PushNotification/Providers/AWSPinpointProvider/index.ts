// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener, AWSPinpointProviderCommon } from '../../../common';
import { ChannelType } from '../../../common/AWSPinpointProviderCommon/types';
import PlatformNotSupportedError from '../../PlatformNotSupportedError';
import { Platform } from '../../Platform';
import {
	PushNotificationEvent,
	PushNotificationMessage,
	PushNotificationProvider,
	NotificationsSubCategory,
} from '../../types';
import { AWSPinpointMessageEvent } from './types';
import {
	dispatchPushNotificationEvent,
	getAnalyticsEvent,
	logger,
} from './utils';

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
			addEventListener(
				PushNotificationEvent.BACKGROUND_MESSAGE_RECEIVED,
				message =>
					this.recordMessageEvent(
						message,
						AWSPinpointMessageEvent.BACKGROUND_MESSAGE_RECEIVED
					)
			);
			addEventListener(
				PushNotificationEvent.FOREGROUND_MESSAGE_RECEIVED,
				message =>
					this.recordMessageEvent(
						message,
						AWSPinpointMessageEvent.FOREGROUND_MESSAGE_RECEIVED
					)
			);
			const launchNotificationOpenedListener = addEventListener(
				PushNotificationEvent.LAUNCH_NOTIFICATION_OPENED,
				message => {
					this.recordMessageEvent(
						message,
						AWSPinpointMessageEvent.NOTIFICATION_OPENED
					);
					// once we are done with it we can remove the listener
					launchNotificationOpenedListener?.remove();
				}
			);
			addEventListener(PushNotificationEvent.NOTIFICATION_OPENED, message => {
				this.recordMessageEvent(
					message,
					AWSPinpointMessageEvent.NOTIFICATION_OPENED
				);
				// if we are in this state, we no longer need the listener as the app was launched via some other means
				launchNotificationOpenedListener?.remove();
			});
		}

		this.configured = true;
		dispatchPushNotificationEvent('pinpointProvider_configured', null);
		return this.config;
	};

	registerDevice = async (address: string): Promise<void> => {
		if (!this.initialized) {
			await this.init();
		}
		try {
			this.config.endpointInfo = {
				...this.config.endpointInfo,
				address,
			};
			await this.updateEndpoint();
		} catch (err) {
			this.logger.error('Error registering device', err);
			throw err;
		}
	};

	private getChannelType = (): ChannelType => {
		switch (Platform.OS) {
			case 'android': {
				// FCM was previously known as GCM and continues to be the channel type in Pinpoint
				return 'GCM';
			}
			case 'ios': {
				// If building in debug mode, use the APNs sandbox
				return global['__DEV__'] ? 'APNS_SANDBOX' : 'APNS';
			}
			default: {
				throw new PlatformNotSupportedError();
			}
		}
	};

	private recordMessageEvent = async (
		message: PushNotificationMessage,
		event: AWSPinpointMessageEvent
	): Promise<void> => {
		const analyticsEvent = getAnalyticsEvent(message, event);
		if (!analyticsEvent) {
			logger.debug('A notification missing event information was not recorded');
			return;
		}
		if (!this.initialized) {
			await this.init();
		}
		return this.recordAnalyticsEvent(analyticsEvent);
	};
}
