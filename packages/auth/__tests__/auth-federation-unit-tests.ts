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

function mockGAPI({ reloadAuthResponse }: { reloadAuthResponse: Function }) {
	(global as any).window.gapi = {
		auth2: {
			getAuthInstance: () =>
				new Promise(res =>
					res({
						currentUser: {
							get: () => ({
								isSignedIn: () => true,
								reloadAuthResponse,
							}),
						},
					})
				),
		},
	};
}

function clearMockGAPI() {
	(global as any).window.gapi = undefined;
}

function mockFB({ getLoginStatus }: { getLoginStatus: Function }) {
	(global as any).window.FB = {
		getLoginStatus,
	};
}

function clearMockFB() {
	(global as any).window.FB = undefined;
}

function expiredCreds(provider) {
	return {
		provider,
		token: 'token',
		expires_at: new Date().getTime() - 1000 * 60 * 60 * 24 * 2,
	};
}

const DEFAULT_RETRY_TIMEOUT = 60000;

import { AuthOptions } from '../src/types';
import { AuthClass as Auth } from '../src/Auth';
import {
	Credentials,
	StorageHelper,
	NonRetryableError,
} from '@aws-amplify/core';

const authOptions: AuthOptions = {
	userPoolId: 'awsUserPoolsId',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
};

describe('auth federation unit test', () => {
	describe('currentUserCredentials test', () => {
		test(
			'with expired google federated info - network error retries',
			async () => {
				const maxRetries = 3;
				let count = 0;

				const reloadAuthResponse = () =>
					new Promise((res, rej) => {
						count++;
						if (count < maxRetries) {
							rej({
								error: 'network_error',
							});
						} else {
							res({
								id_token: 'token',
								expires_at: new Date().getTime(),
							});
						}
					});
				mockGAPI({ reloadAuthResponse });

				const getAuthInstanceSpy = jest.spyOn(
					(global as any).window.gapi.auth2,
					'getAuthInstance'
				);

				const storageSpy = jest
					.spyOn(StorageHelper.prototype, 'getStorage')
					.mockImplementation(() => {
						return {
							setItem() {},
							getItem() {
								return JSON.stringify(expiredCreds('google'));
							},
							removeItem() {},
						};
					});

				const credsSpy = jest
					.spyOn(Credentials, <any>'_setCredentialsFromFederation')
					.mockImplementationOnce(() => {
						return Promise.resolve('cred');
					});

				const auth = new Auth(authOptions);

				expect.assertions(2);
				expect(await auth.currentUserCredentials()).toBe('cred');
				expect(getAuthInstanceSpy).toHaveBeenCalledTimes(maxRetries);

				storageSpy.mockClear();
				credsSpy.mockClear();
				getAuthInstanceSpy.mockClear();
				clearMockGAPI();
			},
			DEFAULT_RETRY_TIMEOUT
		);

		test(
			'with expired facebook federated info - no retries success',
			async () => {
				const getLoginStatus = (callback: Function) => {
					callback({
						authResponse: {
							accessToken: 'token',
							expiresIn: new Date().getTime(),
						},
					});
				};

				mockFB({ getLoginStatus });

				const getAuthInstanceSpy = jest.spyOn(
					(global as any).window.FB,
					'getLoginStatus'
				);

				const spyon = jest
					.spyOn(StorageHelper.prototype, 'getStorage')
					.mockImplementation(() => {
						return {
							setItem() {},
							getItem() {
								return JSON.stringify(expiredCreds('facebook'));
							},
							removeItem() {},
						};
					});

				const spyon2 = jest
					.spyOn(Credentials, <any>'_setCredentialsFromFederation')
					.mockImplementationOnce(() => {
						return Promise.resolve('cred');
					});

				const auth = new Auth(authOptions);

				expect.assertions(2);
				expect(await auth.currentUserCredentials()).toBe('cred');
				expect(getAuthInstanceSpy).toHaveBeenCalledTimes(1);

				spyon.mockClear();
				spyon2.mockClear();
				getAuthInstanceSpy.mockClear();
				clearMockFB();
			},
			DEFAULT_RETRY_TIMEOUT
		);

		test('with expired google federated info - clear creds if invalid response from provider', async () => {
			const reloadAuthResponse = () =>
				new Promise((res, rej) => {
					rej({
						error: new NonRetryableError('Invalid google auth response'),
					});
				});
			mockGAPI({ reloadAuthResponse });

			const getAuthInstanceSpy = jest.spyOn(
				(global as any).window.gapi.auth2,
				'getAuthInstance'
			);

			const storageSpy = jest
				.spyOn(StorageHelper.prototype, 'getStorage')
				.mockImplementation(() => {
					return {
						setItem() {},
						getItem() {
							return JSON.stringify(expiredCreds('google'));
						},
						removeItem() {},
					};
				});

			const credsClearSpy = jest
				.spyOn(Credentials, 'clear')
				.mockImplementation();

			const auth = new Auth(authOptions);

			try {
				await auth.currentUserCredentials();
			} catch {
				expect.assertions(2);
				expect(getAuthInstanceSpy).toHaveBeenCalledTimes(1);
				expect(credsClearSpy).toHaveBeenCalledTimes(1);

				storageSpy.mockClear();
				getAuthInstanceSpy.mockClear();
				credsClearSpy.mockClear();
				clearMockGAPI();
			}
		});

		test('with expired facebook federated info - clear creds if invalid response from provider', async () => {
			const getLoginStatus = (callback: Function) => {
				callback({
					authResponse: {
						accessToken: null,
					},
				});
			};

			mockFB({ getLoginStatus });

			const getAuthInstanceSpy = jest.spyOn(
				(global as any).window.FB,
				'getLoginStatus'
			);

			const storageSpy = jest
				.spyOn(StorageHelper.prototype, 'getStorage')
				.mockImplementation(() => {
					return {
						setItem() {},
						getItem() {
							return JSON.stringify(expiredCreds('facebook'));
						},
						removeItem() {},
					};
				});
			const credsClearSpy = jest
				.spyOn(Credentials, 'clear')
				.mockImplementation();

			const auth = new Auth(authOptions);

			try {
				await auth.currentUserCredentials();
			} catch {
				expect.assertions(2);
				expect(getAuthInstanceSpy).toHaveBeenCalledTimes(1);
				expect(credsClearSpy).toHaveBeenCalledTimes(1);
				storageSpy.mockClear();
				getAuthInstanceSpy.mockClear();
				credsClearSpy.mockClear();
				clearMockFB();
			}
		});
	});
});
