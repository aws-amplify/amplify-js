// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { rememberDevice } from '../../../src/providers/cognito';
import { UpdateDeviceStatusException } from '../../../src/providers/cognito/types/errors';
import { tokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import { DeviceMetadata } from '../../../src/providers/cognito/tokenProvider/types';
import { createUpdateDeviceStatusClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

import { getMockError, mockAccessToken } from './testUtils/data';

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
	const mockUpdateDeviceStatus = jest.fn();
	const mockCreateUpdateDeviceStatusClient = jest.mocked(
		createUpdateDeviceStatusClient,
	);
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
	);
	const mockGetDeviceMetadata =
		tokenOrchestrator.getDeviceMetadata as jest.Mock;

	const mockCtx = createMockAmplifyContext({
		Auth: {
			Cognito: {
				userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				identityPoolId: 'us-west-2:xxxxxx',
			},
		},
	});

	beforeAll(() => {
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
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
		(mockCtx.fetchAuthSession as jest.Mock).mockClear();
		mockCreateUpdateDeviceStatusClient.mockClear();
	});

	it('should call updateDeviceStatus client with correct request', async () => {
		expect.assertions(2);
		await rememberDevice(mockCtx);
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
		const endpointCtx = createMockAmplifyContext({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					userPoolEndpoint: expectedUserPoolEndpoint,
				},
			},
		});
		(endpointCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
		await rememberDevice(endpointCtx);

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
			await rememberDevice(mockCtx);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				UpdateDeviceStatusException.InvalidParameterException,
			);
		}
	});
});
