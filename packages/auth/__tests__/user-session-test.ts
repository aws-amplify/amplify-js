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
	ISignUpResult,
} from 'amazon-cognito-identity-js';

const MAX_DEVICES: number = 60;

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
	CognitoUser.prototype.deleteAttributes = (attributeList, callback) => {
		callback(null, 'SUCCESS');
	};
	CognitoUser.prototype.deleteUser = (callback, {}) => {
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

	CognitoUser.prototype.setUserMfaPreference = (
		smsMfaSettings,
		softwareTokenMfaSettings,
		callback
	) => {
		callback(null, 'success');
	};

	CognitoUser.prototype.getCachedDeviceKeyAndPassword = () => {
		return 'success';
	};
	CognitoUser.prototype.setDeviceStatusRemembered = callback => {
		callback.onSuccess('success');
	};
	CognitoUser.prototype.forgetDevice = callback => {
		callback.onSuccess('success');
	};
	CognitoUser.prototype.listDevices = (limit, paginationToken, callback) => {
		callback.onSuccess('success');
	};
	CognitoUser.prototype.setSignInUserSession = session => {};

	return CognitoUser;
});

const createMockLocalStorage = () =>
	({
		_items: {},
		getItem(key: string) {
			return this._items[key];
		},
		setItem(key: string, value: string) {
			this._items[key] = value;
		},
		clear() {
			this._items = {};
		},
		removeItem(key: string) {
			delete this._items[key];
		},
	} as unknown as Storage);

import { AuthOptions, SignUpParams, AwsCognitoOAuthOpts } from '../src/types';
import { AuthClass as Auth } from '../src/Auth';
import { BrowserStorageCache as Cache } from '@aws-amplify/cache';
import {
	Credentials,
	GoogleOAuth,
	StorageHelper,
	ICredentials,
	Hub,
} from '@aws-amplify/core';
import { AuthError, NoUserPoolError } from '../src/Errors';
import { AuthErrorTypes } from '../src/types/Auth';
import { mockDeviceArray, transformedMockData } from './mockData';

const authOptions: AuthOptions = {
	userPoolId: 'awsUserPoolsId',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
};

const authOptionsWithHostedUIConfig: AuthOptions = {
	userPoolId: 'awsUserPoolsId',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
	oauth: {
		domain: 'https://myHostedUIDomain.com',
		scope: [
			'phone',
			'email',
			'openid',
			'profile',
			'aws.cognito.signin.user.admin',
		],
		redirectSignIn: 'http://localhost:3000/',
		redirectSignOut: 'http://localhost:3000/',
		responseType: 'code',
	},
};
const authOptionConfirmationLink: AuthOptions = {
	userPoolId: 'awsUserPoolsId',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
	signUpVerificationMethod: 'link',
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

const signUpResult: ISignUpResult = {
	user: null,
	userConfirmed: true,
	userSub: 'userSub',
	codeDeliveryDetails: null,
};

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

describe('userSession test', () => {
	test('debouncer happy case', async () => {
		const spyon = jest
			.spyOn(CognitoUser.prototype, 'getSession')
			.mockImplementation((callback: any) => {
				callback(null, session);
			});

		const auth = new Auth(authOptions);
		const user = new CognitoUser({
			Username: 'username',
			Pool: userPool,
		});

		expect.assertions(2);
		const promiseArr = Array.from({ length: 10 }, () => auth.userSession(user));
		const [result] = await Promise.all(promiseArr);
		expect(spyon).toHaveBeenCalledTimes(1);
		expect(result).toBeInstanceOf(CognitoUserSession);
		spyon.mockClear();
	});
});
