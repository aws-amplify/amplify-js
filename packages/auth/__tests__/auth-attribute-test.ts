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

const authOptions: AuthOptions = {
	userPoolId: 'us-west-2_0xxxxxxxx',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
};

describe('User-Attribute-validation', () => {
	it('Check-non-verified-attributes', async () => {
		const spyonAuthUserAttributes = jest
			.spyOn(Auth.prototype, 'userAttributes')
			.mockImplementation((user: CognitoUser) => {
				const emailAttribute = new CognitoUserAttribute({
					Name: 'email',
					Value: 'hello@amzn.com',
				});
				const emailVerified = new CognitoUserAttribute({
					Name: 'email_verified',
					Value: 'true',
				});
				const phoneAttribute = new CognitoUserAttribute({
					Name: 'phone_number',
					Value: '+12345678901',
				});
				const phoneVerified = new CognitoUserAttribute({
					Name: 'phone_number_verified',
					Value: 'false',
				});

				return new Promise(res => {
					res([emailAttribute, emailVerified, phoneAttribute, phoneVerified]);
				});
			});

		const auth = new Auth(authOptions);

		const verified = await auth.verifiedContact(
			new CognitoUser({
				Pool: new CognitoUserPool({
					ClientId: authOptions.userPoolWebClientId,
					UserPoolId: authOptions.userPoolId,
				}),
				Username: 'test',
			})
		);

		expect(spyonAuthUserAttributes).toBeCalled();

		expect(verified).toEqual({
			unverified: {
				phone_number: '+12345678901',
			},
			verified: {
				email: 'hello@amzn.com',
			},
		});
	});

	it('Checking not coerced values after sign in', async () => {
		const auth = new Auth(authOptions);

		const spyUserPoolCurrentUser = jest
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

		const spyUserGetSession = jest
			.spyOn(CognitoUser.prototype, 'getSession')
			.mockImplementation((callback: any) => {
				const session = new CognitoUserSession({
					AccessToken: new CognitoAccessToken({ AccessToken: 'accesstoken' }),
					IdToken: new CognitoIdToken({ IdToken: 'Idtoken' }),
				});
				callback(null, session);
			});

		const spyDecodePayload = jest
			.spyOn(CognitoAccessToken.prototype, 'decodePayload')
			.mockImplementation(() => {
				return { scope: 'aws.cognito.signin.user.admin' };
			});

		const spyGetUserData = jest
			.spyOn(CognitoUser.prototype, 'getUserData')
			.mockImplementation(callback => {
				const emailAttribute = {
					Name: 'email',
					Value: 'hello@amzn.com',
				};
				const emailVerified = {
					Name: 'email_verified',
					Value: 'true',
				};
				const phoneAttribute = {
					Name: 'phone_number',
					Value: '+12345678901',
				};
				const phoneVerified = {
					Name: 'phone_number_verified',
					Value: 'false',
				};

				const customAttribute1 = {
					Name: 'custom:attribute1',
					Value: 'false',
				};

				const customAttribute2 = {
					Name: 'custom:attribute2',
					Value: 'true',
				};

				callback(null, {
					Username: 'test',
					UserMFASettingList: ['SMS'],
					PreferredMfaSetting: 'SMS',
					UserAttributes: [
						emailAttribute,
						emailVerified,
						phoneAttribute,
						phoneVerified,
						customAttribute1,
						customAttribute2,
					],
					MFAOptions: [],
				});
			});

		const user = await auth.currentUserPoolUser();

		expect(spyDecodePayload).toBeCalled();
		expect(spyGetUserData).toBeCalled();
		expect(spyUserGetSession).toBeCalled();
		expect(spyUserPoolCurrentUser).toBeCalled();

		expect(user).toMatchObject({
			attributes: {
				email: 'hello@amzn.com',
				email_verified: true,
				phone_number: '+12345678901',
				phone_number_verified: false,
				'custom:attribute1': 'false',
				'custom:attribute2': 'true',
			},
		});
	});
});
