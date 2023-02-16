// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';
import Notifications from '../src/Notifications';
import { adhocConfig, awsConfig, notificationsConfig } from '../__mocks__/data';

jest.mock('@aws-amplify/core');
jest.mock('../src/InAppMessaging', () =>
	jest.fn(() => ({ configure: () => {} }))
);

describe('Notifications', () => {
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
	});
});
