import { Amplify } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { createListWebAuthnCredentialsClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { ListWebAuthnCredentialsInput } from '../../../src';
import { mockUserCredentials } from '../../mockData';
import { setUpGetConfig } from '../../providers/cognito/testUtils/setUpGetConfig';
import { mockAccessToken } from '../../providers/cognito/testUtils/data';
import { listWebAuthnCredentials } from '../../../src/foundation/apis';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: {
		getConfig: jest.fn(),
		Auth: {
			fetchAuthSession: jest.fn(() => ({
				tokens: { accessToken: decodeJWT(mockAccessToken) },
			})),
		},
	},
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

describe('listWebAuthnCredentials', () => {
	const mockListWebAuthnCredentials = jest.fn();
	const mockCreateListWebAuthnCredentialsClient = jest.mocked(
		createListWebAuthnCredentialsClient,
	);

	beforeAll(() => {
		setUpGetConfig(Amplify);

		mockCreateListWebAuthnCredentialsClient.mockReturnValue(
			mockListWebAuthnCredentials,
		);

		mockListWebAuthnCredentials.mockImplementation((in1, in2) => {
			return Promise.resolve({
				Credentials: mockUserCredentials.slice(0, in2.MaxResults),
				NextToken:
					in2.MaxResults < mockUserCredentials.length
						? 'dummyNextToken'
						: undefined,
			});
		});
	});

	it('should pass correct service options when listing credentials', async () => {
		await listWebAuthnCredentials(Amplify);

		expect(mockListWebAuthnCredentials).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
			},
		);
	});

	it('should pass correct service options and output correctly with input', async () => {
		const input: ListWebAuthnCredentialsInput = {
			pageSize: 3,
		};

		const { credentials, nextToken } = await listWebAuthnCredentials(
			Amplify,
			input,
		);

		expect(mockListWebAuthnCredentials).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
				MaxResults: 3,
			},
		);

		expect(credentials.length).toEqual(2);
		expect(credentials).toMatchObject([
			{
				credentialId: '12345',
				friendlyCredentialName: 'mycred',
				relyingPartyId: '11111',
				authenticatorAttachment: 'platform',
				authenticatorTransports: ['usb', 'nfc'],
				createdAt: new Date('2024-02-29T01:23:45.000Z'),
			},
			{
				credentialId: '22345',
				friendlyCredentialName: 'mycred2',
				relyingPartyId: '11111',
				authenticatorAttachment: 'platform',
				authenticatorTransports: ['usb', 'nfc'],
				createdAt: new Date('2020-02-29T01:23:45.000Z'),
			},
		]);

		expect(nextToken).toBe(undefined);
	});

	it('should pass correct service options and output correctly with input that requires nextToken', async () => {
		const input: ListWebAuthnCredentialsInput = {
			pageSize: 1,
			nextToken: 'exampleToken',
		};

		const { credentials, nextToken } = await listWebAuthnCredentials(
			Amplify,
			input,
		);

		expect(mockListWebAuthnCredentials).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
				MaxResults: 1,
				NextToken: 'exampleToken',
			},
		);

		expect(credentials.length).toEqual(1);
		expect(credentials).toMatchObject([
			{
				credentialId: '12345',
				friendlyCredentialName: 'mycred',
				relyingPartyId: '11111',
				authenticatorAttachment: 'platform',
				authenticatorTransports: ['usb', 'nfc'],
				createdAt: new Date('2024-02-29T01:23:45.000Z'),
			},
		]);

		expect(nextToken).toBe('dummyNextToken');
	});
});
