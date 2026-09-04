// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import { ConsoleLogger } from '@aws-amplify/core';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import * as defaultExports from '../../src/pushNotifications';
import * as customerProfilesExports from '../../src/pushNotifications/providers/customer-profiles';

const DEPRECATED_RUNTIME_APIS = [
	'getBadgeCount',
	'setBadgeCount',
	'getPermissionStatus',
	'requestPermissions',
	'getLaunchNotification',
	'onNotificationReceivedInForeground',
	'onNotificationReceivedInBackground',
	'onNotificationOpened',
	'onTokenReceived',
	'identifyUser',
	'initializePushNotifications',
] as const;

describe('push-notifications default (Pinpoint) entry point', () => {
	const loggerWarnSpy = jest.spyOn(ConsoleLogger.prototype, 'warn');

	beforeAll(() => {
		setGlobalContext(createMockAmplifyContext());
	});

	afterAll(() => {
		clearGlobalContext();
	});

	beforeEach(() => {
		loggerWarnSpy.mockClear();
	});

	it.each(DEPRECATED_RUNTIME_APIS)(
		'emits a deprecation warning when %s is invoked',
		async apiName => {
			const api = defaultExports[apiName] as (...args: any[]) => unknown;

			// Every default API is unsupported on the web platform, so invoking it
			// throws synchronously or rejects. The warning must still be emitted
			// beforehand in both cases, and the underlying error must reach the
			// caller untouched.
			try {
				await api({ handler: () => undefined });
				throw new Error(`expected ${apiName} to reject or throw`);
			} catch (error) {
				expect((error as Error).name).toBe('PlatformNotSupported');
			}

			expect(loggerWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining(
					'aws-amplify/push-notifications/customer-profiles',
				),
			);
		},
	);

	it('exposes an equivalent for every deprecated API on the customer-profiles sub-path', () => {
		DEPRECATED_RUNTIME_APIS.forEach(apiName => {
			expect(typeof customerProfilesExports[apiName]).toBe('function');
		});
	});
});
