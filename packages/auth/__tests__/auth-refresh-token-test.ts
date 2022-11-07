import { AuthClass as Auth } from '../src/Auth';

import {
	CognitoUserPool,
	CognitoUser,
	CognitoUserSession,
	CognitoIdToken,
	CognitoAccessToken,
	CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

import { AuthOptions } from '../src/types';

const clientMetadata = {
	test: 'i need to be send for token refresh',
};

const authOptions: AuthOptions = {
	userPoolId: 'us-west-2_0xxxxxxxx',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
	clientMetadata,
};

describe('Refresh token', () => {
	it('currentUserPoolUser  user.getSession using ClientMetadata from config', async () => {
		// configure with client metadata
		const auth = new Auth(authOptions);

		expect.assertions(1);

		const getSessionSpy = jest
			.spyOn(CognitoUser.prototype, 'getSession')
			.mockImplementation(
				// @ts-ignore
				(
					callback: (error: Error, session: CognitoUserSession) => void,
					options: any
				) => {
					expect(options.clientMetadata).toEqual({
						...clientMetadata,
					});
					const session = new CognitoUserSession({
						AccessToken: new CognitoAccessToken({ AccessToken: 'accesstoken' }),
						IdToken: new CognitoIdToken({ IdToken: 'Idtoken' }),
					});
					callback(null, session);
				}
			);

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementation(() => {
				return new CognitoUser({
					Pool: new CognitoUserPool({
						ClientId: authOptions.userPoolWebClientId,
						UserPoolId: authOptions.userPoolId,
					}),
					Username: 'username',
				});
			});
		await auth.currentUserPoolUser();
	});

	it('userSession  user.getSession using ClientMetadata from config', async () => {
		// configure with client metadata
		const auth = new Auth(authOptions);

		expect.assertions(2);

		const getSessionSpy = jest
			.spyOn(CognitoUser.prototype, 'getSession')
			.mockImplementation(
				// @ts-ignore
				(
					callback: (error: Error, session: CognitoUserSession) => void,
					options: any
				) => {
					expect(options.clientMetadata).toEqual({
						...clientMetadata,
					});
					const session = new CognitoUserSession({
						AccessToken: new CognitoAccessToken({ AccessToken: 'accesstoken' }),
						IdToken: new CognitoIdToken({ IdToken: 'Idtoken' }),
					});
					callback(null, session);
				}
			);

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementation(() => {
				return new CognitoUser({
					Pool: new CognitoUserPool({
						ClientId: authOptions.userPoolWebClientId,
						UserPoolId: authOptions.userPoolId,
					}),
					Username: 'username',
				});
			});
		const user = await auth.currentUserPoolUser();

		await auth.userSession(user);
	});

	it('cognitoIdentitySignOut user.getSession using ClientMetadata from config', async () => {
		// configure with client metadata
		const auth = new Auth(authOptions);

		expect.assertions(2);

		jest.spyOn(CognitoUser.prototype, 'getSession').mockImplementation(
			// @ts-ignore
			(
				callback: (error: Error, session: CognitoUserSession) => void,
				options: any
			) => {
				expect(options.clientMetadata).toEqual({
					...clientMetadata,
				});
				const session = new CognitoUserSession({
					AccessToken: new CognitoAccessToken({ AccessToken: 'accesstoken' }),
					IdToken: new CognitoIdToken({ IdToken: 'Idtoken' }),
				});
				callback(null, session);
			}
		);

		jest
			.spyOn(CognitoUser.prototype, 'globalSignOut')
			.mockImplementation(({ onSuccess, onFailure }) => {
				onSuccess('');
			});

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementation(() => {
				return new CognitoUser({
					Pool: new CognitoUserPool({
						ClientId: authOptions.userPoolWebClientId,
						UserPoolId: authOptions.userPoolId,
					}),
					Username: 'username',
				});
			});
		const user = await auth.currentUserPoolUser();

		// @ts-ignore
		await auth.cognitoIdentitySignOut({ global: true }, user);
	});

	it('currentUserPoolUser user.getUserData using ClientMetadata from config', async () => {
		// configure with client metadata
		const auth = new Auth(authOptions);

		expect.assertions(1);

		jest.spyOn(CognitoUser.prototype, 'getSession').mockImplementation(
			// @ts-ignore
			(
				callback: (error: Error, session: CognitoUserSession) => void,
				options: any
			) => {
				const session = new CognitoUserSession({
					AccessToken: new CognitoAccessToken({
						AccessToken:
							'a.ewogICJzdWIiOiAic3ViIiwKICAiZXZlbnRfaWQiOiAieHh4eHgiLAogICJ0b2tlbl91c2UiOiAiYWNjZXNzIiwKICAic2NvcGUiOiAiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLAogICJhdXRoX3RpbWUiOiAxNjExNzc2ODA3LAogICJpc3MiOiAiaHR0cHM6Ly9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbS91cy1lYXN0LTFfenp6enp6enp6IiwKICAiZXhwIjogMTYxMTc4MDQwNywKICAiaWF0IjogMTYxMTc3NjgwNywKICAianRpIjogImFhYWFhIiwKICAiY2xpZW50X2lkIjogInh4eHh4eHh4IiwKICAidXNlcm5hbWUiOiAidXNlcm5hbWUiCn0.a',
					}),
					IdToken: new CognitoIdToken({ IdToken: 'Idtoken' }),
				});
				callback(null, session);
			}
		);

		jest
			.spyOn(CognitoUser.prototype, 'getUserData')
			.mockImplementation((callback, params) => {
				expect(params.clientMetadata).toEqual(clientMetadata);

				callback(null, {
					MFAOptions: [],
					PreferredMfaSetting: 'NOMFA',
					UserAttributes: [],
					UserMFASettingList: [],
					Username: 'username',
				});
			});

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementation(() => {
				return new CognitoUser({
					Pool: new CognitoUserPool({
						ClientId: authOptions.userPoolWebClientId,
						UserPoolId: authOptions.userPoolId,
					}),
					Username: 'username',
				});
			});

		const user = await auth.currentUserPoolUser();
	});

	it('getPreferredMFA user.getUserData using ClientMetadata from config', async () => {
		// configure with client metadata
		const auth = new Auth(authOptions);

		expect.assertions(2);

		jest.spyOn(CognitoUser.prototype, 'getSession').mockImplementation(
			// @ts-ignore
			(
				callback: (error: Error, session: CognitoUserSession) => void,
				options: any
			) => {
				const session = new CognitoUserSession({
					AccessToken: new CognitoAccessToken({
						AccessToken:
							'a.ewogICJzdWIiOiAic3ViIiwKICAiZXZlbnRfaWQiOiAieHh4eHgiLAogICJ0b2tlbl91c2UiOiAiYWNjZXNzIiwKICAic2NvcGUiOiAiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLAogICJhdXRoX3RpbWUiOiAxNjExNzc2ODA3LAogICJpc3MiOiAiaHR0cHM6Ly9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbS91cy1lYXN0LTFfenp6enp6enp6IiwKICAiZXhwIjogMTYxMTc4MDQwNywKICAiaWF0IjogMTYxMTc3NjgwNywKICAianRpIjogImFhYWFhIiwKICAiY2xpZW50X2lkIjogInh4eHh4eHh4IiwKICAidXNlcm5hbWUiOiAidXNlcm5hbWUiCn0.a',
					}),
					IdToken: new CognitoIdToken({ IdToken: 'Idtoken' }),
				});
				callback(null, session);
			}
		);

		jest
			.spyOn(CognitoUser.prototype, 'getUserData')
			.mockImplementation((callback, params) => {
				expect(params.clientMetadata).toEqual(clientMetadata);

				callback(null, {
					MFAOptions: [],
					PreferredMfaSetting: 'NOMFA',
					UserAttributes: [],
					UserMFASettingList: [],
					Username: 'username',
				});
			});

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementation(() => {
				return new CognitoUser({
					Pool: new CognitoUserPool({
						ClientId: authOptions.userPoolWebClientId,
						UserPoolId: authOptions.userPoolId,
					}),
					Username: 'username',
				});
			});

		const user = await auth.currentUserPoolUser();

		await auth.getPreferredMFA(user);
	});

	it('setPreferredMFA user.getUserData using ClientMetadata from config', async () => {
		// configure with client metadata
		const auth = new Auth(authOptions);

		expect.assertions(3);

		jest.spyOn(CognitoUser.prototype, 'getSession').mockImplementation(
			// @ts-ignore
			(
				callback: (error: Error, session: CognitoUserSession) => void,
				options: any
			) => {
				const session = new CognitoUserSession({
					AccessToken: new CognitoAccessToken({
						AccessToken:
							'a.ewogICJzdWIiOiAic3ViIiwKICAiZXZlbnRfaWQiOiAieHh4eHgiLAogICJ0b2tlbl91c2UiOiAiYWNjZXNzIiwKICAic2NvcGUiOiAiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLAogICJhdXRoX3RpbWUiOiAxNjExNzc2ODA3LAogICJpc3MiOiAiaHR0cHM6Ly9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbS91cy1lYXN0LTFfenp6enp6enp6IiwKICAiZXhwIjogMTYxMTc4MDQwNywKICAiaWF0IjogMTYxMTc3NjgwNywKICAianRpIjogImFhYWFhIiwKICAiY2xpZW50X2lkIjogInh4eHh4eHh4IiwKICAidXNlcm5hbWUiOiAidXNlcm5hbWUiCn0.a',
					}),
					IdToken: new CognitoIdToken({ IdToken: 'Idtoken' }),
				});
				callback(null, session);
			}
		);

		jest
			.spyOn(CognitoUser.prototype, 'getUserData')
			.mockImplementation((callback, params) => {
				expect(params.clientMetadata).toEqual(clientMetadata);

				callback(null, {
					MFAOptions: [],
					PreferredMfaSetting: 'NOMFA',
					UserAttributes: [],
					UserMFASettingList: [],
					Username: 'username',
				});
			});

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementation(() => {
				return new CognitoUser({
					Pool: new CognitoUserPool({
						ClientId: authOptions.userPoolWebClientId,
						UserPoolId: authOptions.userPoolId,
					}),
					Username: 'username',
				});
			});

		jest
			.spyOn(CognitoUser.prototype, 'setUserMfaPreference')
			.mockImplementation(
				(smsMfaSettings, softwareTokenMfaSettings, callback) => {
					callback();
				}
			);

		const user = await auth.currentUserPoolUser();

		await auth.setPreferredMFA(user, 'SMS');
	});
});
