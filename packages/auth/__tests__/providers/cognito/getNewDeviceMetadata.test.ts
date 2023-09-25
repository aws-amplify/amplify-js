// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../src/errors/AuthError';
import { ConfirmDeviceException } from '../../../src/providers/cognito/types/errors';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { ConfirmDeviceCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { Amplify } from '@aws-amplify/core';
import { getNewDeviceMetatada } from '../../../src/providers/cognito/utils/signInHelpers';

const userPoolId = 'us-west-2_zzzzz';
Amplify.configure({
	Auth: {
		Cognito: {
			userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			userPoolId,
			identityPoolId: 'us-west-2:xxxxxx',
		},
	},
});
const mockedAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('test getNewDeviceMetadata API', () => {
	test('getNewDeviceMetadata should call confirmDevice and return DeviceMetadata', async () => {
		const confirmDeviceClientSpy = jest
			.spyOn(clients, 'confirmDevice')
			.mockImplementationOnce(async (): Promise<ConfirmDeviceCommandOutput> => {
				return { UserConfirmationNecessary: true, $metadata: {} };
			});
		const mockedDeviceKey = 'mockedDeviceKey';
		const mockedGroupDeviceKey = 'mockedGroupDeviceKey';
		const deviceMetadata = await getNewDeviceMetatada(
			userPoolId,
			{
				DeviceKey: mockedDeviceKey,
				DeviceGroupKey: mockedGroupDeviceKey,
			},
			mockedAccessToken
		);

		expect(deviceMetadata?.deviceKey).toBe(mockedDeviceKey);
		expect(deviceMetadata?.deviceGroupKey).toBe(mockedGroupDeviceKey);
		expect(confirmDeviceClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				DeviceKey: mockedDeviceKey,
			})
		);

		confirmDeviceClientSpy.mockClear();
	});

	test('getNewDeviceMetadata should return undefined when ConfirmDevice throws an error', async () => {
		const confirmDeviceClientSpy = jest
			.spyOn(clients, 'confirmDevice')
			.mockImplementationOnce(async (): Promise<ConfirmDeviceCommandOutput> => {
				throw new AuthError({
					name: ConfirmDeviceException.InternalErrorException,
					message: 'error while calling confirmDevice',
				});
			});
		const mockedDeviceKey = 'mockedDeviceKey';
		const mockedGroupDeviceKey = 'mockedGroupDeviceKey';
		const deviceMetadata = await getNewDeviceMetatada(
			userPoolId,
			{
				DeviceKey: mockedDeviceKey,
				DeviceGroupKey: mockedGroupDeviceKey,
			},
			mockedAccessToken
		);

		expect(deviceMetadata).toBeUndefined();
		expect(confirmDeviceClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				DeviceKey: mockedDeviceKey,
			})
		);

		confirmDeviceClientSpy.mockClear();
	});
});
