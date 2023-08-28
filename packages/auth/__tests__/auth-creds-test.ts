import { AuthClass as Auth } from '../src/Auth';
import { InternalAuthClass } from '../src/internals/InternalAuth';
import { Credentials } from '@aws-amplify/core';
import { AuthOptions } from '../src/types';
import {
	CognitoUser,
	CognitoUserSession,
	CognitoAccessToken,
	CognitoIdToken,
	CognitoUserPool,
} from 'amazon-cognito-identity-js';
import {
	InternalCognitoUser,
	InternalCognitoUserPool,
} from 'amazon-cognito-identity-js/internals';
const authOptions: AuthOptions = {
	userPoolId: 'us-west-2_0xxxxxxxx',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
};

describe('credentials syncing tests', () => {
	it('BypassCache clear credentials', async () => {
		const auth = new Auth(new InternalAuthClass(authOptions));

		jest
			.spyOn(InternalCognitoUser.prototype, 'authenticateUser')
			.mockImplementation((authenticationDetails, callback) => {
				const session = new CognitoUserSession({
					AccessToken: new CognitoAccessToken({ AccessToken: 'accesstoken' }),
					IdToken: new CognitoIdToken({ IdToken: 'Idtoken' }),
				});

				callback.onSuccess(session, false);
			});

		jest
			.spyOn(InternalCognitoUserPool.prototype, 'getCurrentUser')
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
			.spyOn(InternalCognitoUser.prototype, 'getSession')
			.mockImplementation((callback: any) => {
				callback(null, session);
			});

		const spyCredentials = jest
			.spyOn(Credentials, 'set')
			.mockImplementationOnce(c => c);

		const username = 'test';
		await auth.signIn({ username, password: 'test' });

		const clearCredentialsSpy = jest.spyOn(Credentials, 'clear');
		await auth.currentAuthenticatedUser({ bypassCache: true });

		expect(clearCredentialsSpy).toHaveBeenCalled();

		jest.clearAllMocks();
	});
});
