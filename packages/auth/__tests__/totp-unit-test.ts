jest.mock('amazon-cognito-identity-js/lib/CognitoUserSession', () => {
	const CognitoUserSession = () => {};

	CognitoUserSession.prototype.CognitoUserSession = options => {
		CognitoUserSession.prototype.options = options;
		return CognitoUserSession;
	};

	CognitoUserSession.prototype.getIdToken = () => {
		return {
			getJwtToken: () => {
				return null;
			},
		};
	};

	return CognitoUserSession;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoIdToken', () => {
	const CognitoIdToken = () => {};

	CognitoIdToken.prototype.CognitoIdToken = value => {
		CognitoIdToken.prototype.idToken = value;
		return CognitoIdToken;
	};

	CognitoIdToken.prototype.getJwtToken = () => {
		return 'jwtToken';
	};

	return CognitoIdToken;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoUserPool', () => {
	const CognitoUserPool = () => {};

	CognitoUserPool.prototype.CognitoUserPool = options => {
		CognitoUserPool.prototype.options = options;
		return CognitoUserPool;
	};

	CognitoUserPool.prototype.getCurrentUser = () => {
		return 'currentUser';
	};

	CognitoUserPool.prototype.signUp = (
		username,
		password,
		signUpAttributeList,
		validationData,
		callback
	) => {
		callback(null, 'signUpResult');
	};

	return CognitoUserPool;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoUser', () => {
	const CognitoUser = () => {};

	CognitoUser.prototype.CognitoUser = options => {
		CognitoUser.prototype.options = options;
		return CognitoUser;
	};

	CognitoUser.prototype.getSession = callback => {
		// throw 3;
		callback(null, 'session');
	};

	CognitoUser.prototype.getUserAttributes = callback => {
		callback(null, 'attributes');
	};

	CognitoUser.prototype.getAttributeVerificationCode = (attr, callback) => {
		callback.onSuccess('success');
	};

	CognitoUser.prototype.verifyAttribute = (attr, code, callback) => {
		callback.onSuccess('success');
	};

	CognitoUser.prototype.authenticateUser = (
		authenticationDetails,
		callback
	) => {
		callback.onSuccess('session');
	};

	CognitoUser.prototype.sendMFACode = (code, callback) => {
		callback.onSuccess('session');
	};

	CognitoUser.prototype.resendConfirmationCode = callback => {
		callback(null, 'result');
	};

	CognitoUser.prototype.changePassword = (
		oldPassword,
		newPassword,
		callback
	) => {
		callback(null, 'SUCCESS');
	};

	CognitoUser.prototype.forgotPassword = callback => {
		callback.onSuccess();
	};

	CognitoUser.prototype.confirmPassword = (code, password, callback) => {
		callback.onSuccess();
	};

	CognitoUser.prototype.signOut = () => {};

	CognitoUser.prototype.confirmRegistration = (
		confirmationCode,
		forceAliasCreation,
		callback
	) => {
		callback(null, 'Success');
	};

	CognitoUser.prototype.completeNewPasswordChallenge = (
		password,
		requiredAttributes,
		callback
	) => {
		callback.onSuccess('session');
	};

	CognitoUser.prototype.updateAttributes = (attributeList, callback) => {
		callback(null, 'SUCCESS');
	};

	CognitoUser.prototype.getMFAOptions = callback => {
		callback(null, 'mfaOptions');
	};

	CognitoUser.prototype.disableMFA = callback => {
		callback(null, 'Success');
	};

	CognitoUser.prototype.enableMFA = callback => {
		callback(null, 'Success');
	};

	CognitoUser.prototype.associateSoftwareToken = callback => {
		callback.associateSecretCode('secretCode');
	};

	CognitoUser.prototype.verifySoftwareToken = (
		challengeAnswer,
		device,
		callback
	) => {
		callback.onSuccess('Success');
	};

	CognitoUser.prototype.setUserMfaPreference = (
		smsMfaSettings,
		totpMfaSettings,
		callback
	) => {
		callback(null, 'Success');
	};

	CognitoUser.prototype.getUserData = callback => {
		callback(null, {
			PreferredMfaSetting: 'SMS_MFA',
		});
	};

	CognitoUser.prototype.getUsername = () => {
		return 'testUsername';
	};

	return CognitoUser;
});

import { AuthOptions, SignUpParams } from '../src/types';
import { AuthClass as Auth } from '../src/Auth';
import Cache from '@aws-amplify/cache';
import {
	CognitoUserPool,
	CognitoUser,
	CognitoUserSession,
	CognitoIdToken,
	CognitoAccessToken,
} from 'amazon-cognito-identity-js';

const authOptions: any = {
	Auth: {
		userPoolId: 'awsUserPoolsId',
		userPoolWebClientId: 'awsUserPoolsWebClientId',
		region: 'region',
		identityPoolId: 'awsCognitoIdentityPoolId',
	},
};

const authOptionsWithNoUserPoolId = {
	Auth: {
		userPoolId: null,
		userPoolWebClientId: 'awsUserPoolsWebClientId',
		region: 'region',
		identityPoolId: 'awsCognitoIdentityPoolId',
	},
};

const userPool = new CognitoUserPool({
	UserPoolId: authOptions.Auth.userPoolId,
	ClientId: authOptions.Auth.userPoolWebClientId,
});

