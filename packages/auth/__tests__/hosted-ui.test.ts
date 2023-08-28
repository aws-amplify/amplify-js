import {
	CognitoUserSession,
	CognitoAccessToken,
	CognitoIdToken,
} from 'amazon-cognito-identity-js';

import {
	InternalCognitoUser,
	InternalCognitoUserPool,
} from 'amazon-cognito-identity-js/internals';

jest.mock('amazon-cognito-identity-js/internals', () => {
	const InternalCognitoUser = () => {};

	InternalCognitoUser.prototype.InternalCognitoUser = options => {
		InternalCognitoUser.prototype.options = options;
		return InternalCognitoUser;
	};

	InternalCognitoUser.prototype.getSession = callback => {
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

	InternalCognitoUser.prototype.signOut = callback => {
		if (callback && typeof callback === 'function') {
			callback();
		}
	};

	InternalCognitoUser.prototype.globalSignOut = callback => {
		callback.onSuccess();
	};

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

	InternalCognitoUser.prototype.setAuthenticationFlowType = type => {};

	InternalCognitoUser.prototype.initiateAuth = (
		authenticationDetails,
		callback
	) => {
		callback.customChallenge('challengeParam');
	};

	InternalCognitoUser.prototype.sendCustomChallengeAnswer = (
		challengeAnswer,
		callback
	) => {
		callback.onSuccess('session');
	};

	InternalCognitoUser.prototype.refreshSession = (refreshToken, callback) => {
		callback(null, 'session');
	};

	InternalCognitoUser.prototype.getUsername = () => {
		return 'username';
	};

	InternalCognitoUser.prototype.getUserData = callback => {
		callback(null, 'data');
	};

	const InternalCognitoUserPool = () => {};

	InternalCognitoUserPool.prototype.InternalCognitoUserPool = options => {
		InternalCognitoUserPool.prototype.options = options;
		return InternalCognitoUserPool;
	};

	InternalCognitoUserPool.prototype.getCurrentUser = () => {
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

	InternalCognitoUserPool.prototype.signUp = (
		username,
		password,
		signUpAttributeList,
		validationData,
		callback,
		clientMetadata
	) => {
		callback(null, 'signUpResult');
	};

	return {
		...jest.requireActual('amazon-cognito-identity-js/internals'),
		InternalCognitoUser,
		InternalCognitoUserPool,
	};
});

import * as AmplifyCore from '@aws-amplify/core';
const { Hub, Credentials, StorageHelper } = AmplifyCore;

// Mock the module to ensure that setters are available for spying
jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
}));

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

const userPool = new InternalCognitoUserPool({
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
import { InternalAuthClass } from '../src/internals/InternalAuth';
import { AuthOptions } from '../src/types';

describe('Hosted UI tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	test('hosted UI in progress, signIn success', done => {
		const internalAuth = new InternalAuthClass(authOptionsWithOAuth);
		const auth = new Auth(internalAuth);
		const user = new InternalCognitoUser({
			Username: 'username',
			Pool: userPool,
		});
		const spyonGetCurrentUser = jest
			.spyOn(InternalCognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});
		jest
			.spyOn(InternalCognitoUser.prototype, 'getSession')
			.mockImplementation((callback: any) => {
				return callback(null, session);
			});

		jest
			.spyOn(InternalCognitoUser.prototype, 'getUserData')
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

		(internalAuth as any).oAuthFlowInProgress = true;

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

		jest.spyOn(AmplifyCore, 'browserOrNode').mockImplementation(() => ({
			isBrowser: true,
			isNode: false,
		}));

		const internalAuth = new InternalAuthClass(authOptionsWithOAuth);
		const auth = new Auth(internalAuth);

		const user = new InternalCognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(InternalCognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});

		const spyGlobalSignOut = jest
			.spyOn(InternalCognitoUser.prototype, 'globalSignOut')
			.mockImplementation(({ onSuccess }) => {
				onSuccess('success');
			});

		(internalAuth as any)._oAuthHandler = {
			signOut: () => {
				// testing timeout
				return new Promise(() => {});
			},
		};

		expect.assertions(2);

		await expect(auth.signOut({ global: true })).rejects.toThrowError(
			'Signout timeout fail'
		);

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

		jest.spyOn(AmplifyCore, 'browserOrNode').mockImplementation(() => ({
			isBrowser: false,
			isNode: true,
		}));

		const internalAuth = new InternalAuthClass(authOptionsWithOAuth);
		const auth = new Auth(internalAuth);

		const user = new InternalCognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(InternalCognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});

		const spyGlobalSignOut = jest
			.spyOn(InternalCognitoUser.prototype, 'globalSignOut')
			.mockImplementation(({ onSuccess }) => {
				onSuccess('success');
			});

		(internalAuth as any)._oAuthHandler = {
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

		jest.spyOn(AmplifyCore, 'browserOrNode').mockImplementation(() => ({
			isBrowser: false,
			isNode: true,
		}));

		const internalAuth = new InternalAuthClass(authOptionsWithOAuth);
		const auth = new Auth(internalAuth);

		const user = new InternalCognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(InternalCognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});

		(internalAuth as any)._oAuthHandler = {
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

		jest.spyOn(AmplifyCore, 'browserOrNode').mockImplementation(() => ({
			isBrowser: true,
			isNode: false,
		}));

		const internalAuth = new InternalAuthClass(authOptionsWithOAuth);
		const auth = new Auth(internalAuth);

		const user = new InternalCognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(InternalCognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});

		(internalAuth as any)._oAuthHandler = {
			signOut: () => {
				// testing timeout
				return new Promise(() => {});
			},
		};

		expect.assertions(1);

		await expect(auth.signOut({ global: false })).rejects.toThrowError(
			'Signout timeout fail'
		);
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

		const auth = new Auth(new InternalAuthClass(options));

		const user = new InternalCognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(InternalCognitoUserPool.prototype, 'getCurrentUser')
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

		const urlOpener = jest.fn((url: string): Promise<any> => {
			return new Promise(() => {
				expect(url).toEqual(
					'https://xxxxxxxxxxxx-xxxxxx-xxx.auth.us-west-2.amazoncognito.com/logout?client_id=awsUserPoolsWebClientId&logout_uri=http%3A%2F%2Flocalhost%3A4200%2F'
				);

				done();
			});
		});
		const options = {
			...authOptionsWithOAuth,
		};
		options.oauth.urlOpener = urlOpener;

		const auth = new Auth(new InternalAuthClass(options));

		const user = new InternalCognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
			return Promise.resolve();
		});

		jest
			.spyOn(InternalCognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});

		expect.assertions(1);

		auth.signOut({ global: true });
	});
});
