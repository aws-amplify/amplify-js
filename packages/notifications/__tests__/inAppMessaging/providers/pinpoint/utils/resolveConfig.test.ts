// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';
import { resolveConfig } from '../../../../../src/inAppMessaging/providers/pinpoint/utils';

const mockCtx = createMockAmplifyContext();

describe('resolveConfig', () => {
	const validConfig = {
		Notifications: {
			InAppMessaging: {
				Pinpoint: { appId: 'test-app-id', region: 'test-region' },
			},
		},
	};
	it('should return the configured appId and region', () => {
		(mockCtx as any).resourcesConfig = validConfig;
		expect(resolveConfig(mockCtx)).toStrictEqual(
			validConfig.Notifications!.InAppMessaging!.Pinpoint,
		);
	});
});
