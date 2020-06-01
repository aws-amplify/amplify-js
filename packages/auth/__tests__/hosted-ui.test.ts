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

import { Hub } from '@aws-amplify/core';

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

describe('Hosted UI tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('hosted UI in progress, signIn success', done => {
		const auth = new Auth(authOptionsWithOAuth);
		const user = new CognitoUser({
			Username: 'username',
			Pool: userPool,
		});
		const spyon = jest
			.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
			.mockImplementationOnce(() => {
				return user;
			});
		const spyon2 = jest
			.spyOn(CognitoUser.prototype, 'getSession')
			.mockImplementation(callback => {
				return callback(null, session);
			});

		const spyon3 = jest
			.spyOn(CognitoUser.prototype, 'getUserData')
			.mockImplementationOnce(callback => {
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

		auth.oAuthFlowInProgress = true;

		auth.currentUserPoolUser().then(resUser => {
			expect(resUser).toEqual(user);
			expect(spyon).toBeCalledTimes(1);
			done();
		});

		setTimeout(() => {
			Hub.dispatch('auth', {
				event: 'cognitoHostedUI',
			});
		}, 0);
	});
});
