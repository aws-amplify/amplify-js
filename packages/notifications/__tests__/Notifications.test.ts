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
import { Amplify } from '@aws-amplify/core';
import Notifications from '../src/Notifications';
import { adhocConfig, awsConfig, notificationsConfig } from '../__mocks__/data';

jest.mock('@aws-amplify/core');

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
