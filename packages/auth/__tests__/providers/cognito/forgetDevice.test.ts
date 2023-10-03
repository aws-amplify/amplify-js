// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../src/errors/AuthError';
import { forgetDevice } from '../../../src/providers/cognito';
import { ForgetDeviceException } from '../../../src/providers/cognito/types/errors';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import * as TokenProvider from '../../../src/providers/cognito/tokenProvider';
import { DeviceMetadata } from '../../../src/providers/cognito/tokenProvider/types';
import { Amplify } from 'aws-amplify';
import { decodeJWT, retry } from '@aws-amplify/core/internals/utils';
import * as authUtils from '../../../src';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
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
const mockDeviceMetadata: DeviceMetadata = {
	deviceKey: 'deviceKey',
	deviceGroupKey: 'deviceGroupKey',
	randomPassword: 'randomPassword',
};

describe('forgetDevice API happy path cases', () => {
	let fetchAuthSessionsSpy;
	let forgetDeviceStatusClientSpy;
	let getDeviceMetadataSpy;
	let clearDeviceMetadataSpy;
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
		forgetDeviceStatusClientSpy = jest
			.spyOn(clients, 'forgetDevice')
			.mockImplementationOnce(async () => {
				return {
					$metadata: {},
				};
			});
		getDeviceMetadataSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'getDeviceMetadata')
			.mockImplementation(async () => mockDeviceMetadata);
		clearDeviceMetadataSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'clearDeviceMetadata')
			.mockImplementation(async () => {});
	});

	afterEach(() => {
		fetchAuthSessionsSpy.mockClear();
		forgetDeviceStatusClientSpy.mockClear();
		getDeviceMetadataSpy.mockClear();
		clearDeviceMetadataSpy.mockClear();
	});

	it('should forget current device and clear it`s device tokens', async () => {
		expect.assertions(3);
		await forgetDevice();
		expect(forgetDeviceStatusClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				DeviceKey: mockDeviceMetadata.deviceKey,
			})
		);
		expect(forgetDeviceStatusClientSpy).toBeCalledTimes(1);
		expect(clearDeviceMetadataSpy).toBeCalled();
	});

	it('should forget external device', async () => {
		expect.assertions(3);
		await forgetDevice({
			device: {
				id: 'externalDeviceKey',
			},
		});
		expect(forgetDeviceStatusClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				DeviceKey: 'externalDeviceKey',
			})
		);
		expect(forgetDeviceStatusClientSpy).toBeCalledTimes(1);
		// don't clear current device's keys
		expect(clearDeviceMetadataSpy).toBeCalledTimes(0);
	});
});

describe('forgetDevice API error path cases', () => {
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
				buildMockErrorResponse(ForgetDeviceException.InvalidParameterException)
			)
		);
		try {
			await forgetDevice();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(ForgetDeviceException.InvalidParameterException);
		}
	});
});
