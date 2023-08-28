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

	CognitoUserSession.prototype.isValid = () => true;

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

jest.mock('amazon-cognito-identity-js/internals', () => {
	const InternalCognitoUserPool = () => {};

	InternalCognitoUserPool.prototype.InternalCognitoUserPool = options => {
		InternalCognitoUserPool.prototype.options = options;
		return InternalCognitoUserPool;
	};

	InternalCognitoUserPool.prototype.getCurrentUser = () => {
		return 'currentUser';
	};

	InternalCognitoUserPool.prototype.signUp = (
		username,
		password,
		signUpAttributeList,
		validationData,
		callback
	) => {
		callback(null, 'signUpResult');
	};

	const InternalCognitoUser = () => {};

	InternalCognitoUser.prototype.InternalCognitoUser = options => {
		InternalCognitoUser.prototype.options = options;
		return InternalCognitoUser;
	};

	InternalCognitoUser.prototype.getSession = callback => {
		// throw 3;
		callback(null, 'session');
	};

	InternalCognitoUser.prototype.getUserAttributes = callback => {
		callback(null, 'attributes');
	};

	InternalCognitoUser.prototype.getAttributeVerificationCode = (
		attr,
		callback
	) => {
		callback.onSuccess('success');
	};

	InternalCognitoUser.prototype.verifyAttribute = (attr, code, callback) => {
		callback.onSuccess('success');
	};

	InternalCognitoUser.prototype.authenticateUser = (
		authenticationDetails,
		callback
	) => {
		callback.onSuccess('session');
	};

	InternalCognitoUser.prototype.sendMFACode = (code, callback) => {
		callback.onSuccess('session');
	};

	InternalCognitoUser.prototype.resendConfirmationCode = callback => {
		callback(null, 'result');
	};

	InternalCognitoUser.prototype.changePassword = (
		oldPassword,
		newPassword,
		callback
	) => {
		callback(null, 'SUCCESS');
	};

	InternalCognitoUser.prototype.forgotPassword = callback => {
		callback.onSuccess();
	};

	InternalCognitoUser.prototype.confirmPassword = (
		code,
		password,
		callback
	) => {
		callback.onSuccess();
	};

	InternalCognitoUser.prototype.signOut = () => {};

	InternalCognitoUser.prototype.confirmRegistration = (
		confirmationCode,
		forceAliasCreation,
		callback
	) => {
		callback(null, 'Success');
	};

	InternalCognitoUser.prototype.completeNewPasswordChallenge = (
		password,
		requiredAttributes,
		callback
	) => {
		callback.onSuccess('session');
	};

	InternalCognitoUser.prototype.updateAttributes = (
		attributeList,
		callback
	) => {
		callback(null, 'SUCCESS');
	};

	InternalCognitoUser.prototype.getMFAOptions = callback => {
		callback(null, 'mfaOptions');
	};

	InternalCognitoUser.prototype.disableMFA = callback => {
		callback(null, 'Success');
	};

	InternalCognitoUser.prototype.enableMFA = callback => {
		callback(null, 'Success');
	};

	InternalCognitoUser.prototype.associateSoftwareToken = callback => {
		callback.associateSecretCode('secretCode');
	};

	InternalCognitoUser.prototype.verifySoftwareToken = (
		challengeAnswer,
		device,
		callback
	) => {
		callback.onSuccess('Success');
	};

	InternalCognitoUser.prototype.setUserMfaPreference = (
		smsMfaSettings,
		totpMfaSettings,
		callback
	) => {
		callback(null, 'Success');
	};

	InternalCognitoUser.prototype.getUserData = callback => {
		callback(null, {
			PreferredMfaSetting: 'SMS_MFA',
		});
	};

	InternalCognitoUser.prototype.getUsername = () => {
		return 'testUsername';
	};

	InternalCognitoUser.prototype.getSignInUserSession = () => {
		return session;
	};

	return {
		...jest.requireActual('amazon-cognito-identity-js/internals'),
		InternalCognitoUser,
		InternalCognitoUserPool,
	};
});

import { AuthClass as Auth } from '../src/Auth';
import {
	CognitoUserSession,
	CognitoIdToken,
	CognitoAccessToken,
} from 'amazon-cognito-identity-js';
import {
	InternalCognitoUser,
	InternalCognitoUserPool,
} from 'amazon-cognito-identity-js/internals';
import { Hub } from '@aws-amplify/core';
import { InternalAuthClass } from '../src/internals/InternalAuth';

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

const userPool = new InternalCognitoUserPool({
	UserPoolId: authOptions.Auth.userPoolId,
	ClientId: authOptions.Auth.userPoolWebClientId,
});

const idToken = new CognitoIdToken({ IdToken: 'idToken' });
const accessToken = new CognitoAccessToken({ AccessToken: 'accessToken' });

const session = new CognitoUserSession({
	IdToken: idToken,
	AccessToken: accessToken,
});

const user = new InternalCognitoUser({
	Username: 'username',
	Pool: userPool,
});

