// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../../../../../src/inAppMessaging/providers/pinpoint/utils';
import { createMockAmplifyContext } from '../../../../testUtils/createMockAmplifyContext';

describe('resolveConfig', () => {
	const validConfig = {
		Notifications: {
			InAppMessaging: {
				Pinpoint: { appId: 'test-app-id', region: 'test-region' },
			},
		},
	};
	it('should return the configured appId and region', () => {
		const ctx = createMockAmplifyContext(validConfig);
		expect(resolveConfig(ctx)).toStrictEqual(
			validConfig.Notifications!.InAppMessaging!.Pinpoint,
		);
	});
});
