// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { rememberDevice } from '../../../src/providers/cognito';
import { UpdateDeviceStatusException } from '../../../src/providers/cognito/types/errors';
import { updateDeviceStatus } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { tokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import { DeviceMetadata } from '../../../src/providers/cognito/tokenProvider/types';
import { getMockError, mockAccessToken } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);
jest.mock('../../../src/providers/cognito/tokenProvider');

describe('rememberDevice', () => {
	const mockDeviceMetadata: DeviceMetadata = {
		deviceKey: 'deviceKey',
		deviceGroupKey: 'deviceGroupKey',
		randomPassword: 'randomPassword',
	};
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockUpdateDeviceStatus = updateDeviceStatus as jest.Mock;
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
	});

	afterEach(() => {
		mockGetDeviceMetadata.mockReset();
		mockUpdateDeviceStatus.mockReset();
		mockFetchAuthSession.mockClear();
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
			})
		);
		expect(mockUpdateDeviceStatus).toHaveBeenCalledTimes(1);
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
				UpdateDeviceStatusException.InvalidParameterException
			);
		}
	});
});
