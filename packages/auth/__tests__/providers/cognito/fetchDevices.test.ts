// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchDevices } from '../../../src/providers/cognito';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AmplifyV6 } from '@aws-amplify/core';
import * as cogIdentityProviderClients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import {
	ListDevicesCommandInput,
	ListDevicesCommandOutput,
} from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { deviceManagementAPIConstants } from './testUtils/deviceManagementAPIConstants';

const fetchAuthSessionSpy = jest.spyOn(AmplifyV6.Auth, 'fetchAuthSession');
const configSpy = jest.spyOn(AmplifyV6, 'getConfig');
const listDevicesSpy = jest.spyOn(cogIdentityProviderClients, 'listDevices');

describe('fetchDevices API Happy Path Cases:', () => {
	beforeAll(() => {
		listDevicesSpy.mockImplementation(
			async ({}, params: ListDevicesCommandInput) => {
				return deviceManagementAPIConstants.ListDevicesClientResultHappy as ListDevicesCommandOutput;
			}
		);
		fetchAuthSessionSpy.mockImplementation(async () => {
			return {
				tokens: authAPITestParams.ValidAuthTokens,
			};
		});
		configSpy.mockImplementation(() => authAPITestParams.validAuthConfig);
	});
	afterAll(() => {
		listDevicesSpy.mockClear();
		fetchAuthSessionSpy.mockClear();
		configSpy.mockClear();
	});
	test('fetchDevices API should return a valid deviceId and deviceName', async () => {
		const result = await fetchDevices();
		expect(result).toEqual(
			deviceManagementAPIConstants.ListDevicesAPIResultHappy
		);
	});
});

describe('fetchDevices API Edge Cases:', () => {
	beforeAll(() => {
		listDevicesSpy.mockImplementation(
			async ({}, params: ListDevicesCommandInput) => {
				return deviceManagementAPIConstants.ListDevicesClientResultNoDeviceName as ListDevicesCommandOutput;
			}
		);
		fetchAuthSessionSpy.mockImplementation(async () => {
			return {
				tokens: authAPITestParams.ValidAuthTokens,
			};
		});
		configSpy.mockImplementation(() => authAPITestParams.validAuthConfig);
	});
	afterAll(() => {
		listDevicesSpy.mockClear();
		fetchAuthSessionSpy.mockClear();
		configSpy.mockClear();
	});
	test('should return a valid deviceId and but not deviceName as its not present in the result', async () => {
		const result = await fetchDevices();
		expect(result[0].deviceName).toBeUndefined();
	});
});

describe('fetchDevices API Error Path Cases:', () => {
	beforeEach(() => {
		listDevicesSpy.mockImplementationOnce(
			async ({}, params: ListDevicesCommandInput) => {
				return deviceManagementAPIConstants.ListDevicesClientResultHappy as ListDevicesCommandOutput;
			}
		);
	});
	afterAll(() => {
		listDevicesSpy.mockClear();
		fetchAuthSessionSpy.mockClear();
		configSpy.mockClear();
	});
	test('fetchDevices API should throw an AuthError when there are no tokens available', async () => {
		fetchAuthSessionSpy.mockImplementationOnce(async () => {
			return {
				tokens: undefined,
			};
		});
		const res = fetchDevices();
		expect(res).rejects.toHaveProperty('name', 'UserNotLoggedIn');
		expect(res).rejects.toHaveProperty(
			'message',
			'Devices can only be fetched for authenticated users'
		);
	});
	test('fetchDevices API should throw an AuthError when there are no tokens available', async () => {
		fetchAuthSessionSpy.mockImplementationOnce(async () => {
			return {
				tokens: authAPITestParams.ValidAuthTokens,
			};
		});
		configSpy.mockImplementationOnce(() => {
			delete authAPITestParams.validAuthConfig.Auth?.userPoolId;
			return authAPITestParams.validAuthConfig;
		});
		const res = fetchDevices();

		expect(res).rejects.toHaveProperty('name', 'AuthConfigException');
		expect(res).rejects.toHaveProperty(
			'message',
			'Cannot list devices without an userPoolId'
		);
	});
});
