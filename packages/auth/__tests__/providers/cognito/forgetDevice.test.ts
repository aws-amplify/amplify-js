// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { AuthError } from '../../../src/errors/AuthError';
import { DEVICE_METADATA_NOT_FOUND_EXCEPTION } from '../../../src/errors/constants';
import { forgetDevice } from '../../../src/providers/cognito';
import { ForgetDeviceException } from '../../../src/providers/cognito/types/errors';
import { forgetDevice as providerForgetDevice } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { tokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
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
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/tokenProvider');

describe('fetchMFAPreference', () => {
	const mockDeviceMetadata = {
		deviceKey: 'deviceKey',
		deviceGroupKey: 'deviceGroupKey',
		randomPassword: 'randomPassword',
	};
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockForgetDevice = providerForgetDevice as jest.Mock;
	const mockClearDeviceMetadata =
		tokenOrchestrator.clearDeviceMetadata as jest.Mock;
	const mockGetDeviceMetadata =
		tokenOrchestrator.getDeviceMetadata as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockForgetDevice.mockResolvedValue({ $metadata: {} });
		mockGetDeviceMetadata.mockResolvedValue(mockDeviceMetadata);
	});

	afterEach(() => {
		mockForgetDevice.mockReset();
		mockGetDeviceMetadata.mockReset();
		mockFetchAuthSession.mockClear();
		mockClearDeviceMetadata.mockClear();
	});

	it(`should forget 'external device' 'with' inputParams when tokenStore deviceMetadata 'present'`, async () => {
		expect.assertions(3);
		await forgetDevice({ device: { id: 'externalDeviceKey' } });
		expect(mockForgetDevice).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				DeviceKey: 'externalDeviceKey',
			}),
		);
		expect(mockForgetDevice).toHaveBeenCalledTimes(1);
		expect(mockClearDeviceMetadata).not.toHaveBeenCalled();
	});

	it(`should forget 'current device' 'with' inputParams when tokenStore deviceMetadata 'present'`, async () => {
		expect.assertions(3);
		await forgetDevice({ device: { id: mockDeviceMetadata.deviceKey } });
		expect(mockForgetDevice).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				DeviceKey: mockDeviceMetadata.deviceKey,
			}),
		);
		expect(mockForgetDevice).toHaveBeenCalledTimes(1);
		expect(mockClearDeviceMetadata).toHaveBeenCalled();
	});

	it(`should forget 'current device' 'without' inputParams when tokenStore deviceMetadata 'present'`, async () => {
		expect.assertions(3);
		await forgetDevice();
		expect(mockForgetDevice).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				DeviceKey: mockDeviceMetadata.deviceKey,
			}),
		);
		expect(mockForgetDevice).toHaveBeenCalledTimes(1);
		expect(mockClearDeviceMetadata).toHaveBeenCalled();
	});

	it(`should forget 'external device' 'with' inputParams when tokenStore deviceMetadata 'not present'`, async () => {
		mockGetDeviceMetadata.mockResolvedValue(null);
		await forgetDevice({ device: { id: 'externalDeviceKey' } });
		expect(mockForgetDevice).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				DeviceKey: 'externalDeviceKey',
			}),
		);
		expect(mockForgetDevice).toHaveBeenCalledTimes(1);
		expect(mockClearDeviceMetadata).not.toHaveBeenCalled();
	});

	it(`should forget 'current device' 'with' inputParams when tokenStore deviceMetadata 'not present'`, async () => {
		mockGetDeviceMetadata.mockResolvedValue(null);
		expect.assertions(3);
		await forgetDevice({ device: { id: mockDeviceMetadata.deviceKey } });
		expect(mockForgetDevice).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				DeviceKey: mockDeviceMetadata.deviceKey,
			}),
		);
		expect(mockForgetDevice).toHaveBeenCalledTimes(1);
		expect(mockClearDeviceMetadata).not.toHaveBeenCalled();
	});

	it(`should throw and error when forget 'current device' 'without' inputParams when tokenStore deviceMetadata 'not present'`, async () => {
		mockGetDeviceMetadata.mockResolvedValue(null);
		expect.assertions(2);
		try {
			await forgetDevice();
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(DEVICE_METADATA_NOT_FOUND_EXCEPTION);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		mockGetDeviceMetadata.mockResolvedValue(null);
		expect.assertions(2);
		mockForgetDevice.mockImplementation(() => {
			throw getMockError(ForgetDeviceException.InvalidParameterException);
		});
		try {
			await forgetDevice({ device: { id: mockDeviceMetadata.deviceKey } });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(ForgetDeviceException.InvalidParameterException);
		}
	});
});
