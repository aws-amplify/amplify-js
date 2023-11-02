// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { fetchDevices } from '../../../src/providers/cognito';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
import { ListDevicesException } from '../../../src/providers/cognito/types/errors';
jest.mock('@aws-amplify/core/dist/cjs/clients/handlers/fetch');

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	fetchAuthSession: jest.fn(),
	Amplify: {
		configure: jest.fn(),
		getConfig: jest.fn(() => ({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
				},
			},
		})),
	},
}));

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

const mockFetchAuthSession = fetchAuthSession as jest.Mock;

describe('fetchDevices API happy path cases', () => {
	beforeEach(() => {
		mockFetchAuthSession.mockImplementationOnce(
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
		mockFetchAuthSession.mockClear();
	});

	it('should fetch devices and parse client response correctly', async () => {
		const fetchDevicesClientSpy = jest
			.spyOn(clients, 'listDevices')
			.mockImplementationOnce(async () => {
				return {
					Devices: [clientResponseDevice],
					$metadata: {},
				};
			});

		expect(await fetchDevices()).toEqual([apiOutputDevice]);
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
		mockFetchAuthSession.mockImplementationOnce(
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
