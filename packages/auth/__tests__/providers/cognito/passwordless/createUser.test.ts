// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../../src/errors/AuthError';
import { createUser } from '../../../../src/providers/cognito/apis/passwordless/createUser';
import { unauthenticatedHandler } from '@aws-amplify/core/internals/aws-client-utils';

jest.mock('@aws-amplify/core/internals/aws-client-utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/aws-client-utils'),
	unauthenticatedHandler: jest.fn(),
}));

const mockUnauthenticatedHandler = unauthenticatedHandler as jest.Mock;
const mockResponsePayloadJsonParser = jest.fn();
const url = new URL('https://example.com');
const userPoolId = 'us-west-2_zzzzz';
const username = 'username';
const email = 'email';
const phoneNumber = 'phone_number';

describe('createUser', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUnauthenticatedHandler.mockResolvedValue({
			statusCode: 200,
			headers: {},
			body: {
				json: mockResponsePayloadJsonParser,
			},
		});
		mockResponsePayloadJsonParser.mockResolvedValue({});
	});

	it('should call unauthenticated handler with email', async () => {
		const input = {
			username,
			passwordless: {
				deliveryMedium: 'EMAIL' as const,
				method: 'MAGIC_LINK' as const,
			},
			options: {
				userAttributes: {
					email,
				},
			},
		};
		await createUser(url, userPoolId, input);
		expect(unauthenticatedHandler).toHaveBeenCalledTimes(1);
		expect(unauthenticatedHandler).toHaveBeenCalledWith(
			{
				body: JSON.stringify({
					email,
					username,
					userPoolId,
				}),
				headers: {
					'content-type': 'application/json; charset=UTF-8',
				},
				method: 'PUT',
				url,
			},
			expect.objectContaining({
				region: 'us-west-2',
				withCrossDomainCredentials: false,
			})
		);
	});

	it('should call unauthenticated handler with SMS', async () => {
		const input = {
			username,
			passwordless: {
				deliveryMedium: 'SMS' as const,
				method: 'OTP' as const,
			},
			options: {
				userAttributes: {
					phone_number: phoneNumber,
				},
			},
		};
		await createUser(url, userPoolId, input);
		expect(unauthenticatedHandler).toHaveBeenCalledTimes(1);
		expect(unauthenticatedHandler).toHaveBeenCalledWith(
			{
				body: JSON.stringify({
					phoneNumber,
					username,
					userPoolId,
				}),
				headers: {
					'content-type': 'application/json; charset=UTF-8',
				},
				method: 'PUT',
				url,
			},
			expect.objectContaining({
				region: 'us-west-2',
				withCrossDomainCredentials: false,
			})
		);
	});

	it('should throw error from API Gateway service', async () => {
		expect.assertions(2);
		mockResponsePayloadJsonParser.mockReset();
		mockResponsePayloadJsonParser.mockResolvedValue({
			message: 'Signature is invalid',
		});
		mockUnauthenticatedHandler.mockReset();
		mockUnauthenticatedHandler.mockResolvedValue({
			statusCode: 400,
			headers: {
				'x-amzn-errortype': 'InvalidSignatureException',
			},
			body: {
				json: mockResponsePayloadJsonParser,
			},
		});
		try {
			await createUser(url, userPoolId, {} as any);
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect((error as AuthError).message).toEqual('Signature is invalid');
		}
	});

	it('should throw error from create user service', async () => {
		expect.assertions(2);
		mockResponsePayloadJsonParser.mockReset();
		mockResponsePayloadJsonParser.mockResolvedValue({
			message: 'User already exists',
		});
		mockUnauthenticatedHandler.mockReset();
		mockUnauthenticatedHandler.mockResolvedValue({
			statusCode: 400,
			headers: {},
			body: {
				json: mockResponsePayloadJsonParser,
			},
		});
		try {
			await createUser(url, userPoolId, {} as any);
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect((error as AuthError).message).toEqual('User already exists');
		}
	});
});
