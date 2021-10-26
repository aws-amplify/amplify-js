import {
	CognitoUser,
	CognitoUserPool,
	CognitoUserSession,
	CognitoAccessToken,
	CognitoIdToken,
} from 'amazon-cognito-identity-js';

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

	CognitoUser.prototype.signOut = callback => {
		if (callback && typeof callback === 'function') {
			callback();
		}
	};

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

import { Hub, Credentials, StorageHelper, JS } from '@aws-amplify/core';

const authOptionsWithOAuth: AuthOptions = {
	userPoolId: 'awsUserPoolsId',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
	oauth: {
		domain: 'xxxxxxxxxxxx-xxxxxx-xxx.auth.us-west-2.amazoncognito.com',
		scope: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
		redirectSignIn: 'http://localhost:4200/',
		redirectSignOut: 'http://localhost:4200/',
		responseType: 'code',
	},
};

const userPool = new CognitoUserPool({
	UserPoolId: authOptionsWithOAuth.userPoolId,
	ClientId: authOptionsWithOAuth.userPoolWebClientId,
});

const idToken = new CognitoIdToken({ IdToken: 'idToken' });
const accessToken = new CognitoAccessToken({ AccessToken: 'accessToken' });

const session = new CognitoUserSession({
	IdToken: idToken,
	AccessToken: accessToken,
});

import { AuthClass as Auth } from '../src/Auth';
import { AuthOptions } from '../src/types';

