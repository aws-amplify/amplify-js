// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { DEVICE_METADATA_NOT_FOUND_EXCEPTION } from '../../../src/errors/constants';
import { forgetDevice } from '../../../src/providers/cognito';
import { ForgetDeviceException } from '../../../src/providers/cognito/types/errors';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import * as TokenProvider from '../../../src/providers/cognito/tokenProvider';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
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
const mockDeviceMetadata = {
	deviceKey: 'deviceKey',
	deviceGroupKey: 'deviceGroupKey',
	randomPassword: 'randomPassword',
};

const mockFetchAuthSession = fetchAuthSession as jest.Mock;

describe('forgetDevice API happy path cases', () => {
	let forgetDeviceStatusClientSpy;
	let getDeviceMetadataSpy;
	let clearDeviceMetadataSpy;
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
		forgetDeviceStatusClientSpy = jest
			.spyOn(clients, 'forgetDevice')
			.mockImplementationOnce(async () => {
				return {
					$metadata: {},
				};
			});
		getDeviceMetadataSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'getDeviceMetadata')
			.mockImplementationOnce(async () => mockDeviceMetadata);
		clearDeviceMetadataSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'clearDeviceMetadata')
			.mockImplementationOnce(async () => {});
	});

	afterEach(() => {
		mockFetchAuthSession.mockClear();
		forgetDeviceStatusClientSpy.mockClear();
		getDeviceMetadataSpy.mockClear();
		clearDeviceMetadataSpy.mockClear();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	it(`should forget 'external device' 'with' inputParams when tokenStore deviceMetadata 'present'`, async () => {
		expect.assertions(3);
		await forgetDevice({ device: { id: 'externalDeviceKey' } });
		expect(forgetDeviceStatusClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				DeviceKey: 'externalDeviceKey',
			})
		);
		expect(forgetDeviceStatusClientSpy).toBeCalledTimes(1);
		expect(clearDeviceMetadataSpy).not.toBeCalled();
	});

	it(`should forget 'current device' 'with' inputParams when tokenStore deviceMetadata 'present'`, async () => {
		expect.assertions(3);
		await forgetDevice({ device: { id: mockDeviceMetadata.deviceKey } });
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

	it(`should forget 'current device' 'without' inputParams when tokenStore deviceMetadata 'present'`, async () => {
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

	it(`should forget 'external device' 'with' inputParams when tokenStore deviceMetadata 'not present'`, async () => {
		getDeviceMetadataSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'getDeviceMetadata')
			.mockImplementationOnce(async () => null);
		await forgetDevice({ device: { id: 'externalDeviceKey' } });
		expect(forgetDeviceStatusClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				DeviceKey: 'externalDeviceKey',
			})
		);
		expect(forgetDeviceStatusClientSpy).toBeCalledTimes(1);
		expect(clearDeviceMetadataSpy).not.toBeCalled();
	});

	it(`should forget 'current device' 'with' inputParams when tokenStore deviceMetadata 'not present'`, async () => {
		getDeviceMetadataSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'getDeviceMetadata')
			.mockImplementationOnce(async () => null);
		expect.assertions(3);
		await forgetDevice({ device: { id: mockDeviceMetadata.deviceKey } });
		expect(forgetDeviceStatusClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				DeviceKey: mockDeviceMetadata.deviceKey,
			})
		);
		expect(forgetDeviceStatusClientSpy).toBeCalledTimes(1);
		expect(clearDeviceMetadataSpy).not.toBeCalled();
	});
});

describe('forgetDevice API error path cases', () => {
	let getDeviceMetadataSpy;
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
		getDeviceMetadataSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'getDeviceMetadata')
			.mockImplementationOnce(async () => null);
	});
	afterEach(() => {
		mockFetchAuthSession.mockClear();
		getDeviceMetadataSpy.mockClear();
	});

	it(`should raise deviceMatadata not found exception when forget 'current device' 'without' inputParams when tokenStore deviceMetadata 'not present'`, async () => {
		expect.assertions(2);
		try {
			await forgetDevice();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(DEVICE_METADATA_NOT_FOUND_EXCEPTION);
		}
	});

	it('should raise service error', async () => {
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(ForgetDeviceException.InvalidParameterException)
			)
		);
		try {
			await forgetDevice({ device: { id: mockDeviceMetadata.deviceKey } });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(ForgetDeviceException.InvalidParameterException);
		}
	});
});
