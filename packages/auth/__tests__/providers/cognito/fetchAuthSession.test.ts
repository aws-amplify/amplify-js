import { Amplify } from '@aws-amplify/core';
import { fetchAuthSession } from '@aws-amplify/core';
import {
	CognitoAWSCredentialsAndIdentityIdProvider,
	cognitoUserPoolsTokenProvider,
	cognitoCredentialsProvider,
} from '../../../src/providers/cognito';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

describe('fetchAuthSession behavior for IdentityPools only', () => {
	let credentialsProviderSpy;
	afterEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});
	beforeEach(() => {
		credentialsProviderSpy = jest
			.spyOn(
				CognitoAWSCredentialsAndIdentityIdProvider.prototype,
				'getCredentialsAndIdentityId'
			)
			.mockImplementation(async () => {
				return {
					credentials: {
						accessKeyId: 'accessKeyIdValue',
						secretAccessKey: 'secretAccessKeyValue',
						expiration: new Date(123),
						sessionToken: 'sessionTokenvalue',
					},
				};
			});
	});
	test('Configure identityPools only, shouldnt fail for Token Provider', async () => {
		Amplify.configure(
			{
				Auth: {
					Cognito: {
						identityPoolId: 'abcd',
						allowGuestAccess: true,
					},
				},
			},
			{
				Auth: {
					credentialsProvider: cognitoCredentialsProvider,
					tokenProvider: cognitoUserPoolsTokenProvider,
				},
			}
		);

		const session = await fetchAuthSession();
		expect(session).toEqual({
			credentials: {
				accessKeyId: 'accessKeyIdValue',
				expiration: new Date(123),
				secretAccessKey: 'secretAccessKeyValue',
				sessionToken: 'sessionTokenvalue',
			},
			identityId: undefined,
			tokens: undefined,
			userSub: undefined,
		});

		expect(credentialsProviderSpy).toBeCalledWith({
			authConfig: {
				Cognito: {
					allowGuestAccess: true,
					identityPoolId: 'abcd',
				},
			},
			authenticated: false,
			forceRefresh: undefined,
		});
	});
});

describe.only('fetchAuthSession behavior for UserPools only', () => {
	let tokenProviderSpy;
	beforeEach(() => {
		tokenProviderSpy = jest
			.spyOn(cognitoUserPoolsTokenProvider, 'getTokens')
			.mockImplementation(async () => {
				return {
					accessToken: decodeJWT(
						'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y'
					),
					idToken: decodeJWT(
						'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y'
					),
				};
			});
	});

	test('Cognito Cognito User Pool only, shouldnt Credentials Provider', async () => {
		Amplify.configure(
			{
				Auth: {
					Cognito: {
						userPoolClientId: 'userPoolCliendIdValue',
						userPoolId: 'userpoolIdvalue',
					},
				},
			},
			{
				Auth: {
					credentialsProvider: cognitoCredentialsProvider,
					tokenProvider: cognitoUserPoolsTokenProvider,
				},
			}
		);

		const session = await fetchAuthSession();

		expect(session).toEqual({
			credentials: undefined,
			identityId: undefined,
			tokens: {
				accessToken: {
					payload: {
						exp: 1710293130,
						iat: 1516239022,
						name: 'John Doe',
						sub: '1234567890',
					},
					toString: expect.anything(),
				},
				idToken: {
					payload: {
						exp: 1710293130,
						iat: 1516239022,
						name: 'John Doe',
						sub: '1234567890',
					},
					toString: expect.anything(),
				},
			},
			userSub: '1234567890',
		});
	});
});
