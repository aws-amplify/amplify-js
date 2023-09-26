// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import PushNotification from '../../src/pushNotifications';

const notSupportedError = /Function not supported/;

describe('PushNotification', () => {
	test('is currently not supported', async () => {
		const pushNotification = new PushNotification();

		expect(pushNotification.configure).toThrow(notSupportedError);
		expect(pushNotification.getModuleName).toThrow(notSupportedError);
		expect(pushNotification.getPluggable).toThrow(notSupportedError);
		expect(pushNotification.addPluggable).toThrow(notSupportedError);
		expect(pushNotification.removePluggable).toThrow(notSupportedError);
		expect(pushNotification.enable).toThrow(notSupportedError);
		expect(pushNotification.identifyUser).toThrow(notSupportedError);
		await expect(pushNotification.getLaunchNotification()).rejects.toThrow(
			notSupportedError
		);
		await expect(pushNotification.getBadgeCount()).rejects.toThrow(
			notSupportedError
		);
		expect(pushNotification.setBadgeCount).toThrow(notSupportedError);
		await expect(pushNotification.getPermissionStatus()).rejects.toThrow(
			notSupportedError
		);
		await expect(pushNotification.requestPermissions()).rejects.toThrow(
			notSupportedError
		);
		expect(pushNotification.onNotificationReceivedInBackground).toThrow(
			notSupportedError
		);
		expect(pushNotification.onNotificationReceivedInForeground).toThrow(
			notSupportedError
		);
		expect(pushNotification.onTokenReceived).toThrow(notSupportedError);
		expect(pushNotification.onNotificationOpened).toThrow(notSupportedError);
	});
});
