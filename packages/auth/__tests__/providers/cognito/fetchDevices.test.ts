// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { AuthError } from '../../../src/errors/AuthError';
import { fetchDevices } from '../../../src/providers/cognito';
import { listDevices } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { ListDevicesException } from '../../../src/providers/cognito/types/errors';
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
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);

describe('fetchDevices', () => {
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
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockListDevices = listDevices as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockListDevices.mockResolvedValue({
			Devices: [clientResponseDevice],
			$metadata: {},
		});
	});

	afterEach(() => {
		mockListDevices.mockReset();
		mockFetchAuthSession.mockClear();
	});

	it('should fetch devices and parse client response correctly', async () => {
		expect(await fetchDevices()).toEqual([apiOutputDevice]);
		expect(mockListDevices).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				Limit: 60,
			})
		);
		expect(mockListDevices).toHaveBeenCalledTimes(1);
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockListDevices.mockImplementation(() => {
			throw getMockError(ListDevicesException.InvalidParameterException);
		});
		try {
			await fetchDevices();
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(ListDevicesException.InvalidParameterException);
		}
	});
});
