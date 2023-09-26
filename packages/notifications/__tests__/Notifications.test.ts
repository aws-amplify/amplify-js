// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, ConsoleLogger } from '@aws-amplify/core';
import {
	adhocConfig,
	awsConfig,
	notificationsConfig,
	userId,
	userInfo,
} from '../__mocks__/data';
import PushNotification from '../src/pushNotifications';

jest.mock('@aws-amplify/core');
jest.mock('../src/inAppMessaging', () => jest.fn(() => mockInAppMessaging));
jest.mock('../src/pushNotifications', () =>
	jest.fn(() => mockPushNotification)
);

const mockInAppMessaging = {
	configure: jest.fn(),
	identifyUser: jest.fn(),
};
const mockPushNotification = {
	configure: jest.fn(),
	identifyUser: jest.fn(),
};
const loggerErrorSpy = jest.spyOn(ConsoleLogger.prototype, 'error');

describe('Notifications', () => {
	let Notifications;

	beforeEach(() => {
		jest.isolateModules(() => {
			Notifications = require('../src/Notifications').default;
		});
	});
	test('registers with Amplify', () => {
		expect(Amplify.register).toBeCalledWith(Notifications);
	});

	test('returns the correct module name', () => {
		expect(Notifications.getModuleName()).toBe('Notifications');
	});

	test('is constructed with InAppMessaging', () => {
		expect(Notifications.InAppMessaging).toBeDefined();
	});

	describe('configure', () => {
		test('can be called without input', () => {
			const config = Notifications.configure();

			expect(config).toStrictEqual({});
		});

		test('works with aws-exports', () => {
			const config = Notifications.configure(awsConfig);

			expect(config).toStrictEqual(notificationsConfig);
		});

		test('works with adhoc config', () => {
			const config = Notifications.configure(adhocConfig);

			expect(config).toStrictEqual(adhocConfig.Notifications);
		});

		test('can be configured with Push', () => {
			Notifications.configure(awsConfig);

			expect(Notifications.Push).toBeDefined();
		});

		test('does not crash if Push fails to configure', () => {
			(PushNotification as jest.Mock).mockImplementationOnce(() => {
				throw new Error();
			});
			Notifications.configure(awsConfig);

			expect(loggerErrorSpy).toBeCalledWith(expect.any(Error));
		});
	});

	describe('identifyUser', () => {
		test('identifies users with subcategoies', async () => {
			Notifications.configure(awsConfig);
			await Notifications.identifyUser(userId, userInfo);

			expect(mockInAppMessaging.identifyUser).toBeCalledWith(userId, userInfo);
			expect(mockPushNotification.identifyUser).toBeCalledWith(
				userId,
				userInfo
			);
		});

		test('rejects if there is a failure identifying user', async () => {
			mockInAppMessaging.identifyUser.mockImplementation(() => {
				throw new Error();
			});

			await expect(
				Notifications.identifyUser(userId, userInfo)
			).rejects.toStrictEqual(expect.any(Error));
		});
	});
});
