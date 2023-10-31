// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { resolveConfig } from '../../../../../src/inAppMessaging/providers/pinpoint/utils';

describe('resolveConfig', () => {
	const validConfig = {
		Notifications: {
			InAppMessaging: {
				Pinpoint: { appId: 'test-app-id', region: 'test-region' },
			},
		},
	};
	it('should return the configured appId and region', () => {
		Amplify.configure(validConfig);
		expect(resolveConfig()).toStrictEqual(
			validConfig.Notifications!.InAppMessaging!.Pinpoint
		);
	});
});
