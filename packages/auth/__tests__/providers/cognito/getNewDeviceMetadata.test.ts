// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { AuthError } from '../../../src/errors/AuthError';
import { ConfirmDeviceException } from '../../../src/providers/cognito/types/errors';
import { getNewDeviceMetadata } from '../../../src/providers/cognito/utils/signInHelpers';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';
import { createConfirmDeviceClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';

jest.mock('../../../src/providers/cognito/factories');
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);

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

const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
	createCognitoUserPoolEndpointResolver,
);

describe('test getNewDeviceMetadata API', () => {
	const mockConfirmDevice = jest.fn();
	const mockCreateConfirmDeviceClient = jest.mocked(createConfirmDeviceClient);

	beforeEach(() => {
		mockCreateConfirmDeviceClient.mockReturnValueOnce(mockConfirmDevice);
	});

	afterEach(() => {
		mockConfirmDevice.mockClear();
		mockCreateConfirmDeviceClient.mockClear();
	});

	test('getNewDeviceMetadata should call confirmDevice and return DeviceMetadata', async () => {
		mockConfirmDevice.mockResolvedValueOnce({
			UserConfirmationNecessary: true,
			$metadata: {},
		});

		const mockedDeviceKey = 'mockedDeviceKey';
		const mockedGroupDeviceKey = 'mockedGroupDeviceKey';
		const deviceMetadata = await getNewDeviceMetadata({
			userPoolId,
			userPoolEndpoint: undefined,
			newDeviceMetadata: {
				DeviceKey: mockedDeviceKey,
				DeviceGroupKey: mockedGroupDeviceKey,
			},
			accessToken: mockedAccessToken,
		});

		expect(deviceMetadata?.deviceKey).toBe(mockedDeviceKey);
		expect(deviceMetadata?.deviceGroupKey).toBe(mockedGroupDeviceKey);
		expect(mockConfirmDevice).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				DeviceKey: mockedDeviceKey,
			}),
		);
	});

	test('getNewDeviceMetadata should return undefined when ConfirmDevice throws an error', async () => {
		mockConfirmDevice.mockRejectedValueOnce(
			new AuthError({
				name: ConfirmDeviceException.InternalErrorException,
				message: 'error while calling confirmDevice',
			}),
		);
		const mockedDeviceKey = 'mockedDeviceKey';
		const mockedGroupDeviceKey = 'mockedGroupDeviceKey';
		const deviceMetadata = await getNewDeviceMetadata({
			userPoolId,
			userPoolEndpoint: undefined,
			newDeviceMetadata: {
				DeviceKey: mockedDeviceKey,
				DeviceGroupKey: mockedGroupDeviceKey,
			},
			accessToken: mockedAccessToken,
		});

		expect(deviceMetadata).toBeUndefined();
		expect(mockConfirmDevice).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				DeviceKey: mockedDeviceKey,
			}),
		);
	});

	it('invokes createCognitoUserPoolEndpointResolver with expected userPoolEndpoint parameter', async () => {
		const expectedEndpoint = 'https://custom-endpoint.com';
		await getNewDeviceMetadata({
			userPoolId,
			userPoolEndpoint: expectedEndpoint,
			newDeviceMetadata: {
				DeviceKey: 'devicekey',
				DeviceGroupKey: 'groupkey',
			},
			accessToken: mockedAccessToken,
		});

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedEndpoint,
		});
	});
});
