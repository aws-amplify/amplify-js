// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { Amplify, fetchAuthSession } from '@aws-amplify/core';

import { AuthError } from '../../../src/errors/AuthError';
import { rememberDevice } from '../../../src/providers/cognito';
import { UpdateDeviceStatusException } from '../../../src/providers/cognito/types/errors';
import { tokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import { DeviceMetadata } from '../../../src/providers/cognito/tokenProvider/types';
import { createUpdateDeviceStatusClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';

import { getMockError, mockAccessToken } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');
jest.mock('../../../src/providers/cognito/tokenProvider');

describe('rememberDevice', () => {
	const mockDeviceMetadata: DeviceMetadata = {
		deviceKey: 'deviceKey',
		deviceGroupKey: 'deviceGroupKey',
		randomPassword: 'randomPassword',
	};
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockUpdateDeviceStatus = jest.fn();
	const mockCreateUpdateDeviceStatusClient = jest.mocked(
		createUpdateDeviceStatusClient,
	);
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
	);
	const mockGetDeviceMetadata =
		tokenOrchestrator.getDeviceMetadata as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockGetDeviceMetadata.mockResolvedValue(mockDeviceMetadata);
		mockUpdateDeviceStatus.mockResolvedValue({ $metadata: {} });
		mockCreateUpdateDeviceStatusClient.mockReturnValueOnce(
			mockUpdateDeviceStatus,
		);
	});

	afterEach(() => {
		mockGetDeviceMetadata.mockReset();
		mockUpdateDeviceStatus.mockReset();
		mockFetchAuthSession.mockClear();
		mockCreateUpdateDeviceStatusClient.mockClear();
	});

	it('should call updateDeviceStatus client with correct request', async () => {
		expect.assertions(2);
		await rememberDevice();
		expect(mockUpdateDeviceStatus).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				DeviceKey: mockDeviceMetadata.deviceKey,
				DeviceRememberedStatus: 'remembered',
			}),
		);
		expect(mockUpdateDeviceStatus).toHaveBeenCalledTimes(1);
	});

	it('invokes mockCreateCognitoUserPoolEndpointResolver with expected endpointOverride', async () => {
		const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
		jest.mocked(Amplify.getConfig).mockReturnValueOnce({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					userPoolEndpoint: expectedUserPoolEndpoint,
				},
			},
		});
		await rememberDevice();

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockUpdateDeviceStatus.mockImplementation(() => {
			throw getMockError(UpdateDeviceStatusException.InvalidParameterException);
		});
		try {
			await rememberDevice();
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				UpdateDeviceStatusException.InvalidParameterException,
			);
		}
	});
});
