// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Category,
	PushNotificationAction,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';
import { getPushNotificationUserAgentString } from '../../../src/pushNotifications/utils/getPushNotificationUserAgentString';
import { userAgentValue } from '../../testUtils/data';

jest.mock('@aws-amplify/core/internals/utils');

describe('getPushNotificationUserAgentString', () => {
	// assert mocks
	const mockGetAmplifyUserAgent = getAmplifyUserAgent as jest.Mock;

	it('gets an Amplify user agent', () => {
		mockGetAmplifyUserAgent.mockReturnValue(userAgentValue);
		expect(
			getPushNotificationUserAgentString(PushNotificationAction.IdentifyUser)
		).toBe(userAgentValue);
		expect(mockGetAmplifyUserAgent).toBeCalledWith({
			category: Category.PushNotification,
			action: PushNotificationAction.IdentifyUser,
		});
	});
});