describe('Hosted UI tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	test('hosted UI in progress, signIn success', done => {
		const auth = new Auth(authOptionsWithOAuth);
		const user = new CognitoUser({
			Username: 'username',
			Pool: userPool,
		});
		const spyonGetCurrentUser = jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});
		jest
			.spyOn(CognitoUser.prototype, 'getSession')
			.mockImplementation((callback: any) => {
				return callback(null, session);
			});

		jest
			.spyOn(CognitoUser.prototype, 'getUserData')
			.mockImplementationOnce((callback: any) => {
				const data = {
					PreferredMfaSetting: 'SMS',
					UserAttributes: [{ Name: 'address', Value: 'xxxx' }],
				};
				callback(null, data);
			});

		jest
			.spyOn(CognitoUserSession.prototype, 'getAccessToken')
			.mockImplementationOnce(() => {
				return new CognitoAccessToken({ AccessToken: 'accessToken' });
			});

		jest
			.spyOn(CognitoAccessToken.prototype, 'decodePayload')
			.mockImplementation(() => {
				return { scope: '' };
			});

		expect.assertions(2);

		(auth as any).oAuthFlowInProgress = true;

		auth.currentUserPoolUser().then(resUser => {
			expect(resUser).toEqual(user);
			expect(spyonGetCurrentUser).toBeCalledTimes(1);
			done();
		});

		setTimeout(() => {
			Hub.dispatch('auth', {
				event: 'cognitoHostedUI',
			});
		}, 0);
	});

	test('globalSignOut hosted ui on browser, timeout reject', async () => {
		jest.spyOn(StorageHelper.prototype, 'getStorage').mockImplementation(() => {
			return {
				setItem() {},
				getItem() {
					return 'true';
				},
				removeItem() {},
			};
		});

		jest.spyOn(JS, 'browserOrNode').mockImplementation(() => ({
			isBrowser: true,
			isNode: false,
		}));

		const auth = new Auth(authOptionsWithOAuth);

		const user = new CognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});

		const spyGlobalSignOut = jest
			.spyOn(CognitoUser.prototype, 'globalSignOut')
			.mockImplementation(({ onSuccess }) => {
				onSuccess('success');
			});

		(auth as any)._oAuthHandler = {
			signOut: () => {
				// testing timeout
				return new Promise(() => {});
			},
		};

		expect.assertions(2);

		try {
			await auth.signOut({ global: true });
		} catch (err) {
			expect(err).toEqual('Signout timeout fail');
		}

		expect(spyGlobalSignOut).toBeCalled();
	});
	test('globalSignOut hosted ui on node, resolve undefined', async () => {
		jest.spyOn(StorageHelper.prototype, 'getStorage').mockImplementation(() => {
			return {
				setItem() {},
				getItem() {
					return 'true';
				},
				removeItem() {},
			};
		});

		jest.spyOn(JS, 'browserOrNode').mockImplementation(() => ({
			isBrowser: false,
			isNode: true,
		}));

		const auth = new Auth(authOptionsWithOAuth);

		const user = new CognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});

		const spyGlobalSignOut = jest
			.spyOn(CognitoUser.prototype, 'globalSignOut')
			.mockImplementation(({ onSuccess }) => {
				onSuccess('success');
			});

		(auth as any)._oAuthHandler = {
			signOut: () => {
				// testing timeout
				return new Promise(() => {});
			},
		};

		expect.assertions(2);

		const result = await auth.signOut({ global: true });
		expect(result).toBe(undefined);

		expect(spyGlobalSignOut).toBeCalled();
	});

	test('SignOut hosted ui on node, resolve undefined', async () => {
		jest.spyOn(StorageHelper.prototype, 'getStorage').mockImplementation(() => {
			return {
				setItem() {},
				getItem() {
					return 'true';
				},
				removeItem() {},
			};
		});

		jest.spyOn(JS, 'browserOrNode').mockImplementation(() => ({
			isBrowser: false,
			isNode: true,
		}));

		const auth = new Auth(authOptionsWithOAuth);

		const user = new CognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});

		(auth as any)._oAuthHandler = {
			signOut: () => {
				// testing timeout
				return new Promise(() => {});
			},
		};

		expect.assertions(1);

		const signoutResult = await auth.signOut({ global: false }); // return undefined on node
		expect(signoutResult).toBe(undefined);
	});

	test('SignOut hosted ui on WebBrowser, timeout reject', async () => {
		jest.spyOn(StorageHelper.prototype, 'getStorage').mockImplementation(() => {
			return {
				setItem() {},
				getItem() {
					return 'true';
				},
				removeItem() {},
			};
		});

		jest.spyOn(JS, 'browserOrNode').mockImplementation(() => ({
			isBrowser: true,
			isNode: false,
		}));

		const auth = new Auth(authOptionsWithOAuth);

		const user = new CognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});

		(auth as any)._oAuthHandler = {
			signOut: () => {
				// testing timeout
				return new Promise(() => {});
			},
		};

		expect.assertions(1);

		try {
			await auth.signOut({ global: false });
		} catch (err) {
			expect(err).toEqual('Signout timeout fail');
		}
	});

	test('globalSignOut hosted ui, url opener', done => {
		jest.spyOn(StorageHelper.prototype, 'getStorage').mockImplementation(() => {
			return {
				setItem() {},
				getItem() {
					return 'true';
				},
				removeItem() {},
			};
		});

		const urlOpener = jest.fn(
			(url: string, redirectUrl: string): Promise<any> => {
				return new Promise(() => {
					return new Promise(() => {
						expect(url).toEqual(
							'https://xxxxxxxxxxxx-xxxxxx-xxx.auth.us-west-2.amazoncognito.com/logout?client_id=awsUserPoolsWebClientId&logout_uri=http%3A%2F%2Flocalhost%3A4200%2F'
						);

						done();
					});
				});
			}
		);
		const options = {
			...authOptionsWithOAuth,
		};
		options.oauth.urlOpener = urlOpener;

		const auth = new Auth(options);

		const user = new CognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});

		expect.assertions(1);

		auth.signOut({ global: true });
	});

	test('SignOut hosted ui, urlOpener', done => {
		jest.spyOn(StorageHelper.prototype, 'getStorage').mockImplementation(() => {
			return {
				setItem() {},
				getItem() {
					return 'true';
				},
				removeItem() {},
			};
		});

		const urlOpener = jest.fn(
			(url: string): Promise<any> => {
				return new Promise(() => {
					expect(url).toEqual(
						'https://xxxxxxxxxxxx-xxxxxx-xxx.auth.us-west-2.amazoncognito.com/logout?client_id=awsUserPoolsWebClientId&logout_uri=http%3A%2F%2Flocalhost%3A4200%2F'
					);

					done();
				});
			}
		);
		const options = {
			...authOptionsWithOAuth,
		};
		options.oauth.urlOpener = urlOpener;

		const auth = new Auth(options);

		const user = new CognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});

		expect.assertions(1);

		auth.signOut({ global: true });
	});
});
