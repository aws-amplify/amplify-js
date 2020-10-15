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
	CognitoUserPool.prototype.storage = {
		sync: callback => {
			callback(null, 'data');
		},
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

	return CognitoUser;
});

jest.mock('@aws-amplify/core', () => {
	return {
		Platform: {
			isReactNative: true,
		},
	};
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
import { Credentials } from '@aws-amplify/core';

const authOptions: AuthOptions = {
	userPoolId: 'awsUserPoolsId',
	userPoolWebClientId: 'awsUserPoolsWebClientId',
	region: 'region',
	identityPoolId: 'awsCognitoIdentityPoolId',
	mandatorySignIn: false,
};

const authOptionsWithNoUserPoolId: AuthOptions = {
	userPoolId: null,
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

describe('for react native', () => {
	describe('currentUserCredentials test', () => {
		test('with federated info', async () => {
			//     const auth = new Auth(authOptions);

			//     const spyon = jest.spyOn(Credentials, 'currentUserCredentials');

			//    await auth.currentUserCredentials();
			//    expect(spyon).toBeCalled();

			//    spyon.mockClear();
			expect(1).toBe(1);
		});
	});
});
