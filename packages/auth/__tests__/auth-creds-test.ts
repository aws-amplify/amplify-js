import { AuthClass as Auth } from '../src/Auth';
import { Credentials } from '@aws-amplify/core';
import { AuthOptions } from '../src/types';
import {
	CognitoUser,
	CognitoUserPool,
	CognitoUserSession,
	CognitoAccessToken,
	CognitoIdToken,
} from 'amazon-cognito-identity-js';
const authOptions: AuthOptions = {
	userPoolId: 'us-west-2_0xxxxxxxx',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
};

describe('credentials syncing tests', () => {
	it('BypassCache clear credentials', async () => {
		const auth = new Auth(authOptions);

		jest
			.spyOn(CognitoUser.prototype, 'authenticateUser')
			.mockImplementation((authenticationDetails, callback) => {
				const session = new CognitoUserSession({
					AccessToken: new CognitoAccessToken({ AccessToken: 'accesstoken' }),
					IdToken: new CognitoIdToken({ IdToken: 'Idtoken' }),
				});

				callback.onSuccess(session, false);
			});

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementation(() => {
				return new CognitoUser({
					Pool: new CognitoUserPool({
						UserPoolId: authOptions.userPoolId,
						ClientId: authOptions.userPoolWebClientId,
					}),
					Username: 'test',
				});
			});

		const session = new CognitoUserSession({
			AccessToken: new CognitoAccessToken({ AccessToken: 'accesstoken' }),
			IdToken: new CognitoIdToken({ IdToken: 'Idtoken' }),
		});

		jest
			.spyOn(CognitoUser.prototype, 'getSession')
			.mockImplementation((callback: any) => {
				callback(null, session);
			});

		const spyCredentials = jest
			.spyOn(Credentials, 'set')
			.mockImplementationOnce((c) => c);

		const username = 'test';
		await auth.signIn({ username, password: 'test' });

		const clearCredentialsSpy = jest.spyOn(Credentials, 'clear');
		await auth.currentAuthenticatedUser({ bypassCache: true });

		expect(clearCredentialsSpy).toHaveBeenCalled();

		jest.clearAllMocks();
	});
});