const idToken = new CognitoIdToken({ IdToken: 'idToken' });
const accessToken = new CognitoAccessToken({ AccessToken: 'accessToken' });

const session = new CognitoUserSession({
	IdToken: idToken,
	AccessToken: accessToken,
});

const user = new CognitoUser({
	Username: 'username',
	Pool: userPool,
});

describe('auth unit test', () => {
	describe('getMFAOptions test', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest.spyOn(CognitoUser.prototype, 'getMFAOptions');
			expect(await auth.getMFAOptions(user)).toBe('mfaOptions');
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('err case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest
				.spyOn(CognitoUser.prototype, 'getMFAOptions')
				.mockImplementationOnce(callback => {
					callback(new Error('err'), null);
				});
			try {
				await auth.getMFAOptions(user);
			} catch (e) {
				expect(e).toEqual(new Error('err'));
			}
			expect(spyon).toBeCalled();
			spyon.mockClear();
		});
	});

	describe('disableMFA test', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest.spyOn(CognitoUser.prototype, 'disableMFA');
			expect(await auth.disableSMS(user)).toBe('Success');
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('err case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest
				.spyOn(CognitoUser.prototype, 'disableMFA')
				.mockImplementationOnce(callback => {
					callback(new Error('err'), null);
				});
			try {
				await auth.disableSMS(user);
			} catch (e) {
				expect(e).toEqual(new Error('err'));
			}
			expect(spyon).toBeCalled();
			spyon.mockClear();
		});
	});

	describe('enableMFA test', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest.spyOn(CognitoUser.prototype, 'enableMFA');
			expect(await auth.enableSMS(user)).toBe('Success');
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('err case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest
				.spyOn(CognitoUser.prototype, 'enableMFA')
				.mockImplementationOnce(callback => {
					callback(new Error('err'), null);
				});
			try {
				await auth.enableSMS(user);
			} catch (e) {
				expect(e).toEqual(new Error('err'));
			}
			expect(spyon).toBeCalled();
			spyon.mockClear();
		});
	});

	describe('setupTOTP test', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest.spyOn(CognitoUser.prototype, 'associateSoftwareToken');
			expect(await auth.setupTOTP(user)).toBe('secretCode');
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('err case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest
				.spyOn(CognitoUser.prototype, 'associateSoftwareToken')
				.mockImplementationOnce(callback => {
					callback.onFailure('err');
				});
			try {
				await auth.setupTOTP(user);
			} catch (e) {
				expect(e).toBe('err');
			}
			expect(spyon).toBeCalled();
			spyon.mockClear();
		});
	});

	describe('verifyTotpToken test', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest.spyOn(CognitoUser.prototype, 'verifySoftwareToken');
			const spyon2 = jest.spyOn(CognitoUser.prototype, 'getUsername');

			expect(await auth.verifyTotpToken(user, 'challengeAnswer')).toBe(
				'Success'
			);

			expect(spyon).toBeCalled();
			expect(spyon2).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('err case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest
				.spyOn(CognitoUser.prototype, 'verifySoftwareToken')
				.mockImplementationOnce((challengeAnswer, device, callback) => {
					callback.onFailure(new Error('err'));
				});
			try {
				await auth.verifyTotpToken(user, 'challengeAnswer');
			} catch (e) {
				expect(e).toEqual(new Error('err'));
			}
			expect(spyon).toBeCalled();
			spyon.mockClear();
		});
	});

	describe('setPreferredMFA test', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest.spyOn(CognitoUser.prototype, 'setUserMfaPreference');
			const spyon2 = jest
				.spyOn(Auth.prototype, 'getPreferredMFA')
				.mockImplementationOnce(() => {
					return Promise.resolve('SMS_MFA');
				});
			expect(await auth.setPreferredMFA(user, 'TOTP')).toBe('Success');
			expect(spyon).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});

		('User has not verified software token mfa');

		test('totp not setup but TOTP chosed', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest
				.spyOn(CognitoUser.prototype, 'setUserMfaPreference')
				.mockImplementationOnce((smsMfaSettings, totpMfaSettings, callback) => {
					const err = {
						message: 'User has not verified software token mfa',
					};
					callback(new Error('err'), null);
				});
			const spyon2 = jest
				.spyOn(Auth.prototype, 'getPreferredMFA')
				.mockImplementationOnce(() => {
					return Promise.resolve('SMS_MFA');
				});

			try {
				await auth.setPreferredMFA(user, 'TOTP');
			} catch (e) {
				expect(e).not.toBeNull();
			}
			expect(spyon).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('incorrect mfa type', async () => {
			const auth = new Auth(authOptions);
			try {
				// using <any> to allow us to pass an incorrect value
				await auth.setPreferredMFA(user, 'incorrect mfa type' as any);
			} catch (e) {
				expect(e).not.toBeNull();
			}
		});
	});

	describe('getPreferredMFA test', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);

			expect(await auth.getPreferredMFA(user)).toBe('SMS_MFA');
		});

		test('error case', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest
				.spyOn(CognitoUser.prototype, 'getUserData')
				.mockImplementationOnce(callback => {
					callback(new Error('err'), null);
				});
			try {
				await auth.getPreferredMFA(user);
			} catch (e) {
				expect(e).toBe(new Error('err'));
			}
		});
	});
});
