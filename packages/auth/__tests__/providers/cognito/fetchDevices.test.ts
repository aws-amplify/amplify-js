// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../src/errors/AuthError';
import { fetchDevices } from '../../../src/providers/cognito';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { Amplify } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import * as authUtils from '../../../src';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
import { ListDevicesException } from '../../../src/providers/cognito/types/errors';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

Amplify.configure({
	Auth: {
		Cognito: {
			userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			userPoolId: 'us-west-2_zzzzz',
			identityPoolId: 'us-west-2:xxxxxx',
		},
	},
});
const mockedAccessToken =
	'test_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const dateEpoch = 1.696296885807e9;
const date = new Date(dateEpoch * 1000);
const clientResponseDevice = {
	DeviceAttributes: [{ Name: 'attributeName', Value: 'attributeValue' }],
	DeviceCreateDate: dateEpoch,
	DeviceKey: 'DeviceKey',
	DeviceLastAuthenticatedDate: dateEpoch,
	DeviceLastModifiedDate: dateEpoch,
};
const apiOutputDevice = {
	id: 'DeviceKey',
	name: undefined,
	attributes: {
		attributeName: 'attributeValue',
	},
	createDate: date,
	lastModifiedDate: date,
	lastAuthenticatedDate: date,
};

describe('fetchDevices API happy path cases', () => {
	let fetchAuthSessionsSpy;
	beforeEach(() => {
		fetchAuthSessionsSpy = jest
			.spyOn(authUtils, 'fetchAuthSession')
			.mockImplementationOnce(
				async (): Promise<{ tokens: { accessToken: any } }> => {
					return {
						tokens: {
							accessToken: decodeJWT(mockedAccessToken),
						},
					};
				}
			);
	});
	afterEach(() => {
		fetchAuthSessionsSpy.mockClear();
	});

	it('should fetch devices and parse client response correctly with and without device name', async () => {
		// expect.assertions(3);
		const deviceName = {
			Name: 'device_name',
			Value: 'test-device-name',
		};

		const fetchDevicesClientSpy = jest
			.spyOn(clients, 'listDevices')
			.mockImplementationOnce(async () => {
				return {
					Devices: [
						{
							...clientResponseDevice,
							DeviceKey: 'DeviceKey1',
							DeviceAttributes: [
								...clientResponseDevice.DeviceAttributes,
								deviceName,
							],
						},
						{ ...clientResponseDevice, DeviceKey: 'DeviceKey2' },
					],
					$metadata: {},
				};
			});

		expect(await fetchDevices()).toEqual([
			{
				...apiOutputDevice,
				id: 'DeviceKey1',
				name: deviceName.Value,
				attributes: {
					...apiOutputDevice.attributes,
					[deviceName.Name]: deviceName.Value,
				},
			},
			{ ...apiOutputDevice, id: 'DeviceKey2' },
		]);
		expect(fetchDevicesClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				Limit: 60,
			})
		);
		expect(fetchDevicesClientSpy).toBeCalledTimes(1);
	});
});

describe('fetchDevices API error path cases', () => {
	it('should raise service error', async () => {
		expect.assertions(2);
		jest
			.spyOn(authUtils, 'fetchAuthSession')
			.mockImplementationOnce(
				async (): Promise<{ tokens: { accessToken: any } }> => {
					return {
						tokens: {
							accessToken: decodeJWT(mockedAccessToken),
						},
					};
				}
			);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(ListDevicesException.InvalidParameterException)
			)
		);
		try {
			await fetchDevices();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(ListDevicesException.InvalidParameterException);
		}
	});
});
