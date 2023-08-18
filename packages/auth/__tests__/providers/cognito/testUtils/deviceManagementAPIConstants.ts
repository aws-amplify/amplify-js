// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DeviceType } from '../../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';

export const deviceManagementAPIConstants = {
	ListDevicesClientResultHappy: {
		Devices: <DeviceType>[
			{
				DeviceKey: 'test-device-key',
				DeviceAttributes: [
					{
						Name: 'device_name',
						Value: 'test-name',
					},
					{
						Name: 'test-device-name-1',
						Value: 'test-value',
					},
				],
			},
		],
		PaginationToken: 'paginationToken',
		$metadata: {},
	},
	ListDevicesClientResultNoDeviceName: {
		Devices: <DeviceType>[
			{
				DeviceKey: 'test-device-key-2',
				DeviceAttributes: [
					{
						Name: 'not_expected_value',
						Value: 'test-name',
					},
				],
			},
		],
		PaginationToken: 'paginationToken',
		$metadata: {},
	},
	ListDevicesAPIResultHappy: [
		{
			deviceId: 'test-device-key',
			deviceName: 'test-name',
		},
	],
};
