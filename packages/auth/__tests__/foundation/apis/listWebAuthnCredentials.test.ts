import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { createListWebAuthnCredentialsClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { ListWebAuthnCredentialsInput } from '../../../src';
import { mockUserCredentials } from '../../mockData';
import { mockAccessToken } from '../../providers/cognito/testUtils/data';
import { listWebAuthnCredentials } from '../../../src/foundation/apis';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
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
	const mockCtx = createMockAmplifyContext({
		Auth: {
			Cognito: {
				userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				identityPoolId: 'us-west-2:xxxxxx',
			},
		},
	});
	const mockListWebAuthnCredentials = jest.fn();
	const mockCreateListWebAuthnCredentialsClient = jest.mocked(
		createListWebAuthnCredentialsClient,
	);

	beforeAll(() => {
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});

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
		await listWebAuthnCredentials(mockCtx);

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
			mockCtx,
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
			mockCtx,
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
