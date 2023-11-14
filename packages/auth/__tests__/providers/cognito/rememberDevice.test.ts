// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { rememberDevice } from '../../../src/providers/cognito';
import { UpdateDeviceStatusException } from '../../../src/providers/cognito/types/errors';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import * as TokenProvider from '../../../src/providers/cognito/tokenProvider';
import { DeviceMetadata } from '../../../src/providers/cognito/tokenProvider/types';
import { decodeJWT, retry } from '@aws-amplify/core/internals/utils';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
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
const mockDeviceMetadata: DeviceMetadata = {
	deviceKey: 'deviceKey',
	deviceGroupKey: 'deviceGroupKey',
	randomPassword: 'randomPassword',
};

const mockFetchAuthSession = fetchAuthSession as jest.Mock;

describe('rememberDevice API happy path cases', () => {
	let updateDeviceStatusClientSpy;
	let tokenOrchestratorSpy;
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
		updateDeviceStatusClientSpy = jest
			.spyOn(clients, 'updateDeviceStatus')
			.mockImplementationOnce(async () => {
				return {
					$metadata: {},
				};
			});
		tokenOrchestratorSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'getDeviceMetadata')
			.mockImplementation(async () => mockDeviceMetadata);
	});

	afterEach(() => {
		mockFetchAuthSession.mockClear();
		updateDeviceStatusClientSpy.mockClear();
	});

	it('should call updateDeviceStatus client with correct request', async () => {
		expect.assertions(2);
		await rememberDevice();
		expect(updateDeviceStatusClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				DeviceKey: mockDeviceMetadata.deviceKey,
				DeviceRememberedStatus: 'remembered',
			})
		);
		expect(updateDeviceStatusClientSpy).toBeCalledTimes(1);
	});
});

describe('rememberDevice API error path cases', () => {
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
				buildMockErrorResponse(
					UpdateDeviceStatusException.InvalidParameterException
				)
			)
		);
		try {
			await rememberDevice();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				UpdateDeviceStatusException.InvalidParameterException
			);
		}
	});
});
