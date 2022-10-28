// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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
