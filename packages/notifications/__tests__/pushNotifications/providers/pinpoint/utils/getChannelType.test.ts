// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { expectNotSupported } from '../../../../testUtils/expectNotSupported';

jest.mock('@aws-amplify/react-native', () => ({
	getOperatingSystem: mockGetOperatingSystem,
}));

// module level mocks
const mockGetOperatingSystem = jest.fn();

describe('getChannelType', () => {
	let getChannelType;

	afterEach(() => {
		mockGetOperatingSystem.mockReset();
	});

	it('returns GCM for Android', () => {
		mockGetOperatingSystem.mockReturnValue('android');
		jest.isolateModules(() => {
			({
				getChannelType,
			} = require('../../../../../src/pushNotifications/providers/pinpoint/utils/getChannelType'));
		});
		expect(getChannelType()).toBe('GCM');
	});

	it('returns APNS_SANDBOX for iOS (dev)', () => {
		mockGetOperatingSystem.mockReturnValue('ios');
		jest.isolateModules(() => {
			({
				getChannelType,
			} = require('../../../../../src/pushNotifications/providers/pinpoint/utils/getChannelType'));
		});
		expect(getChannelType()).toBe('APNS_SANDBOX');
	});

	it('is not supported otherwise', () => {
		jest.isolateModules(() => {
			({
				getChannelType,
			} = require('../../../../../src/pushNotifications/providers/pinpoint/utils/getChannelType'));
		});
		expectNotSupported(getChannelType);
	});
});
