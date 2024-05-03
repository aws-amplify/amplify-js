import OAuth from '../src/OAuth/OAuth';
import * as oauthStorage from '../src/OAuth/oauthStorage';
import {
	CookieStorage,
	CognitoUserPool,
	CognitoUser,
	CognitoUserSession,
	CognitoIdToken,
	CognitoAccessToken,
	NodeCallback,
} from 'amazon-cognito-identity-js';

jest.mock('crypto-js/sha256', () => {
	return {
		default: jest.fn(() => ''),
	};
});

jest.mock('../src/OAuth/oauthStorage', () => {
	return {
		clearAll: jest.fn(),
		setState: jest.fn(),
		setPKCE: jest.fn(),
		getState: jest.fn(),
		getPKCE: jest.fn(),
	};
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

	CognitoUserSession.prototype.getAccessToken = () => {
		return 'accessToken';
	};

	CognitoUserSession.prototype.isValid = () => {
		return true;
	};

	CognitoUserSession.prototype.getRefreshToken = () => {
		return 'refreshToken';
	};

	return CognitoUserSession;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoUserPool', () => {
	const CognitoUserPool = () => {};

	CognitoUserPool.prototype.CognitoUserPool = options => {
		CognitoUserPool.prototype.options = options;
		return CognitoUserPool;
	};

	CognitoUserPool.prototype.getCurrentUser = () => {
		return {
			username: 'username',
			getSession: callback => {
				// throw 3;
				callback(null, {
					getAccessToken: () => {
						return {
							decodePayload: () => 'payload',
							getJwtToken: () => 'jwt',
						};
					},
				});
			},
		};
	};

	CognitoUserPool.prototype.signUp = (
		username,
		password,
		signUpAttributeList,
		validationData,
		callback,
		clientMetadata
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
		callback(null, {
			CodeDeliveryDetails: {
				AttributeName: 'email',
				DeliveryMedium: 'EMAIL',
				Destination: 'amplify@*****.com',
			},
		});
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

	CognitoUser.prototype.globalSignOut = callback => {
		callback.onSuccess();
	};

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

	CognitoUser.prototype.setAuthenticationFlowType = type => {};

	CognitoUser.prototype.initiateAuth = (authenticationDetails, callback) => {
		callback.customChallenge('challengeParam');
	};

	CognitoUser.prototype.sendCustomChallengeAnswer = (
		challengeAnswer,
		callback
	) => {
		callback.onSuccess('session');
	};

	CognitoUser.prototype.refreshSession = (refreshToken, callback) => {
		callback(null, 'session');
	};

	CognitoUser.prototype.getUsername = () => {
		return 'username';
	};

	CognitoUser.prototype.getUserData = callback => {
		callback(null, 'data');
	};

	return CognitoUser;
});

import { AuthOptions, SignUpParams, AwsCognitoOAuthOpts } from '../src/types';
import { AuthClass as Auth } from '../src/Auth';
import Cache from '@aws-amplify/cache';
import {
	Credentials,
	GoogleOAuth,
	StorageHelper,
	ICredentials,
	Hub,
} from '@aws-amplify/core';
import { AuthError, NoUserPoolError } from '../src/Errors';
import { AuthErrorTypes } from '../src/types/Auth';

const authOptions: AuthOptions = {
	userPoolId: 'awsUserPoolsId',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
};

const authOptionsWithClientMetadata: AuthOptions = {
	userPoolId: 'awsUserPoolsId',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
	clientMetadata: {
		foo: 'bar',
	},
};

const authOptionsWithNoUserPoolId: AuthOptions = {
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
};

const userPool = new CognitoUserPool({
	UserPoolId: authOptions.userPoolId,
	ClientId: authOptions.userPoolWebClientId,
});

const idToken = new CognitoIdToken({ IdToken: 'idToken' });
const accessToken = new CognitoAccessToken({ AccessToken: 'accessToken' });

const session = new CognitoUserSession({
	IdToken: idToken,
	AccessToken: accessToken,
});

const authCallbacks = {
	customChallenge: jasmine.any(Function),
	mfaRequired: jasmine.any(Function),
	mfaSetup: jasmine.any(Function),
	newPasswordRequired: jasmine.any(Function),
	onFailure: jasmine.any(Function),
	onSuccess: jasmine.any(Function),
	selectMFAType: jasmine.any(Function),
	totpRequired: jasmine.any(Function),
};

const USER_ADMIN_SCOPE = 'aws.cognito.signin.user.admin';

describe('auth unit test', () => {
	describe('signUp', () => {
		test('happy case with object attr', async () => {
			const spyon = jest.spyOn(CognitoUserPool.prototype, 'signUp');
			const auth = new Auth(authOptions);

			const attrs = {
				username: 'username',
				password: 'password',
				attributes: {
					email: 'email',
					phone_number: 'phone_number',
					otherAttrs: 'otherAttrs',
				},
			};
			expect(await auth.signUp(attrs)).toBe('signUpResult');

			spyon.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const spyon = jest.spyOn(CognitoUserPool.prototype, 'signUp');
			const auth = new Auth(authOptionsWithClientMetadata);

			const attrs = {
				username: 'username',
				password: 'password',
				attributes: {
					email: 'email',
					phone_number: 'phone_number',
					otherAttrs: 'otherAttrs',
				},
			};
			await auth.signUp(attrs);

			expect(await CognitoUserPool.prototype.signUp).toBeCalledWith(
				attrs.username,
				attrs.password,
				[
					{ Name: 'email', Value: 'email' },
					{ Name: 'phone_number', Value: 'phone_number' },
					{ Name: 'otherAttrs', Value: 'otherAttrs' },
				],
				null,
				jasmine.any(Function),
				{ foo: 'bar' }
			);
			spyon.mockClear();
		});

		test('happy case clientMetadata parameter', async () => {
			const spyon = jest.spyOn(CognitoUserPool.prototype, 'signUp');
			const auth = new Auth(authOptionsWithClientMetadata);

			const attrs = {
				username: 'username',
				password: 'password',
				attributes: {
					email: 'email',
					phone_number: 'phone_number',
					otherAttrs: 'otherAttrs',
				},
				clientMetadata: {
					custom: 'value',
				},
			};
			await auth.signUp(attrs);

			expect(await CognitoUserPool.prototype.signUp).toBeCalledWith(
				attrs.username,
				attrs.password,
				[
					{ Name: 'email', Value: 'email' },
					{ Name: 'phone_number', Value: 'phone_number' },
					{ Name: 'otherAttrs', Value: 'otherAttrs' },
				],
				null,
				jasmine.any(Function),
				{ custom: 'value' }
			);
			spyon.mockClear();
		});

		test('object attr with null username', async () => {
			const auth = new Auth(authOptions);

			const attrs = {
				username: null,
				password: 'password',
				attributes: {
					email: 'email',
					phone_number: 'phone_number',
					otherAttrs: 'otherAttrs',
				},
			};
			expect.assertions(1);
			expect(auth.signUp(attrs).then()).rejects.toThrow(AuthError);
		});

		test('callback error', async () => {
			const spyon = jest
				.spyOn(CognitoUserPool.prototype, 'signUp')
				.mockImplementationOnce(
					(
						username,
						password,
						signUpAttributeList,
						validationData,
						callback
					) => {
						callback(new Error('err'), null);
					}
				);

			const auth = new Auth(authOptions);

			expect.assertions(1);
			try {
				const attrs = {
					username: 'username',
					password: 'password',
					attributes: {
						email: 'email',
						phone_number: 'phone_number',
						otherAttrs: 'otherAttrs',
					},
				};
				await auth.signUp(attrs);
			} catch (e) {
				expect(e).toEqual(new Error('err'));
			}

			spyon.mockClear();
		});

		test('no config', async () => {
			const auth = new Auth(undefined);
			const errorMessage = new NoUserPoolError(AuthErrorTypes.NoConfig);

			expect.assertions(2);
			expect(
				auth.signUp('username', 'password', 'email', 'phone').then()
			).rejects.toThrow(NoUserPoolError);
			expect(
				auth.signUp('username', 'password', 'email', 'phone').then()
			).rejects.toEqual(errorMessage);
		});

		test('no user pool in config', async () => {
			const auth = new Auth(authOptionsWithNoUserPoolId);
			const errorMessage = new NoUserPoolError(
				AuthErrorTypes.MissingAuthConfig
			);

			expect.assertions(2);
			expect(
				auth.signUp('username', 'password', 'email', 'phone').then()
			).rejects.toThrow(NoUserPoolError);
			expect(
				auth.signUp('username', 'password', 'email', 'phone').then()
			).rejects.toEqual(errorMessage);
		});

		test('no username', async () => {
			const auth = new Auth(authOptions);
			expect.assertions(1);
			expect(
				auth.signUp(null, 'password', 'email', 'phone').then()
			).rejects.toThrow(AuthError);
		});

		test('no password', async () => {
			const auth = new Auth(authOptions);
			const errorMessage = new AuthError(AuthErrorTypes.EmptyPassword);

			expect.assertions(2);
			expect(
				auth.signUp('username', null, 'email', 'phone').then()
			).rejects.toThrow(AuthError);
			expect(
				auth.signUp('username', null, 'email', 'phone').then()
			).rejects.toEqual(errorMessage);
		});

		test('only username', async () => {
			const auth = new Auth(authOptions);
			const errorMessage = new AuthError(AuthErrorTypes.EmptyPassword);

			expect.assertions(2);
			expect(auth.signUp('username').then()).rejects.toThrow(AuthError);
			expect(auth.signUp('username').then()).rejects.toEqual(errorMessage);
		});
	});

	describe('confirmSignUp', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'confirmRegistration');
			const auth = new Auth(authOptions);

			expect.assertions(1);
			expect(await auth.confirmSignUp('username', 'code')).toBe('Success');

			spyon.mockClear();
		});

		test('with options', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'confirmRegistration');
			const auth = new Auth(authOptions);

			expect.assertions(1);
			expect(
				await auth.confirmSignUp('username', 'code', {
					forceAliasCreation: false,
				})
			).toBe('Success');

			spyon.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'confirmRegistration');
			const auth = new Auth(authOptionsWithClientMetadata);
			const code = 'code';

			await auth.confirmSignUp('username', code);

			expect(await CognitoUser.prototype.confirmRegistration).toBeCalledWith(
				code,
				jasmine.any(Boolean),
				jasmine.any(Function),
				{
					foo: 'bar',
				}
			);
			spyon.mockClear();
		});

		test('happy case clientMetadata parameter', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'confirmRegistration');
			const auth = new Auth(authOptionsWithClientMetadata);
			const code = 'code';

			await auth.confirmSignUp('username', code, {
				clientMetadata: { custom: 'value' },
			});

			expect(await CognitoUser.prototype.confirmRegistration).toBeCalledWith(
				code,
				jasmine.any(Boolean),
				jasmine.any(Function),
				{
					custom: 'value',
				}
			);
			spyon.mockClear();
		});

		test('callback err', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'confirmRegistration')
				.mockImplementationOnce(
					(confirmationCode, forceAliasCreation, callback) => {
						callback('err', null);
					}
				);

			const auth = new Auth(authOptions);

			expect.assertions(1);
			try {
				await auth.confirmSignUp('username', 'code');
			} catch (e) {
				expect(e).toBe('err');
			}

			spyon.mockClear();
		});

		test('no user pool in config', async () => {
			const auth = new Auth(authOptionsWithNoUserPoolId);
			const errorMessage = new NoUserPoolError(
				AuthErrorTypes.MissingAuthConfig
			);

			expect.assertions(2);
			expect(auth.confirmSignUp('username', 'code').then()).rejects.toThrow(
				NoUserPoolError
			);
			expect(auth.confirmSignUp('username', 'code').then()).rejects.toEqual(
				errorMessage
			);
		});

		test('no user name', async () => {
			const auth = new Auth(authOptions);
			const errorMessage = new AuthError(AuthErrorTypes.EmptyUsername);

			expect.assertions(2);
			expect(auth.confirmSignUp(null, 'code').then()).rejects.toThrow(
				AuthError
			);
			expect(auth.confirmSignUp(null, 'code').then()).rejects.toEqual(
				errorMessage
			);
		});

		test('no code', async () => {
			const auth = new Auth(authOptions);
			const errorMessage = new AuthError(AuthErrorTypes.EmptyCode);

			expect.assertions(2);
			expect(auth.confirmSignUp('username', null).then()).rejects.toThrow(
				AuthError
			);
			expect(auth.confirmSignUp('username', null).then()).rejects.toEqual(
				errorMessage
			);
		});
	});

	describe('resendSignUp', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'resendConfirmationCode');
			const auth = new Auth(authOptions);

			expect.assertions(1);
			expect(await auth.resendSignUp('username')).toMatchObject({
				CodeDeliveryDetails: {
					AttributeName: 'email',
					DeliveryMedium: 'EMAIL',
					Destination: 'amplify@*****.com',
				},
			});

			spyon.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'resendConfirmationCode');
			const auth = new Auth(authOptionsWithClientMetadata);

			await auth.resendSignUp('username');

			expect(
				await CognitoUser.prototype.resendConfirmationCode
			).toBeCalledWith(jasmine.any(Function), { foo: 'bar' });
			spyon.mockClear();
		});

		test('happy case clientMetadata parameter', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'resendConfirmationCode');
			const auth = new Auth(authOptionsWithClientMetadata);

			await auth.resendSignUp('username', { custom: 'value' });

			expect(
				await CognitoUser.prototype.resendConfirmationCode
			).toBeCalledWith(jasmine.any(Function), { custom: 'value' });
			spyon.mockClear();
		});

		test('callback err', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'resendConfirmationCode')
				.mockImplementationOnce(callback => {
					callback(new Error('err'), null);
				});

			const auth = new Auth(authOptions);

			expect.assertions(1);
			try {
				await auth.resendSignUp('username');
			} catch (e) {
				expect(e).toEqual(new Error('err'));
			}

			spyon.mockClear();
		});

		test('no user pool in config', async () => {
			const auth = new Auth(authOptionsWithNoUserPoolId);
			const errorMessage = new NoUserPoolError(
				AuthErrorTypes.MissingAuthConfig
			);

			expect.assertions(2);
			expect(auth.resendSignUp('username').then()).rejects.toThrow(
				NoUserPoolError
			);
			expect(auth.resendSignUp('username').then()).rejects.toEqual(
				errorMessage
			);
		});

		test('no username', async () => {
			const auth = new Auth(authOptions);
			const errorMessage = new AuthError(AuthErrorTypes.EmptyUsername);

			expect.assertions(2);
			expect(auth.resendSignUp(null).then()).rejects.toThrow(AuthError);
			expect(auth.resendSignUp(null).then()).rejects.toEqual(errorMessage);
		});
	});

	describe('events', () => {
		test('token events', async () => {
			expect.assertions(2);

			// calling the `wrappedCallback` (a node callback) manually lets us trigger hub events
			const auth = new Auth(authOptions);
			const callback: NodeCallback.Any = (error, result) => {};
			const wrappedCallback = auth.wrapRefreshSessionCallback(callback);

			// saving a reference to this fn's return before triggering `wrappedCallback` lets us capture the payload
			const captureEvent = () => {
				return new Promise(resolve => {
					Hub.listen('auth', capsule => {
						switch (capsule.payload.event) {
							case 'tokenRefresh': {
								return resolve(true);
							}

							case 'tokenRefresh_failure': {
								return resolve(capsule.payload.data);
							}

							default: {
								break;
							}
						}
					});
				});
			};

			// for successful token refresh
			const successEventPending = captureEvent();
			wrappedCallback(undefined, true);

			// for failed token refresh
			const syntheticError = new Error();
			const failureEventPending = captureEvent();
			wrappedCallback(syntheticError, undefined);

			// gather the payloads
			const [successEvent, failureEvent] = await Promise.all([
				successEventPending,
				failureEventPending,
			]);

			// make assertions
			expect(successEvent).toBeTruthy();
			expect(failureEvent).toBe(syntheticError);
		});
	});

	describe('signIn', () => {
		test('happy case with password', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'authenticateUser')
				.mockImplementationOnce((authenticationDetails, callback) => {
					callback.onSuccess(session);
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon2 = jest
				.spyOn(auth, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return Promise.resolve(user);
				});

			expect.assertions(2);
			expect(await auth.signIn('username', 'password')).toEqual(user);
			expect(spyon2).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'authenticateUser');
			const auth = new Auth(authOptionsWithClientMetadata);

			await auth.signIn('username', 'password');

			expect(await CognitoUser.prototype.authenticateUser).toBeCalledWith(
				{
					username: 'username',
					password: 'password',
					validationData: {},
					clientMetadata: { foo: 'bar' },
					authParameters: {},
				},
				authCallbacks
			);
			spyon.mockClear();
		});

		test('happy case clientMetadata parameter', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'authenticateUser');
			const auth = new Auth(authOptionsWithClientMetadata);

			await auth.signIn('username', 'password', { custom: 'value' });

			expect(await CognitoUser.prototype.authenticateUser).toBeCalledWith(
				{
					username: 'username',
					password: 'password',
					validationData: {},
					clientMetadata: { custom: 'value' },
					authParameters: {},
				},
				authCallbacks
			);
			spyon.mockClear();
		});

		test('happy case validationData parameter', async () => {
			const spyon = jest.spyOn(CognitoUserPool.prototype, 'signUp');
			const auth = new Auth(authOptionsWithClientMetadata);

			const attrs: SignUpParams = {
				username: 'username',
				password: 'password',
				attributes: {
					email: 'email',
					phone_number: 'phone_number',
					otherAttrs: 'otherAttrs',
				},
				clientMetadata: {
					custom: 'value',
				},
				validationData: {
					foo: 'bar',
					test: '123',
				},
			};
			await auth.signUp(attrs);

			expect(await spyon).toBeCalledWith(
				attrs.username,
				attrs.password,
				[
					{ Name: 'email', Value: 'email' },
					{ Name: 'phone_number', Value: 'phone_number' },
					{ Name: 'otherAttrs', Value: 'otherAttrs' },
				],
				[
					{ Name: 'foo', Value: 'bar' },
					{ Name: 'test', Value: '123' },
				],
				jasmine.any(Function),
				{ custom: 'value' }
			);
			spyon.mockClear();
		});

		test('throw error if failed to call currentUserPoolUser after signing in', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'authenticateUser')
				.mockImplementationOnce((authenticationDetails, callback) => {
					callback.onSuccess(session);
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon2 = jest
				.spyOn(auth, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return Promise.reject('User is disabled.');
				});
			expect.assertions(2);
			try {
				await auth.signIn('username', 'password');
			} catch (e) {
				expect(e).toBe('User is disabled.');
				expect(spyon2).toBeCalled();
			}

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('happy case using cookie storage', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'authenticateUser')
				.mockImplementationOnce((_authenticationDetails, callback) => {
					callback.onSuccess(session);
				});

			const auth = new Auth({
				...authOptions,
				cookieStorage: { domain: '.example.com' },
			});
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
				Storage: new CookieStorage({ domain: '.yourdomain.com' }),
			});

			const spyon2 = jest
				.spyOn(auth, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return Promise.resolve(user);
				});

			expect.assertions(1);
			expect(await auth.signIn('username', 'password')).toEqual(user);

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('onFailure', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'authenticateUser')
				.mockImplementationOnce((authenticationDetails, callback) => {
					callback.onFailure('err');
				});

			const auth = new Auth(authOptions);

			expect.assertions(1);
			try {
				await auth.signIn('username', 'password');
			} catch (e) {
				expect(e).toBe('err');
			}

			spyon.mockClear();
		});

		test('mfaRequired', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'authenticateUser')
				.mockImplementationOnce((authenticationDetails, callback) => {
					callback.mfaRequired('challengeName', 'challengeParam');
				});
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const userAfterSignedIn = Object.assign({}, user, {
				challengeName: 'challengeName',
				challengeParam: 'challengeParam',
			});

			expect.assertions(1);
			expect(await auth.signIn('username', 'password')).toEqual(
				userAfterSignedIn
			);

			spyon.mockClear();
		});

		test('mfaSetup', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'authenticateUser')
				.mockImplementationOnce((authenticationDetails, callback) => {
					callback.mfaSetup('challengeName', 'challengeParam');
				});
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const userAfterSignedIn = Object.assign({}, user, {
				challengeName: 'challengeName',
				challengeParam: 'challengeParam',
			});

			expect.assertions(1);
			expect(await auth.signIn('username', 'password')).toEqual(
				userAfterSignedIn
			);

			spyon.mockClear();
		});

		test('totpRequired', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'authenticateUser')
				.mockImplementationOnce((authenticationDetails, callback) => {
					callback.totpRequired('challengeName', 'challengeParam');
				});
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const userAfterSignedIn = Object.assign({}, user, {
				challengeName: 'challengeName',
				challengeParam: 'challengeParam',
			});

			expect.assertions(1);
			expect(await auth.signIn('username', 'password')).toEqual(
				userAfterSignedIn
			);

			spyon.mockClear();
		});

		test('selectMFAType', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'authenticateUser')
				.mockImplementationOnce((authenticationDetails, callback) => {
					callback.selectMFAType('challengeName', 'challengeParam');
				});
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const userAfterSignedIn = Object.assign({}, user, {
				challengeName: 'challengeName',
				challengeParam: 'challengeParam',
			});

			expect.assertions(1);
			expect(await auth.signIn('username', 'password')).toEqual(
				userAfterSignedIn
			);

			spyon.mockClear();
		});

		test('newPasswordRequired', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'authenticateUser')
				.mockImplementationOnce((authenticationDetails, callback) => {
					callback.newPasswordRequired('userAttributes', 'requiredAttributes');
				});
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const userAfterSignedIn = Object.assign({}, user, {
				challengeName: 'NEW_PASSWORD_REQUIRED',
				challengeParam: {
					requiredAttributes: 'requiredAttributes',
					userAttributes: 'userAttributes',
				},
			});

			expect.assertions(1);
			expect(await auth.signIn('username', 'password')).toEqual(
				userAfterSignedIn
			);

			spyon.mockClear();
		});

		test('customChallenge', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'authenticateUser')
				.mockImplementationOnce((authenticationDetails, callback) => {
					callback.customChallenge('challengeParam');
				});
			const spyon2 = jest
				.spyOn(CognitoUser.prototype as any, 'setAuthenticationFlowType')
				.mockImplementationOnce(type => {});
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const userAfterSignedIn = Object.assign({}, user, {
				challengeName: 'CUSTOM_CHALLENGE',
				challengeParam: 'challengeParam',
			});

			expect.assertions(2);
			expect(await auth.signIn('username')).toEqual(userAfterSignedIn);
			expect(spyon2).toBeCalledWith('CUSTOM_AUTH');

			spyon2.mockClear();
			spyon.mockClear();
		});

		test('no userPool', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'authenticateUser');

			// @ts-ignore
			const auth = new Auth(authOptionsWithNoUserPoolId);

			expect.assertions(1);
			try {
				await auth.signIn('username', 'password');
			} catch (e) {
				expect(e).not.toBeNull();
			}

			spyon.mockClear();
		});

		test('no username', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'authenticateUser');
			const auth = new Auth(authOptions);

			expect.assertions(1);
			try {
				await auth.signIn(null, 'password');
			} catch (e) {
				expect(e).not.toBeNull();
			}

			spyon.mockClear();
		});
	});

	describe('confirmSignIn', () => {
		test('happy case', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'sendMFACode')
				.mockImplementationOnce((code, callback) => {
					callback.onSuccess(session);
				});
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			expect(await auth.confirmSignIn(user, 'code', null)).toEqual(user);

			spyon.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'sendMFACode');
			const auth = new Auth(authOptionsWithClientMetadata);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const code = 'code';

			await auth.confirmSignIn(user, code);

			expect(await CognitoUser.prototype.sendMFACode).toBeCalledWith(
				code,
				{
					onSuccess: jasmine.any(Function),
					onFailure: jasmine.any(Function),
				},
				undefined,
				{ foo: 'bar' }
			);
			spyon.mockClear();
		});

		test('happy case clientMetadata parameter', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'sendMFACode');
			const auth = new Auth(authOptionsWithClientMetadata);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const code = 'code';

			await auth.confirmSignIn(user, code, 'SMS_MFA', { custom: 'value' });

			expect(await CognitoUser.prototype.sendMFACode).toBeCalledWith(
				code,
				{
					onSuccess: jasmine.any(Function),
					onFailure: jasmine.any(Function),
				},
				'SMS_MFA',
				{ custom: 'value' }
			);
			spyon.mockClear();
		});

		test('onFailure', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'sendMFACode')
				.mockImplementationOnce((code, callback) => {
					callback.onFailure('err');
				});
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			try {
				await auth.confirmSignIn(user, 'code', null);
			} catch (e) {
				expect(e).toBe('err');
			}

			spyon.mockClear();
		});

		test('no code', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'sendMFACode');
			const auth = new Auth(authOptions);

			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			try {
				await auth.confirmSignIn(user, null, null);
			} catch (e) {
				expect(e).not.toBeNull();
			}

			spyon.mockClear();
		});
	});

	describe('completeNewPassword', () => {
		test('happy case', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'completeNewPasswordChallenge')
				.mockImplementationOnce((password, requiredAttributes, callback) => {
					callback.onSuccess(session);
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			expect(await auth.completeNewPassword(user, 'password', {})).toEqual(
				user
			);

			spyon.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const spyon = jest.spyOn(
				CognitoUser.prototype,
				'completeNewPasswordChallenge'
			);
			const auth = new Auth(authOptionsWithClientMetadata);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			await auth.completeNewPassword(user, 'password', {});

			expect(
				await CognitoUser.prototype.completeNewPasswordChallenge
			).toBeCalledWith(
				'password',
				{},
				{
					onSuccess: jasmine.any(Function),
					onFailure: jasmine.any(Function),
					mfaRequired: jasmine.any(Function),
					mfaSetup: jasmine.any(Function),
					totpRequired: jasmine.any(Function),
				},
				{ foo: 'bar' }
			);
			spyon.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const spyon = jest.spyOn(
				CognitoUser.prototype,
				'completeNewPasswordChallenge'
			);
			const auth = new Auth(authOptionsWithClientMetadata);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			await auth.completeNewPassword(user, 'password', {}, { custom: 'value' });

			expect(
				await CognitoUser.prototype.completeNewPasswordChallenge
			).toBeCalledWith(
				'password',
				{},
				{
					onSuccess: jasmine.any(Function),
					onFailure: jasmine.any(Function),
					mfaRequired: jasmine.any(Function),
					mfaSetup: jasmine.any(Function),
					totpRequired: jasmine.any(Function),
				},
				{ custom: 'value' }
			);
			spyon.mockClear();
		});

		test('on Failure', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'completeNewPasswordChallenge')
				.mockImplementationOnce((password, requiredAttributes, callback) => {
					callback.onFailure('err');
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			try {
				await auth.completeNewPassword(user, 'password', {});
			} catch (e) {
				expect(e).toBe('err');
			}

			spyon.mockClear();
		});

		test('mfaRequired', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'completeNewPasswordChallenge')
				.mockImplementationOnce((password, requiredAttributes, callback) => {
					callback.mfaRequired('challengeName', 'challengeParam');
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			expect(await auth.completeNewPassword(user, 'password', {})).toBe(user);

			spyon.mockClear();
		});

		test('mfaSetup', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'completeNewPasswordChallenge')
				.mockImplementationOnce((password, requiredAttributes, callback) => {
					callback.mfaSetup('challengeName', 'challengeParam');
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			expect(await auth.completeNewPassword(user, 'password', {})).toBe(user);

			spyon.mockClear();
		});

		test('no password', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const errorMessage = new AuthError(AuthErrorTypes.EmptyPassword);

			expect.assertions(2);
			await expect(
				auth.completeNewPassword(user, null, {}).then()
			).rejects.toThrow(AuthError);
			await expect(
				auth.completeNewPassword(user, null, {}).then()
			).rejects.toEqual(errorMessage);
		});
	});

	describe('userAttributes', () => {
		test('happy case', async () => {
			const spyon = jest
				.spyOn(Auth.prototype, 'userSession')
				.mockImplementationOnce(user => {
					return new Promise((res: any, rej) => {
						res('session');
					});
				});

			const spyon2 = jest.spyOn(CognitoUser.prototype, 'getUserAttributes');

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			expect(await auth.userAttributes(user)).toBe('attributes');

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('get userattributes failed', async () => {
			const spyon = jest
				.spyOn(Auth.prototype, 'userSession')
				.mockImplementationOnce(user => {
					return new Promise((res: any, rej) => {
						res('session');
					});
				});

			const spyon2 = jest
				.spyOn(CognitoUser.prototype, 'getUserAttributes')
				.mockImplementationOnce(callback => {
					callback(new Error('err'));
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			try {
				await auth.userAttributes(user);
			} catch (e) {
				expect(e).toEqual(new Error('err'));
			}

			spyon.mockClear();
			spyon2.mockClear();
		});
	});

	describe('currentSession', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(auth, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return Promise.resolve(user);
				});

			const spyon2 = jest
				.spyOn(Auth.prototype, 'userSession')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(session);
					});
				});
			expect.assertions(1);
			expect(await auth.currentSession()).toEqual(session);

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('no current session', async () => {
			const auth = new Auth(authOptions);

			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(auth, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return Promise.resolve(user);
				});

			const spyon2 = jest
				.spyOn(auth, 'userSession')
				.mockImplementationOnce(() => {
					return Promise.reject('cannot get the session');
				});

			expect.assertions(1);
			try {
				await auth.currentSession();
			} catch (e) {
				expect(e).toBe('cannot get the session');
			}

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('no current user', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest
				.spyOn(auth, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return Promise.reject('no current user');
				});

			expect.assertions(1);
			try {
				await auth.currentSession();
			} catch (e) {
				expect(e).toBe('no current user');
			}

			spyon.mockClear();
		});

		test('no UserPool', async () => {
			const auth = new Auth({
				userPoolId: undefined,
				userPoolWebClientId: 'awsUserPoolsWebClientId',
				region: 'region',
				identityPoolId: 'awsCognitoIdentityPoolId',
				mandatorySignIn: false,
			});
			const errorMessage = new NoUserPoolError(
				AuthErrorTypes.MissingAuthConfig
			);

			expect.assertions(2);
			expect(auth.currentSession().then()).rejects.toThrow(NoUserPoolError);
			expect(auth.currentSession().then()).rejects.toEqual(errorMessage);
		});
	});

	describe('currentAuthenticatedUser', () => {
		test('happy case with source userpool', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(Auth.prototype, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(user);
					});
				});
			expect.assertions(1);
			expect(await auth.currentAuthenticatedUser()).toEqual(user);

			spyon.mockClear();
		});

		test('happy case with source federation', async () => {
			const spyon = jest
				.spyOn(StorageHelper.prototype, 'getStorage')
				.mockImplementation(() => {
					return {
						setItem() {},
						getItem() {
							return JSON.stringify({
								user: {
									name: 'federated user',
								},
								token: '12345',
							});
						},
						removeItem() {},
					};
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			expect(await auth.currentAuthenticatedUser()).toStrictEqual({
				name: 'federated user',
				token: '12345',
			});

			spyon.mockClear();
		});
	});

	describe('userSession test', () => {
		test('happy case', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'getSession')
				.mockImplementationOnce((callback: any) => {
					callback(null, session);
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			expect(await auth.userSession(user)).toEqual(session);

			spyon.mockClear();
		});

		test('callback error', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(CognitoUser.prototype, 'getSession')
				.mockImplementationOnce((callback: any) => {
					callback('err', null);
				});

			expect.assertions(1);
			try {
				await auth.userSession(user);
			} catch (e) {
				expect(e).toBe('err');
			}

			spyon.mockClear();
		});

		test('no user', async () => {
			const auth = new Auth(authOptions);
			const user = null;

			expect.assertions(1);
			try {
				await auth.userSession(user);
			} catch (e) {
				expect(e).not.toBeNull();
			}
		});
	});

	describe('currentUserCredentials test', () => {
		test('with federated info', async () => {
			const spyon = jest
				.spyOn(StorageHelper.prototype, 'getStorage')
				.mockImplementation(() => {
					return {
						setItem() {},
						getItem() {
							return JSON.stringify({
								provider: 'google',
								token: 'token',
							});
						},
						removeItem() {},
					};
				});

			const auth = new Auth(authOptions);

			const spyon2 = jest
				.spyOn(Credentials, 'refreshFederatedToken')
				.mockImplementationOnce(() => {
					return Promise.resolve('cred');
				});

			expect.assertions(1);
			expect(await auth.currentUserCredentials()).toBe('cred');

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('with cognito session', async () => {
			const spyon = jest
				.spyOn(StorageHelper.prototype, 'getStorage')
				.mockImplementation(() => {
					return {
						setItem() {},
						getItem() {
							return null;
						},
						removeItem() {},
					};
				});
			const auth = new Auth(authOptions);

			const spyon2 = jest
				.spyOn(auth, 'currentSession')
				.mockImplementationOnce(() => {
					return Promise.resolve('session' as any);
				});

			const spyon3 = jest
				.spyOn(Credentials, 'set')
				.mockImplementationOnce(() => {
					return Promise.resolve('cred' as any);
				});

			expect.assertions(1);
			expect(await auth.currentUserCredentials()).toBe('cred');

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
		});

		test('with guest', async () => {
			const spyon = jest
				.spyOn(StorageHelper.prototype, 'getStorage')
				.mockImplementation(() => {
					return {
						setItem() {},
						getItem() {
							return null;
						},
						removeItem() {},
					};
				});
			const auth = new Auth(authOptions);

			const spyon2 = jest
				.spyOn(auth, 'currentSession')
				.mockImplementationOnce(() => {
					return Promise.reject('err' as any);
				});

			const spyon3 = jest
				.spyOn(Credentials, 'set')
				.mockImplementationOnce(() => {
					return Promise.resolve('cred' as any);
				});

			expect.assertions(1);
			expect(await auth.currentUserCredentials()).toBe('cred');

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
		});

		test('json parse error', async () => {
			const spyon = jest
				.spyOn(StorageHelper.prototype, 'getStorage')
				.mockImplementation(() => {
					return {
						setItem() {},
						getItem() {
							return undefined;
						},
						removeItem() {},
					};
				});
			const auth = new Auth(authOptions);

			const spyon2 = jest
				.spyOn(auth, 'currentSession')
				.mockImplementationOnce(() => {
					return Promise.resolve('session') as any;
				});

			const spyon3 = jest
				.spyOn(Credentials, 'set')
				.mockImplementationOnce(() => {
					return Promise.resolve('cred' as any);
				});

			expect.assertions(1);
			expect(await auth.currentUserCredentials()).toBe('cred');

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
		});
	});

	describe('currentCrendentials', () => {
		const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
			return;
		});

		const auth = new Auth(authOptions);

		auth.currentCredentials();
		expect(spyon).toBeCalled();
		spyon.mockClear();
	});

	describe('verifyUserAttribute test', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(
				CognitoUser.prototype,
				'getAttributeVerificationCode'
			);

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			await auth.verifyUserAttribute(user, 'email');
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('onFailure', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'getAttributeVerificationCode')
				.mockImplementationOnce((attr, callback) => {
					callback.onFailure('err' as any);
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			try {
				await auth.verifyUserAttribute(user, 'email');
			} catch (e) {
				expect(e).toBe('err');
			}

			spyon.mockClear();
		});
	});

	describe('verifyUserAttributeSubmit', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'verifyAttribute');

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			expect(
				await auth.verifyUserAttributeSubmit(user, 'attribute', 'code')
			).toBe('success');

			spyon.mockClear();
		});

		test('onFailure', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'verifyAttribute')
				.mockImplementationOnce((attr, code, callback) => {
					callback.onFailure('err' as any);
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect.assertions(1);
			try {
				await auth.verifyUserAttributeSubmit(user, 'email', 'code');
			} catch (e) {
				expect(e).toBe('err');
			}

			spyon.mockClear();
		});

		test('code empty', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const errorMessage = new AuthError(AuthErrorTypes.EmptyCode);

			expect.assertions(2);
			expect(
				auth.verifyUserAttributeSubmit(user, 'email', null).then()
			).rejects.toThrow(AuthError);
			expect(
				auth.verifyUserAttributeSubmit(user, 'email', null).then()
			).rejects.toEqual(errorMessage);
		});
	});

	describe('verifyCurrentUserAttribute test', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(Auth.prototype, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(user);
					});
				});

			const spyon2 = jest
				.spyOn(Auth.prototype, 'verifyUserAttribute')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res();
					});
				});

			await auth.verifyCurrentUserAttribute('attr');

			expect.assertions(2);
			expect(spyon).toBeCalled();
			expect(spyon2).toBeCalledWith(user, 'attr');

			spyon.mockClear();
			spyon2.mockClear();
		});
	});

	describe('verifyCurrentUserAttributeSubmit test', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(Auth.prototype, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(user);
					});
				});

			const spyon2 = jest
				.spyOn(Auth.prototype, 'verifyUserAttributeSubmit')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res();
					});
				});

			await auth.verifyCurrentUserAttributeSubmit('attr', 'code');

			expect.assertions(2);
			expect(spyon).toBeCalled();
			expect(spyon2).toBeCalledWith(user, 'attr', 'code');

			spyon.mockClear();
			spyon2.mockClear();
		});
	});

	describe('signOut test', () => {
		beforeAll(() => {
			jest
				.spyOn(StorageHelper.prototype, 'getStorage')
				.mockImplementation(() => {
					return {
						setItem() {},
						getItem() {},
						removeItem() {},
					};
				});
		});

		test('happy case', async () => {
			const auth = new Auth(authOptions);

			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(Credentials, 'clear')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});
			const spyon2 = jest
				.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
				.mockImplementationOnce(() => {
					return user;
				});

			await auth.signOut();

			expect.assertions(2);
			expect(spyon).toBeCalled();
			expect(spyon2).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('happy case for source userpool', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			auth['credentials_source'] = 'aws';
			auth['credentials'] = {
				IdentityPoolId: 'identityPoolId',
			};

			const spyonAuth = jest
				.spyOn(Auth.prototype, 'currentUserCredentials')
				.mockImplementationOnce(() => {
					return new Promise((resolve, reject) => {
						resolve();
					});
				});
			const spyon = jest
				.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
				.mockImplementationOnce(() => {
					return user;
				});
			const spyon2 = jest.spyOn(CognitoUser.prototype, 'signOut');
			// @ts-ignore

			await auth.signOut();

			expect.assertions(1);
			expect(spyon2).toBeCalled();

			spyonAuth.mockClear();
			spyon.mockClear();
			spyon2.mockClear();
		});

		test('happy case for globalSignOut', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyonAuth = jest
				.spyOn(Credentials, 'clear')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});
			const spyon = jest
				.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
				.mockImplementationOnce(() => {
					return user;
				});
			const spyon2 = jest.spyOn(CognitoUser.prototype, 'globalSignOut');

			await auth.signOut({ global: true });

			expect.assertions(1);
			expect(spyon2).toBeCalled();

			spyonAuth.mockClear();
			spyon.mockClear();
			spyon2.mockClear();
		});

		test('happy case for no userpool', async () => {
			// @ts-ignore
			const auth = new Auth(authOptionsWithNoUserPoolId);

			expect(await auth.signOut()).toBeUndefined();
		});

		test('no User in userpool', async () => {
			const auth = new Auth(authOptions);

			const spyon = jest
				.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
				.mockImplementationOnce(() => {
					return null;
				});
			expect(await auth.signOut()).toBeUndefined();

			spyon.mockClear();
		});

		test('get guest credentials failed', async () => {
			const auth = new Auth(authOptionsWithNoUserPoolId);

			expect(await auth.signOut()).toBeUndefined();
		});
	});

	describe('changePassword', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const oldPassword = 'oldPassword1';
			const newPassword = 'newPassword1.';

			const spyon = jest
				.spyOn(Auth.prototype, 'userSession')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(session);
					});
				});

			expect.assertions(1);
			expect(await auth.changePassword(user, oldPassword, newPassword)).toBe(
				'SUCCESS'
			);

			spyon.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'changePassword');
			const auth = new Auth(authOptionsWithClientMetadata);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const oldPassword = 'oldPassword1';
			const newPassword = 'newPassword1.';

			await auth.changePassword(user, oldPassword, newPassword);

			expect(await CognitoUser.prototype.changePassword).toBeCalledWith(
				oldPassword,
				newPassword,
				jasmine.any(Function),
				{
					foo: 'bar',
				}
			);
			spyon.mockClear();
		});

		test('happy case clientMetadata parameter', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'changePassword');
			const auth = new Auth(authOptionsWithClientMetadata);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const oldPassword = 'oldPassword1';
			const newPassword = 'newPassword1.';

			await auth.changePassword(user, oldPassword, newPassword, {
				custom: 'value',
			});

			expect(await CognitoUser.prototype.changePassword).toBeCalledWith(
				oldPassword,
				newPassword,
				jasmine.any(Function),
				{
					custom: 'value',
				}
			);
			spyon.mockClear();
		});
	});

	describe('forgotPassword', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'forgotPassword');

			const auth = new Auth(authOptions);

			expect.assertions(1);
			expect(await auth.forgotPassword('username')).toBeUndefined();

			spyon.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'forgotPassword');
			const auth = new Auth(authOptionsWithClientMetadata);

			await auth.forgotPassword('username');

			expect(await CognitoUser.prototype.forgotPassword).toBeCalledWith(
				{
					inputVerificationCode: jasmine.any(Function),
					onFailure: jasmine.any(Function),
					onSuccess: jasmine.any(Function),
				},
				{ foo: 'bar' }
			);
			spyon.mockClear();
		});

		test('happy case clientMetadata parameter', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'forgotPassword');
			const auth = new Auth(authOptionsWithClientMetadata);

			await auth.forgotPassword('username', { custom: 'value' });

			expect(await CognitoUser.prototype.forgotPassword).toBeCalledWith(
				{
					inputVerificationCode: jasmine.any(Function),
					onFailure: jasmine.any(Function),
					onSuccess: jasmine.any(Function),
				},
				{ custom: 'value' }
			);
			spyon.mockClear();
		});

		test('onFailue', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'forgotPassword')
				.mockImplementationOnce(callback => {
					callback.onFailure(new Error('err'));
				});

			const auth = new Auth(authOptions);

			expect.assertions(1);
			try {
				await auth.forgotPassword('username');
			} catch (e) {
				expect(e).toEqual(new Error('err'));
			}

			spyon.mockClear();
		});

		test('inputVerificationCode', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'forgotPassword')
				.mockImplementationOnce(callback => {
					callback.inputVerificationCode('data');
				});

			const auth = new Auth(authOptions);

			expect.assertions(1);
			expect(await auth.forgotPassword('username')).toBe('data');

			spyon.mockClear();
		});

		test('no user pool id', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'forgotPassword');

			const auth = new Auth(authOptionsWithNoUserPoolId);
			const errorMessage = new NoUserPoolError(
				AuthErrorTypes.MissingAuthConfig
			);

			expect.assertions(2);
			expect(auth.forgotPassword('username').then()).rejects.toThrow(
				NoUserPoolError
			);
			expect(auth.forgotPassword('username').then()).rejects.toEqual(
				errorMessage
			);

			spyon.mockClear();
		});

		test('no username', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'forgotPassword');

			const auth = new Auth(authOptions);

			expect.assertions(1);
			try {
				await auth.forgotPassword(null);
			} catch (e) {
				expect(e).not.toBeNull();
			}
			spyon.mockClear();
		});
	});

	describe('forgotPasswordSubmit', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'confirmPassword');

			const auth = new Auth(authOptions);

			expect.assertions(1);
			expect(
				await auth.forgotPasswordSubmit('username', 'code', 'password')
			).toBeUndefined();

			spyon.mockClear();
		});

		test('happy case', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'confirmPassword');

			const auth = new Auth(authOptions);

			expect.assertions(1);
			expect(await auth.forgotPassword('username')).toBeUndefined();

			spyon.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'forgotPassword');
			const auth = new Auth(authOptionsWithClientMetadata);
			const username = 'username';
			const code = 'code';
			const password = 'password';

			await auth.forgotPasswordSubmit(username, code, password);

			expect(await CognitoUser.prototype.confirmPassword).toBeCalledWith(
				code,
				password,
				{
					onFailure: jasmine.any(Function),
					onSuccess: jasmine.any(Function),
				},
				{ foo: 'bar' }
			);
			spyon.mockClear();
		});

		test('happy case clientMetadata parameter', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'forgotPassword');
			const auth = new Auth(authOptionsWithClientMetadata);
			const username = 'username';
			const code = 'code';
			const password = 'password';

			await auth.forgotPasswordSubmit(username, code, password, {
				custom: 'value',
			});

			expect(await CognitoUser.prototype.confirmPassword).toBeCalledWith(
				code,
				password,
				{
					onFailure: jasmine.any(Function),
					onSuccess: jasmine.any(Function),
				},
				{ custom: 'value' }
			);
			spyon.mockClear();
		});

		test('confirmPassword failed', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'confirmPassword')
				.mockImplementationOnce((code, password, callback) => {
					callback.onFailure(new Error('err'));
				});

			const auth = new Auth(authOptions);

			expect.assertions(1);
			try {
				await auth.forgotPasswordSubmit('username', 'code', 'password');
			} catch (e) {
				expect(e).toEqual(new Error('err'));
			}

			spyon.mockClear();
		});

		test('no user pool in config', async () => {
			const auth = new Auth(authOptionsWithNoUserPoolId);
			const errorMessage = new NoUserPoolError(
				AuthErrorTypes.MissingAuthConfig
			);

			expect.assertions(2);
			expect(
				auth.forgotPasswordSubmit('username', 'code', 'password').then()
			).rejects.toThrow(NoUserPoolError);
			expect(
				auth.forgotPasswordSubmit('username', 'code', 'password').then()
			).rejects.toEqual(errorMessage);
		});

		test('no username', async () => {
			const auth = new Auth(authOptions);
			const errorMessage = new AuthError(AuthErrorTypes.EmptyUsername);

			expect.assertions(2);
			expect(
				auth.forgotPasswordSubmit(null, 'code', 'password').then()
			).rejects.toThrow(AuthError);
			expect(
				auth.forgotPasswordSubmit(null, 'code', 'password').then()
			).rejects.toEqual(errorMessage);
		});

		test('no code', async () => {
			const auth = new Auth(authOptions);
			const errorMessage = new AuthError(AuthErrorTypes.EmptyCode);

			expect.assertions(2);
			expect(
				auth.forgotPasswordSubmit('username', null, 'password').then()
			).rejects.toThrow(AuthError);
			expect(
				auth.forgotPasswordSubmit('username', null, 'password').then()
			).rejects.toEqual(errorMessage);
		});

		test('no password', async () => {
			const auth = new Auth(authOptions);
			const errorMessage = new AuthError(AuthErrorTypes.EmptyPassword);

			expect.assertions(2);
			expect(
				auth.forgotPasswordSubmit('username', 'code', null).then()
			).rejects.toThrow(AuthError);
			expect(
				auth.forgotPasswordSubmit('username', 'code', null).then()
			).rejects.toEqual(errorMessage);
		});
	});

	describe('currentUserInfo test', () => {
		test('happy case with aws or userpool source', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(Auth.prototype, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(user);
					});
				});

			const spyon2 = jest
				.spyOn(Auth.prototype, 'userAttributes')
				.mockImplementationOnce(() => {
					auth['credentials'] = {
						IdentityPoolId: 'identityPoolId',
						IdentityId: 'identityId',
					};
					auth['credentials']['identityId'] = 'identityId';
					return new Promise((res: any, rej) => {
						res([
							{ Name: 'email', Value: 'email' },
							{ Name: 'phone_number', Value: 'phone_number' },
							{ Name: 'email_verified', Value: 'false' },
							{ Name: 'phone_number_verified', Value: 'true' },
							{ Name: 'sub', Value: '123-456789' },
						]);
					});
				});

			const spyon3 = jest
				.spyOn(auth, 'currentCredentials')
				.mockImplementationOnce(() => {
					return Promise.resolve({
						identityId: 'identityId',
					} as any);
				});

			const spyon4 = jest
				.spyOn(Credentials, 'getCredSource')
				.mockImplementationOnce(() => {
					return 'aws';
				});

			expect.assertions(1);
			expect(await auth.currentUserInfo()).toEqual({
				username: 'username',
				id: 'identityId',
				attributes: {
					email: 'email',
					phone_number: 'phone_number',
					email_verified: false,
					phone_number_verified: true,
					sub: '123-456789',
				},
			});

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
			spyon4.mockClear();
		});

		test('return empty object if error happens', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(Auth.prototype, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res({
							username: 'username',
						});
					});
				});

			const spyon2 = jest
				.spyOn(Auth.prototype, 'userAttributes')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			const spyon3 = jest
				.spyOn(Auth.prototype, 'currentCredentials')
				.mockImplementationOnce(() => {
					return Promise.resolve({
						IdentityPoolId: 'identityPoolId',
						identityId: 'identityId',
					} as any);
				});

			const spyon4 = jest
				.spyOn(Credentials, 'getCredSource')
				.mockImplementationOnce(() => {
					return 'aws';
				});

			expect.assertions(1);
			expect(await auth.currentUserInfo()).toEqual({});

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
			spyon4.mockClear();
		});

		test('no current userpool user', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			auth['credentials_source'] = 'aws';

			const spyon = jest
				.spyOn(Auth.prototype, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(null);
					});
				});

			const spyon2 = jest
				.spyOn(Credentials, 'getCredSource')
				.mockImplementationOnce(() => {
					return 'aws';
				});

			expect.assertions(1);
			expect(await auth.currentUserInfo()).toBeNull();

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('federated user', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			auth['user'] = 'federated_user';

			const spyon = jest
				.spyOn(Credentials, 'getCredSource')
				.mockImplementationOnce(() => {
					return 'federated';
				});

			expect.assertions(1);
			expect(await auth.currentUserInfo()).toBe('federated_user');

			spyon.mockClear();
		});
	});

	describe('updateUserAttributes test', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);

			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const attributes = {
				email: 'email',
				phone_number: 'phone_number',
				sub: 'sub',
			};

			const spyon = jest
				.spyOn(Auth.prototype, 'userSession')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(session);
					});
				});

			expect.assertions(1);
			expect(await auth.updateUserAttributes(user, attributes)).toBe('SUCCESS');

			spyon.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'updateAttributes');
			const auth = new Auth(authOptionsWithClientMetadata);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			await auth.updateUserAttributes(user, {});

			expect(await CognitoUser.prototype.updateAttributes).toBeCalledWith(
				[],
				jasmine.any(Function),
				{ foo: 'bar' }
			);
			spyon.mockClear();
		});

		test('happy case clientMetadata parameter', async () => {
			const spyon = jest.spyOn(CognitoUser.prototype, 'updateAttributes');
			const auth = new Auth(authOptionsWithClientMetadata);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			await auth.updateUserAttributes(user, {}, { custom: 'value' });

			expect(await CognitoUser.prototype.updateAttributes).toBeCalledWith(
				[],
				jasmine.any(Function),
				{ custom: 'value' }
			);
			spyon.mockClear();
		});
	});

	describe('federatedSignIn test', () => {
		test('No Identity Pool and No User Pool', async () => {
			const options: AuthOptions = {};

			const auth = new Auth(options);

			let error;
			try {
				await auth.federatedSignIn(
					'google',
					{ token: 'token', expires_at: 1234 },
					{ name: 'username' }
				);
			} catch (e) {
				error = e;
			}

			expect(error).toEqual(
				new Error(
					'Federation requires either a User Pool or Identity Pool in config'
				)
			);
		});

		test('No User Pool', async () => {
			const options: AuthOptions = {};

			const auth = new Auth(options);

			let error;
			try {
				await auth.federatedSignIn();
			} catch (e) {
				error = e;
			}

			expect(error).toEqual(
				new Error(
					'Federation requires either a User Pool or Identity Pool in config'
				)
			);
		});

		test('Identity Pool Missing Tokens', async () => {
			const options: AuthOptions = {
				region: 'region',
				identityPoolId: 'awsCognitoIdentityPoolId',
			};

			const auth = new Auth(options);

			let error;
			try {
				await auth.federatedSignIn();
			} catch (e) {
				error = e;
			}

			expect(error).toEqual(
				new Error(
					'Federation with Identity Pools requires tokens passed as arguments'
				)
			);
		});

		test('Identity Pools Only', async () => {
			const options: AuthOptions = {
				region: 'region',
				identityPoolId: 'awsCognitoIdentityPoolId',
			};

			const auth = new Auth(options);
			let user = null;
			const spyon = jest
				.spyOn(Credentials, 'set')
				.mockImplementationOnce(() => {
					user = { name: 'username', email: 'xxx@email.com' };
					return Promise.resolve('cred' as any);
				});
			const spyon2 = jest
				.spyOn(Auth.prototype, 'currentAuthenticatedUser')
				.mockImplementation(() => {
					if (!user) return Promise.reject('error');
					else return Promise.resolve(user);
				});

			await auth.federatedSignIn(
				'google',
				{ token: 'token', expires_at: 1234 },
				{ name: 'username' }
			);

			expect(spyon).toBeCalled();
			expect(spyon2).toBeCalled();
			spyon.mockClear();
			spyon2.mockClear();
		});

		test('User Pools Only', async () => {
			const urlOpener = jest.fn();

			const options: AuthOptions = {
				region: 'region',
				userPoolId: 'userPoolId',
				oauth: {
					domain: 'mydomain.auth.us-east-1.amazoncognito.com',
					scope: ['aws.cognito.signin.user.admin'],
					redirectSignIn: 'http://localhost:3000/',
					redirectSignOut: 'http://localhost:3000/',
					responseType: 'code',
					urlOpener,
				},
			};

			const auth = new Auth(options);

			const spyon3 = jest.spyOn(OAuth.prototype, 'oauthSignIn');

			await auth.federatedSignIn();

			expect(spyon3).toBeCalled();
			spyon3.mockClear();
			expect(urlOpener).toBeCalled();
		});

		test('User Pools and Identity Pools', async () => {
			const urlOpener = jest.fn();

			const options: AuthOptions = {
				region: 'region',
				identityPoolId: 'awsCognitoIdentityPoolId',
				userPoolId: 'userPoolId',
				oauth: {
					domain: 'mydomain.auth.us-east-1.amazoncognito.com',
					scope: ['aws.cognito.signin.user.admin'],
					redirectSignIn: 'http://localhost:3000/',
					redirectSignOut: 'http://localhost:3000/',
					responseType: 'code',
					urlOpener,
				},
			};

			const auth = new Auth(options);

			const spyon3 = jest.spyOn(OAuth.prototype, 'oauthSignIn');

			let user = null;
			const spyon = jest
				.spyOn(Credentials, 'set')
				.mockImplementationOnce(() => {
					user = { name: 'username', email: 'xxx@email.com' };
					return Promise.resolve('cred' as any);
				});
			const spyon2 = jest
				.spyOn(Auth.prototype, 'currentAuthenticatedUser')
				.mockImplementation(() => {
					if (!user) return Promise.reject('error');
					else return Promise.resolve(user);
				});

			await auth.federatedSignIn(
				'google',
				{ token: 'token', expires_at: 1234 },
				{ name: 'username' }
			);

			expect(spyon).toBeCalled();
			expect(spyon2).toBeCalled();
			spyon.mockClear();
			spyon2.mockClear();

			expect(spyon3).not.toBeCalled();
			spyon3.mockClear();
			expect(urlOpener).not.toBeCalled();
		});
	});

	describe('handleAuthResponse test', () => {
		beforeAll(() => {
			jest
				.spyOn(Auth.prototype, 'currentAuthenticatedUser')
				.mockImplementation(() => {
					throw new Error('no user logged in');
				});

			jest
				.spyOn(StorageHelper.prototype, 'getStorage')
				.mockImplementation(() => {
					return {
						setItem() {
							return null;
						},
					};
				});
		});

		test('User Pools Code Flow', async () => {
			const options: AuthOptions = {
				region: 'region',
				userPoolId: 'userPoolId',
				oauth: {
					domain: 'mydomain.auth.us-east-1.amazoncognito.com',
					scope: ['aws.cognito.signin.user.admin'],
					redirectSignIn: 'http://localhost:3000/',
					redirectSignOut: 'http://localhost:3000/',
					responseType: 'code',
				},
			};

			const auth = new Auth(options);

			const handleAuthResponseSpy = jest
				.spyOn(OAuth.prototype, 'handleAuthResponse')
				.mockReturnValueOnce({ idToken: '' } as any);
			jest
				.spyOn(CognitoUserSession.prototype, 'getIdToken')
				.mockReturnValueOnce({ decodePayload: () => ({}) } as any);
			jest.spyOn(Credentials, 'set').mockImplementationOnce(c => c);
			(auth as any).createCognitoUser = jest.fn(() => ({
				getUsername: jest.fn(),
				setSignInUserSession: jest.fn(),
			}));
			// Mock to help assert invocation order of other spies
			const trackSpies = jest.fn();
			const replaceStateSpy = jest
				.spyOn(window.history, 'replaceState')
				.mockImplementation((stateObj, title, url) => {
					trackSpies(
						`window.history.replaceState(${JSON.stringify(
							stateObj
						)}, ${JSON.stringify(title)}, '${url}')`
					);
					return this;
				});
			const hubSpy = jest
				.spyOn(Hub, 'dispatch')
				.mockImplementation((channel, { event }) =>
					// payload.data isn't necessary for tracking order of dispatch events
					trackSpies(
						`Hub.dispatch('${channel}', { data: ..., event: '${event}' })`
					)
				);

			const code = 'XXXX-YYY-ZZZ';
			const state = 'STATEABC';
			const url = `${
				(options.oauth as AwsCognitoOAuthOpts).redirectSignIn
			}?code=${code}&state=${state}`;

			(oauthStorage.getState as jest.Mock<any>).mockReturnValueOnce(state);
			await (auth as any)._handleAuthResponse(url);

			expect(handleAuthResponseSpy).toHaveBeenCalledWith(url);
			expect(replaceStateSpy).toHaveBeenCalledWith(
				{},
				null,
				(options.oauth as AwsCognitoOAuthOpts).redirectSignIn
			);

			// replaceState should be called *prior* to `signIn` dispatch,
			// so that customers can override with a new value
			expect(trackSpies.mock.calls).toMatchInlineSnapshot(`
			Array [
			  Array [
			    "Hub.dispatch('auth', { data: ..., event: 'parsingCallbackUrl' })",
			  ],
			  Array [
			    "window.history.replaceState({}, null, 'http://localhost:3000/')",
			  ],
			  Array [
			    "Hub.dispatch('auth', { data: ..., event: 'signIn' })",
			  ],
			  Array [
			    "Hub.dispatch('auth', { data: ..., event: 'cognitoHostedUI' })",
			  ],
			]
		`);
		});

		test('User Pools Implicit Flow', async () => {
			const options: AuthOptions = {
				region: 'region',
				userPoolId: 'userPoolId',
				oauth: {
					domain: 'mydomain.auth.us-east-1.amazoncognito.com',
					scope: ['aws.cognito.signin.user.admin'],
					redirectSignIn: 'http://localhost:3000/',
					redirectSignOut: 'http://localhost:3000/',
					responseType: 'token',
				},
			};

			const auth = new Auth(options);

			const handleAuthResponseSpy = jest
				.spyOn(OAuth.prototype, 'handleAuthResponse')
				.mockReturnValueOnce({ idToken: '' } as any);
			jest
				.spyOn(CognitoUserSession.prototype, 'getIdToken')
				.mockReturnValueOnce({ decodePayload: () => ({}) } as any);
			jest.spyOn(Credentials, 'set').mockImplementationOnce(c => c);
			(auth as any).createCognitoUser = jest.fn(() => ({
				getUsername: jest.fn(),
				setSignInUserSession: jest.fn(),
			}));
			const replaceStateSpy = jest
				.spyOn(window.history, 'replaceState')
				.mockReturnThis();

			const token = 'XXXX.YYY.ZZZ';
			const state = 'STATEABC';
			const url = `${
				(options.oauth as AwsCognitoOAuthOpts).redirectSignIn
			}#access_token=${token}&state=${state}`;

			await (auth as any)._handleAuthResponse(url);

			expect(handleAuthResponseSpy).toHaveBeenCalledWith(url);
			expect(replaceStateSpy).toHaveBeenCalledWith(
				{},
				null,
				(options.oauth as AwsCognitoOAuthOpts).redirectSignIn
			);
		});

		test('No User Pools', async () => {
			const urlOpener = jest.fn();

			const options: AuthOptions = {};

			const auth = new Auth(options);

			let error;
			try {
				await (auth as any)._handleAuthResponse(' ');
			} catch (e) {
				error = e;
			}

			expect(error).toEqual(
				new Error('OAuth responses require a User Pool defined in config')
			);
		});

		test('User Pools and Identity Pools', async () => {
			const options: AuthOptions = {
				region: 'region',
				userPoolId: 'userPoolId',
				oauth: {
					domain: 'mydomain.auth.us-east-1.amazoncognito.com',
					scope: ['aws.cognito.signin.user.admin'],
					redirectSignIn: 'http://localhost:3000/',
					redirectSignOut: 'http://localhost:3000/',
					responseType: 'code',
				},
				identityPoolId: 'awsCognitoIdentityPoolId',
			};

			const auth = new Auth(options);

			const handleAuthResponseSpy = jest
				.spyOn(OAuth.prototype, 'handleAuthResponse')
				.mockReturnValueOnce({ idToken: '' } as any);
			jest
				.spyOn(CognitoUserSession.prototype, 'getIdToken')
				.mockReturnValueOnce({ decodePayload: () => ({}) } as any);
			jest.spyOn(Credentials, 'set').mockImplementationOnce(c => c);
			(auth as any).createCognitoUser = jest.fn(() => ({
				getUsername: jest.fn(),
				setSignInUserSession: jest.fn(),
			}));
			const replaceStateSpy = jest
				.spyOn(window.history, 'replaceState')
				.mockReturnThis();

			const code = 'XXXX-YYY-ZZZ';
			const url = `${
				(options.oauth as AwsCognitoOAuthOpts).redirectSignIn
			}?code=${code}`;
			await (auth as any)._handleAuthResponse(url);

			expect(handleAuthResponseSpy).toHaveBeenCalledWith(url);
			expect(replaceStateSpy).toHaveBeenCalledWith(
				{},
				null,
				(options.oauth as AwsCognitoOAuthOpts).redirectSignIn
			);
		});
	});

	describe('verifiedContact test', () => {
		test('happy case with unverified', async () => {
			const spyon = jest
				.spyOn(Auth.prototype, 'userAttributes')
				.mockImplementationOnce(() => {
					return new Promise((res: any, rej) => {
						res([
							{
								Name: 'email',
								Value: 'email@amazon.com',
							},
							{
								Name: 'phone_number',
								Value: '+12345678901',
							},
						]);
					});
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect(await auth.verifiedContact(user)).toEqual({
				unverified: { email: 'email@amazon.com', phone_number: '+12345678901' },
				verified: {},
			});

			spyon.mockClear();
		});

		test('happy case with verified', async () => {
			const spyon = jest
				.spyOn(Auth.prototype, 'userAttributes')
				.mockImplementationOnce(() => {
					return new Promise((res: any, rej) => {
						res([
							{
								Name: 'email',
								Value: 'email@amazon.com',
							},
							{
								Name: 'phone_number',
								Value: '+12345678901',
							},
							{
								Name: 'email_verified',
								Value: true,
							},
							{
								Name: 'phone_number_verified',
								Value: true,
							},
						]);
					});
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect(await auth.verifiedContact(user)).toEqual({
				unverified: {},
				verified: { email: 'email@amazon.com', phone_number: '+12345678901' },
			});

			spyon.mockClear();
		});

		test('happy case with verified as strings', async () => {
			const spyon = jest
				.spyOn(Auth.prototype, 'userAttributes')
				.mockImplementationOnce(() => {
					return new Promise((res: any, rej) => {
						res([
							{
								Name: 'email',
								Value: 'email@amazon.com',
							},
							{
								Name: 'phone_number',
								Value: '+12345678901',
							},
							{
								Name: 'email_verified',
								Value: 'true',
							},
							{
								Name: 'phone_number_verified',
								Value: 'True',
							},
						]);
					});
				});

			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			expect(await auth.verifiedContact(user)).toEqual({
				unverified: {},
				verified: { email: 'email@amazon.com', phone_number: '+12345678901' },
			});

			spyon.mockClear();
		});
	});

	describe('currentUserPoolUser test', () => {
		test('happy case', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
				.mockImplementation(() => {
					return user;
				});
			const spyon2 = jest
				.spyOn(CognitoUser.prototype, 'getSession')
				.mockImplementation((callback: any) => {
					return callback(null, session);
				});

			const spyon3 = jest
				.spyOn(CognitoUser.prototype, 'getUserData')
				.mockImplementationOnce((callback: any) => {
					const data = {
						PreferredMfaSetting: 'SMS',
						UserAttributes: [{ Name: 'address', Value: 'xxxx' }],
					};
					callback(null, data);
				});

			const spyon4 = jest
				.spyOn(CognitoUserSession.prototype, 'getAccessToken')
				.mockImplementationOnce(() => {
					return new CognitoAccessToken({ AccessToken: 'accessToken' });
				});

			const spyon5 = jest
				.spyOn(CognitoAccessToken.prototype, 'decodePayload')
				.mockImplementation(() => {
					return { scope: USER_ADMIN_SCOPE };
				});

			expect.assertions(1);
			expect(await auth.currentUserPoolUser()).toBe(
				Object.assign(user, {
					attributes: {
						address: 'xxxx',
					},
					preferredMFA: 'SMS',
				})
			);

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
			spyon4.mockClear();
			spyon5.mockClear();
		});

		test('no current user', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
				.mockImplementation(() => {
					return null;
				});

			expect.assertions(1);
			try {
				await auth.currentUserPoolUser();
			} catch (e) {
				expect(e).toBe('No current user');
			}

			spyon.mockClear();
		});

		test('No userPool in config', async () => {
			const auth = new Auth(authOptionsWithNoUserPoolId);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const errorMessage = new NoUserPoolError(AuthErrorTypes.MissingAuthConfig);

			expect.assertions(2);
			expect(auth.currentUserPoolUser().then()).rejects.toThrow(
				NoUserPoolError
			);
			expect(auth.currentUserPoolUser().then()).rejects.toEqual(errorMessage);
		});

		test('get session error', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
				.mockImplementation(() => {
					return user;
				});
			const spyon2 = jest
				.spyOn(CognitoUser.prototype, 'getSession')
				.mockImplementation((callback: any) => {
					return callback('err', null);
				});

			const spyon3 = jest.spyOn(CognitoUser.prototype, 'getUserData');

			expect.assertions(2);
			try {
				await auth.currentUserPoolUser();
			} catch (e) {
				expect(e).toBe('err');
				expect(spyon3).not.toBeCalled();
			}

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
		});

		test('get user data error because of user is deleted or disabled', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
				.mockImplementation(() => {
					return user;
				});
			const spyon2 = jest
				.spyOn(CognitoUser.prototype, 'getSession')
				.mockImplementation((callback: any) => {
					return callback(null, session);
				});
			const spyon3 = jest
				.spyOn(CognitoUser.prototype, 'getUserData')
				.mockImplementationOnce((callback: any) => {
					callback(
						{
							message: 'User is disabled.',
						},
						null
					);
				});

			const spyon4 = jest
				.spyOn(CognitoUserSession.prototype, 'getAccessToken')
				.mockImplementationOnce(() => {
					return new CognitoAccessToken({ AccessToken: 'accessToken' });
				});

			const spyon5 = jest
				.spyOn(CognitoAccessToken.prototype, 'decodePayload')
				.mockImplementation(() => {
					return { scope: USER_ADMIN_SCOPE };
				});

			expect.assertions(1);
			try {
				await auth.currentUserPoolUser();
			} catch (e) {
				expect(e).toEqual({
					message: 'User is disabled.',
				});
			}

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
			spyon4.mockClear();
			spyon5.mockClear();
		});

		test('bypass the error if the user is not deleted or disabled', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
				.mockImplementation(() => {
					return user;
				});
			const spyon2 = jest
				.spyOn(CognitoUser.prototype, 'getSession')
				.mockImplementation((callback: any) => {
					return callback(null, session);
				});
			const spyon3 = jest
				.spyOn(CognitoUser.prototype, 'getUserData')
				.mockImplementationOnce((callback: any) => {
					callback(
						{
							message: 'other error',
						},
						null
					);
				});

			const spyon4 = jest
				.spyOn(CognitoUserSession.prototype, 'getAccessToken')
				.mockImplementationOnce(() => {
					return new CognitoAccessToken({ AccessToken: 'accessToken' });
				});

			const spyon5 = jest
				.spyOn(CognitoAccessToken.prototype, 'decodePayload')
				.mockImplementation(() => {
					return { scope: USER_ADMIN_SCOPE };
				});

			expect.assertions(1);

			expect(await auth.currentUserPoolUser()).toEqual(user);

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
			spyon4.mockClear();
			spyon5.mockClear();
		});

		test('directly return the user if no permission(scope) to get the user data', async () => {
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			const spyon = jest
				.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
				.mockImplementation(() => {
					return user;
				});
			const spyon2 = jest
				.spyOn(CognitoUser.prototype, 'getSession')
				.mockImplementation((callback: any) => {
					return callback(null, session);
				});

			const spyon3 = jest
				.spyOn(CognitoUser.prototype, 'getUserData')
				.mockImplementationOnce((callback: any) => {
					const data = {
						PreferredMfaSetting: 'SMS',
						UserAttributes: [{ Name: 'address', Value: 'xxxx' }],
					};
					callback(null, data);
				});

			const spyon4 = jest
				.spyOn(CognitoUserSession.prototype, 'getAccessToken')
				.mockImplementationOnce(() => {
					return new CognitoAccessToken({ AccessToken: 'accessToken' });
				});

			const spyon5 = jest
				.spyOn(CognitoAccessToken.prototype, 'decodePayload')
				.mockImplementation(() => {
					return { scope: '' };
				});

			expect.assertions(2);
			expect(spyon3).not.toBeCalled();
			expect(await auth.currentUserPoolUser()).toBe(user);

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
			spyon4.mockClear();
			spyon5.mockClear();
		});
	});

	describe('sendCustomChallengeAnswer', () => {
		test('happy case', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'sendCustomChallengeAnswer')
				.mockImplementationOnce((challengeResponses, callback) => {
					callback.onSuccess(session);
				});
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const userAfterCustomChallengeAnswer = Object.assign(
				new CognitoUser({
					Username: 'username',
					Pool: userPool,
				}),
				{
					challengeName: 'CUSTOM_CHALLENGE',
					challengeParam: 'challengeParam',
				}
			);

			const spyon2 = jest
				.spyOn(auth, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return Promise.resolve(user);
				});

			expect.assertions(1);
			expect(
				await auth.sendCustomChallengeAnswer(
					userAfterCustomChallengeAnswer,
					'challengeResponse'
				)
			).toEqual(user);

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('happy case clientMetadata default', async () => {
			const auth = new Auth(authOptionsWithClientMetadata);

			const spyon = jest.spyOn(
				CognitoUser.prototype,
				'sendCustomChallengeAnswer'
			);
			const spyon2 = jest
				.spyOn(auth, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return Promise.resolve(user);
				});
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			await auth.sendCustomChallengeAnswer(user, 'answer');

			expect(
				await CognitoUser.prototype.sendCustomChallengeAnswer
			).toBeCalledWith('answer', authCallbacks, { foo: 'bar' });
			spyon.mockClear();
		});

		test('happy case clientMetadata parameter', async () => {
			const auth = new Auth(authOptionsWithClientMetadata);

			const spyon = jest.spyOn(
				CognitoUser.prototype,
				'sendCustomChallengeAnswer'
			);
			const spyon2 = jest
				.spyOn(auth, 'currentUserPoolUser')
				.mockImplementationOnce(() => {
					return Promise.resolve(user);
				});
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});

			await auth.sendCustomChallengeAnswer(user, 'answer', { custom: 'value' });

			expect(
				await CognitoUser.prototype.sendCustomChallengeAnswer
			).toBeCalledWith('answer', authCallbacks, { custom: 'value' });
			spyon.mockClear();
		});

		test('customChallenge', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'sendCustomChallengeAnswer')
				.mockImplementationOnce((challengeResponses, callback) => {
					callback.customChallenge('challengeParam');
				});
			const auth = new Auth(authOptions);
			const user = new CognitoUser({
				Username: 'username',
				Pool: userPool,
			});
			const userAfterCustomChallengeAnswer = Object.assign(
				new CognitoUser({
					Username: 'username',
					Pool: userPool,
				}),
				{
					challengeName: 'CUSTOM_CHALLENGE',
					challengeParam: 'challengeParam',
				}
			);

			expect.assertions(1);
			expect(
				await auth.sendCustomChallengeAnswer(
					userAfterCustomChallengeAnswer,
					'challengeResponse'
				)
			).toEqual(userAfterCustomChallengeAnswer);

			spyon.mockClear();
		});

		test('onFailure', async () => {
			const spyon = jest
				.spyOn(CognitoUser.prototype, 'sendCustomChallengeAnswer')
				.mockImplementationOnce((challengeResponses, callback) => {
					callback.onFailure('err');
				});

			const auth = new Auth(authOptions);
			const userAfterCustomChallengeAnswer = Object.assign(
				new CognitoUser({
					Username: 'username',
					Pool: userPool,
				}),
				{
					challengeName: 'CUSTOM_CHALLENGE',
					challengeParam: 'challengeParam',
				}
			);

			expect.assertions(1);
			try {
				await auth.sendCustomChallengeAnswer(
					userAfterCustomChallengeAnswer,
					'challengeResponse'
				);
			} catch (e) {
				expect(e).toBe('err');
			}

			spyon.mockClear();
		});

		test('no userPool', async () => {
			const spyon = jest.spyOn(
				CognitoUser.prototype,
				'sendCustomChallengeAnswer'
			);

			const auth = new Auth(authOptionsWithNoUserPoolId);
			const userAfterCustomChallengeAnswer = Object.assign(
				new CognitoUser({
					Username: 'username',
					Pool: userPool,
				}),
				{
					challengeName: 'CUSTOM_CHALLENGE',
					challengeParam: 'challengeParam',
				}
			);
			const errorMessage = new NoUserPoolError(
				AuthErrorTypes.MissingAuthConfig
			);

			expect.assertions(2);
			expect(
				auth
					.sendCustomChallengeAnswer(
						userAfterCustomChallengeAnswer,
						'challengeResponse'
					)
					.then()
			).rejects.toThrow(AuthError);

			expect(
				auth
					.sendCustomChallengeAnswer(
						userAfterCustomChallengeAnswer,
						'challengeResponse'
					)
					.then()
			).rejects.toEqual(errorMessage);

			spyon.mockClear();
		});
	});
});