describe('auth unit test', () => {
	describe('getMFAOptions test', () => {
		test('happy case', async () => {
			const auth = new Auth(new InternalAuthClass(authOptions));

			const spyon = jest.spyOn(InternalCognitoUser.prototype, 'getMFAOptions');
			expect(await auth.getMFAOptions(user)).toBe('mfaOptions');
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('err case', async () => {
			const auth = new Auth(new InternalAuthClass(authOptions));

			const spyon = jest
				.spyOn(InternalCognitoUser.prototype, 'getMFAOptions')
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
			const auth = new Auth(new InternalAuthClass(authOptions));
			const spyon = jest.spyOn(InternalCognitoUser.prototype, 'disableMFA');
			expect(await auth.disableSMS(user)).toBe('Success');
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('err case', async () => {
			const auth = new Auth(new InternalAuthClass(authOptions));

			const spyon = jest
				.spyOn(InternalCognitoUser.prototype, 'disableMFA')
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
			const auth = new Auth(new InternalAuthClass(authOptions));

			const spyon = jest.spyOn(InternalCognitoUser.prototype, 'enableMFA');
			expect(await auth.enableSMS(user)).toBe('Success');
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('err case', async () => {
			const auth = new Auth(new InternalAuthClass(authOptions));

			const spyon = jest
				.spyOn(InternalCognitoUser.prototype, 'enableMFA')
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
			const auth = new Auth(new InternalAuthClass(authOptions));

			const spyon = jest.spyOn(
				InternalCognitoUser.prototype,
				'associateSoftwareToken'
			);
			expect(await auth.setupTOTP(user)).toBe('secretCode');
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('err case', async () => {
			const auth = new Auth(new InternalAuthClass(authOptions));

			const spyon = jest
				.spyOn(InternalCognitoUser.prototype, 'associateSoftwareToken')
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
		test('happy case during sign-in', async () => {
			const auth = new Auth(new InternalAuthClass(authOptions));
			jest.clearAllMocks(); // clear hub calls

			const happyCaseUser = new InternalCognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			happyCaseUser.getSignInUserSession = () => null;

			const spyon = jest.spyOn(
				InternalCognitoUser.prototype,
				'verifySoftwareToken'
			);
			const spyon2 = jest.spyOn(InternalCognitoUser.prototype, 'getUsername');
			const hubSpy = jest.spyOn(Hub, 'dispatch');

			expect(await auth.verifyTotpToken(happyCaseUser, 'challengeAnswer')).toBe(
				'Success'
			);

			expect(spyon).toBeCalled();
			expect(spyon2).toBeCalled();
			expect(hubSpy).toBeCalledTimes(2);

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('happy case signedin user', async () => {
			const auth = new Auth(new InternalAuthClass(authOptions));
			jest.clearAllMocks(); // clear hub calls

			const happyCaseUser = new InternalCognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const spyon = jest.spyOn(
				InternalCognitoUser.prototype,
				'verifySoftwareToken'
			);
			const spyon2 = jest.spyOn(InternalCognitoUser.prototype, 'getUsername');
			const hubSpy = jest.spyOn(Hub, 'dispatch');

			expect(await auth.verifyTotpToken(happyCaseUser, 'challengeAnswer')).toBe(
				'Success'
			);

			expect(spyon).toBeCalled();
			expect(spyon2).toBeCalled();
			expect(hubSpy).toBeCalledTimes(1);

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('err case user during sign in', async () => {
			const errCaseUser = new InternalCognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			errCaseUser.getSignInUserSession = () => null;

			const auth = new Auth(new InternalAuthClass(authOptions));

			const spyon = jest
				.spyOn(InternalCognitoUser.prototype, 'verifySoftwareToken')
				.mockImplementationOnce((challengeAnswer, device, callback) => {
					callback.onFailure(new Error('err'));
				});
			try {
				await auth.verifyTotpToken(errCaseUser, 'challengeAnswer');
			} catch (e) {
				expect(e).toEqual(new Error('err'));
			}
			expect(spyon).toBeCalled();
			spyon.mockClear();
		});
	});

	describe('setPreferredMFA test', () => {
		test('happy case', async () => {
			const auth = new Auth(new InternalAuthClass(authOptions));

			const spyon = jest.spyOn(
				InternalCognitoUser.prototype,
				'setUserMfaPreference'
			);
			const spyon2 = jest
				.spyOn(InternalAuthClass.prototype, 'getPreferredMFA')
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
			const auth = new Auth(new InternalAuthClass(authOptions));

			const spyon = jest
				.spyOn(InternalCognitoUser.prototype, 'setUserMfaPreference')
				.mockImplementationOnce((smsMfaSettings, totpMfaSettings, callback) => {
					const err = {
						message: 'User has not verified software token mfa',
					};
					callback(new Error('err'), null);
				});
			const spyon2 = jest
				.spyOn(InternalAuthClass.prototype, 'getPreferredMFA')
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
			const auth = new Auth(new InternalAuthClass(authOptions));
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
			const auth = new Auth(new InternalAuthClass(authOptions));

			expect(await auth.getPreferredMFA(user)).toBe('SMS_MFA');
		});

		test('error case', async () => {
			const auth = new Auth(new InternalAuthClass(authOptions));

			const spyon = jest
				.spyOn(InternalCognitoUser.prototype, 'getUserData')
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
