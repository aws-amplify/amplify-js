import CognitoUser from '../src/CognitoUser';

import CognitoUserPool from '../src/CognitoUserPool';
import AuthenticationDetails from '../src/AuthenticationDetails';
import AuthenticationHelper from '../src/AuthenticationHelper';
import Client from '../src/Client';

import {
	clientId,
	userPoolId,
	authDetailData,
	vCognitoUserSession,
	deviceName,
	totpCode,
	ivCognitoUserSession,
} from './constants';

const minimalData = { UserPoolId: userPoolId, ClientId: clientId };
const cognitoUserPool = new CognitoUserPool(minimalData);
const userDefaults = {
	Username: 'username',
	Pool: cognitoUserPool,
};

describe('CognitoUser constructor', () => {
	test('constructor throws error when bad (or no) data is passed', () => {
		const errorMsg = 'Username and Pool information are required.';

		// no data at all
		expect(() => {
			new CognitoUser({});
		}).toThrow(errorMsg);

		// missing Pool
		expect(() => {
			new CognitoUser({
				Username: 'username',
				Pool: null,
			});
		}).toThrow(errorMsg);

		// missing Username
		expect(() => {
			new CognitoUser({
				Username: null,
				Pool: userPoolId,
			});
		}).toThrow(errorMsg);
	});

	test('happy case constructor', () => {
		const spyon = jest.spyOn(cognitoUserPool, 'getClientId');

		expect(() => {
			new CognitoUser({ ...userDefaults });
		}).not.toThrowError();

		expect(spyon).toBeCalled();
	});
});

describe('getters and setters', () => {
	const user = new CognitoUser({ ...userDefaults });

	test('get and set SignInUserSession', () => {
		// initial state
		expect(user.getSignInUserSession()).toEqual(null);

		// setting explicitly
		user.setSignInUserSession(vCognitoUserSession);
		expect(user.signInUserSession).toEqual(vCognitoUserSession);

		// getter after set explicitly
		expect(user.getSignInUserSession()).toEqual(vCognitoUserSession);
	});

	test('getUsername()', () => {
		expect(user.getUsername()).toEqual(user.username);
	});

	test('get and set authenticationFlowType', () => {
		// initial state
		expect(user.getAuthenticationFlowType()).toEqual('USER_SRP_AUTH');

		// setting explicitly
		user.setAuthenticationFlowType('TEST_FLOW_TYPE');

		// getter after set explicitly
		expect(user.getAuthenticationFlowType()).toEqual('TEST_FLOW_TYPE');
	});
});

describe('initiateAuth()', () => {
	const callback = {
		onFailure: jest.fn(),
		onSuccess: jest.fn(),
		customChallenge: jest.fn(),
	};

	let user;
	beforeEach(() => {
		user = new CognitoUser({ ...userDefaults });
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.onFailure.mockClear();
		callback.onSuccess.mockClear();
		callback.customChallenge.mockClear();
	});

	test('Client request called once and throws an error', async () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			const err = new Error('Test error');
			args[2](err, {});
		});

		const authDetails = new AuthenticationDetails(authDetailData);
		user.initiateAuth(authDetails, callback);

		expect(callback.onFailure.mock.calls.length).toBe(1);
		expect(callback.onSuccess.mock.calls.length).toBe(0);
	});

	test('Client request called once with challenge name and params', async () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null, {
				ChallengeName: 'CUSTOM_CHALLENGE',
				Session: vCognitoUserSession,
				ChallengeParameters: 'Custom challenge params',
			});
		});

		const authDetails = new AuthenticationDetails(authDetailData);
		user.initiateAuth(authDetails, callback);

		expect(user.Session).toMatchObject(vCognitoUserSession);
		expect(callback.customChallenge.mock.calls.length).toBe(1);
		expect(callback.customChallenge).toBeCalledWith('Custom challenge params');
	});

	test('Client request sets signInUserSession and is successful', async () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null, { AuthenticationResult: 'great success' });
		});

		const getCognitoUserSessionSpy = jest.spyOn(user, 'getCognitoUserSession');
		const cacheTokensSpy = jest.spyOn(user, 'cacheTokens');

		const authDetails = new AuthenticationDetails(authDetailData);
		user.initiateAuth(authDetails, callback);

		expect(getCognitoUserSessionSpy).toBeCalledWith('great success');
		expect(cacheTokensSpy).toBeCalled();
		expect(callback.onSuccess.mock.calls.length).toBe(1);
	});
});

describe('authenticateUser()', () => {
	afterAll(() => {
		jest.restoreAllMocks();
	});

	const user = new CognitoUser({ ...userDefaults });
	const authDetails = new AuthenticationDetails(authDetailData);
	const callback = {
		onFailure: jest.fn(),
	};

	test('USER_PASSWORD_AUTH flow type', () => {
		const spyon = jest.spyOn(user, 'authenticateUserPlainUsernamePassword');

		user.setAuthenticationFlowType('USER_PASSWORD_AUTH');
		user.authenticateUser(authDetails, callback);

		expect(spyon).toHaveBeenCalledWith(authDetails, callback);
	});

	test('USER_SRP_AUTH and CUSTOM_AUTH flow types', () => {
		const spyon = jest.spyOn(user, 'authenticateUserDefaultAuth');

		user.setAuthenticationFlowType('USER_SRP_AUTH');
		user.authenticateUser(authDetails, callback);

		expect(spyon).toHaveBeenCalledWith(authDetails, callback);

		user.setAuthenticationFlowType('CUSTOM_AUTH');
		user.authenticateUser(authDetails, callback);

		expect(spyon).toHaveBeenCalledWith(authDetails, callback);
	});

	test('throws error for invalid Authentication flow type', () => {
		user.setAuthenticationFlowType('WRONG_AUTH_FLOW_TYPE');
		user.authenticateUser(authDetails, callback);
		expect(callback.onFailure.mock.calls.length).toBe(1);
	});
});

describe('authenticateUserDefaultAuth()', () => {
	const user = new CognitoUser({ ...userDefaults });
	const authDetails = new AuthenticationDetails(authDetailData);
	const callback = {
		onFailure: jest.fn(),
		customChallenge: jest.fn(),
	};

	afterEach(() => {
		jest.restoreAllMocks();
		callback.onFailure.mockClear();
		callback.customChallenge.mockClear();
	});

	test('Happy case default initialization process', () => {
		expect(() => {
			user.authenticateUserDefaultAuth(authDetails, callback);
		}).not.toThrowError();
	});

	test('errOnAValue fails gracefully', () => {
		jest
			.spyOn(AuthenticationHelper.prototype, 'getLargeAValue')
			.mockImplementation(cb => cb('test error', 12345));

		user.authenticateUserDefaultAuth(authDetails, callback);

		expect(callback.onFailure.mock.calls.length).toBe(1);
		expect(callback.onFailure).toBeCalledWith('test error');
	});

	test('Client request fails gracefully', () => {
		const err = new Error('Test error');
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](err, {});
		});

		user.authenticateUserDefaultAuth(authDetails, callback);

		expect(callback.onFailure).toBeCalledWith(err);
	});

	// TODO: gotta come back to this one...
	test.skip('this.client.request(InitiateAuth', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null, {
				ChallengeName: 'CUSTOM_CHALLENGE',
				Session: vCognitoUserSession,
				ChallengeParameters: {
					USER_ID_FOR_SRP: 'abc123',
					SRP_B: 'abc123',
					SALT: 'abc123',
				},
			});
			jest
				.spyOn(AuthenticationHelper.prototype, 'getPasswordAuthenticationKey')
				.mockImplementation((...args) => {
					console.log({ args });
				});
			// expect(spy).toBeCalled();
		});

		user.authenticateUserDefaultAuth(authDetails, callback);

		// expect(callback.customChallenge.mock.calls.length).toBe(1);
		// expect(callback.customChallenge).toBeCalledWith('Custom challenge params');
	});
});

describe('authenticateUserPlainUsernamePassword()', () => {
	const user = new CognitoUser({ ...userDefaults });
	const callback = {
		onFailure: jest.fn(),
	};

	afterEach(() => {
		jest.restoreAllMocks();
		callback.onFailure.mockClear();
	});

	test('Missing password throws an error', () => {
		const authDetails = new AuthenticationDetails({
			Username: 'user@amzn.com',
			Password: undefined,
		});

		user.authenticateUserPlainUsernamePassword(authDetails, callback);

		expect(callback.onFailure).toBeCalledWith(
			new Error('PASSWORD parameter is required')
		);
	});

	test('Client request fails gracefully', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2]('test error', {});
		});

		const authDetails = new AuthenticationDetails(authDetailData);

		user.authenticateUserPlainUsernamePassword(authDetails, callback);

		expect(callback.onFailure.mock.calls.length).toBe(1);
		expect(callback.onFailure).toBeCalledWith('test error');
	});

	test('Authenticate user happy case', () => {
		const userSpy = jest.spyOn(user, 'getCachedDeviceKeyAndPassword');
		const userSpy2 = jest.spyOn(user, 'getUserContextData');
		userSpy2.mockReturnValue(true);
		const userSpy3 = jest.spyOn(user, 'authenticateUserInternal');
		userSpy3.mockReturnValue('test return value');

		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null, 'test auth result');
		});

		const authDetails = new AuthenticationDetails(authDetailData);
		user.authenticateUserPlainUsernamePassword(authDetails, callback);

		expect(userSpy).toBeCalled();
		expect(userSpy3).toBeCalledWith(
			'test auth result',
			userSpy3.mock.calls[0][1],
			callback
		);
		// TODO: not sure this test holds water
		expect(userSpy3.mock.results[0].value).toBe('test return value');
	});
});

describe('authenticateUserInternal()', () => {
	const user = new CognitoUser({ ...userDefaults });
	const callback = {
		onSuccess: jest.fn(),
		onFailure: jest.fn(),
		mfaRequired: jest.fn(),
		selectMFAType: jest.fn(),
		mfaSetup: jest.fn(),
		totpRequired: jest.fn(),
		customChallenge: jest.fn(),
		newPasswordRequired: jest.fn(),
	};

	// same approach as used in CognitoUser.js
	const authHelper = new AuthenticationHelper(
		user.pool.getUserPoolId().split('_')[1]
	);

	const authData = Object.assign(vCognitoUserSession, {
		ChallengeParameters: {
			userAttributes: '[]',
			requiredAttributes: '[]',
		},
		AuthenticationResult: {
			NewDeviceMetadata: {
				DeviceGroupKey: 'abc123',
				DeviceKey: '123abc',
			},
		},
		Session: vCognitoUserSession,
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test.each([
		['SMS_MFA', callback.mfaRequired],
		['SELECT_MFA_TYPE', callback.selectMFAType],
		['MFA_SETUP', callback.mfaSetup],
		['SOFTWARE_TOKEN_MFA', callback.totpRequired],
		['CUSTOM_CHALLENGE', callback.customChallenge],
	])(
		'%s challenge sets user session and calls the corresponding cb',
		(challengeName, cbMethod) => {
			Object.assign(authData, { ChallengeName: challengeName });

			user.authenticateUserInternal(authData, authHelper, callback);

			expect(user.Session).toMatchObject(vCognitoUserSession);

			if (challengeName === 'CUSTOM_CHALLENGE') {
				// this cb signature only expects one arg
				expect(cbMethod).toHaveBeenCalledWith(authData.ChallengeParameters);
			} else {
				// the rest expect two args
				expect(cbMethod).toHaveBeenCalledWith(
					challengeName,
					authData.ChallengeParameters
				);
			}

			// clear the respective mock
			cbMethod.mockClear();
		}
	);

	test('user and required attributes get parsed and call newPasswordRequired', () => {
		Object.assign(authData, { ChallengeName: 'NEW_PASSWORD_REQUIRED' });

		expect(user.Session).toMatchObject(vCognitoUserSession);

		const spyon = jest.spyOn(
			authHelper,
			'getNewPasswordRequiredChallengeUserAttributePrefix'
		);
		user.authenticateUserInternal(authData, authHelper, callback);
		expect(spyon).toHaveBeenCalledTimes(1);
		expect(callback.newPasswordRequired).toHaveBeenCalledTimes(1);
		callback.newPasswordRequired.mockClear();
	});

	test('DEVICE_SRP_AUTH calls getDeviceResponse and returns undefined', () => {
		Object.assign(authData, { ChallengeName: 'DEVICE_SRP_AUTH' });

		const spyon = jest.spyOn(user, 'getDeviceResponse');

		user.authenticateUserInternal(authData, authHelper, callback);

		expect(spyon).toHaveBeenCalledTimes(1);

		// TODO: test that user.authenticateUserInternal() returns undefined (line 507)
		spyon.mockClear();
	});

	test('All other challenge names trigger method calls and success cb', () => {
		Object.assign(authData, {
			AuthenticationResult: {
				NewDeviceMetadata: null,
			},
			ChallengeName: 'random challenge',
		});

		const spyon = jest.spyOn(user, 'getCognitoUserSession');
		const spyon2 = jest.spyOn(user, 'cacheTokens');

		user.authenticateUserInternal(authData, authHelper, callback);

		expect(user.challengeName).toBe(authData.ChallengeName);
		expect(spyon).toHaveBeenCalledWith(authData.AuthenticationResult);
		expect(spyon2).toBeCalledTimes(1);

		const signInUserSession = user.getCognitoUserSession(
			authData.AuthenticationResult
		);
		expect(callback.onSuccess).toBeCalledWith(signInUserSession);

		spyon.mockClear();
		spyon2.mockClear();
		callback.onSuccess.mockClear();
	});

	test('AuthHelper generateHashDevice is called and can log errors properly', () => {
		Object.assign(authData, {
			AuthenticationResult: {
				NewDeviceMetadata: {
					DeviceGroupKey: 'abc123',
					DeviceKey: '123abc',
				},
			},
			ChallengeName: 'random challenge',
		});

		const err = new Error('Very critical and descriptive error.');

		const spyon = jest
			.spyOn(AuthenticationHelper.prototype, 'generateHashDevice')
			.mockImplementation((...args) => {
				args[2](err);
			});

		user.authenticateUserInternal(authData, authHelper, callback);

		expect(spyon).toBeCalledTimes(1);
		expect(callback.onFailure).toBeCalledWith(err);

		spyon.mockClear();
		callback.onFailure.mockClear();
	});

	test('AuthHelper generateHashDevice with no error calls auth methods', () => {
		const spyon1 = jest.spyOn(
			AuthenticationHelper.prototype,
			'getRandomPassword'
		);
		const spyon2 = jest.spyOn(
			AuthenticationHelper.prototype,
			'getVerifierDevices'
		);
		const spyon3 = jest.spyOn(
			AuthenticationHelper.prototype,
			'getRandomPassword'
		);

		user.authenticateUserInternal(authData, authHelper, callback);

		expect(spyon1).toBeCalledTimes(1);
		expect(spyon2).toBeCalledTimes(1);
		expect(spyon3).toBeCalledTimes(1);

		spyon1.mockClear();
		spyon2.mockClear();
		spyon3.mockClear();
	});

	test('Client request fails gracefully', () => {
		const err = new Error('Client request error.');

		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](err, {});
			});

		user.authenticateUserInternal(authData, authHelper, callback);

		expect(callback.onFailure).toBeCalledWith(err);

		callback.onFailure.mockClear();
	});

	test('Successful client request passes data properly to cb', () => {
		const spyon = jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {
					UserConfirmationNecessary: true,
				});
			});

		user.authenticateUserInternal(authData, authHelper, callback);

		expect(callback.onSuccess).toBeCalledWith(user.signInUserSession, true);

		spyon.mockClear();
		callback.onSuccess.mockClear();

		const spyon2 = jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {});
			});

		user.authenticateUserInternal(authData, authHelper, callback);

		expect(callback.onSuccess).toBeCalledWith(user.signInUserSession);

		spyon2.mockClear();
		callback.onSuccess.mockClear();
	});
});

describe('Testing verify Software Token with a signed in user', () => {
	const minimalData = { UserPoolId: userPoolId, ClientId: clientId };
	const cognitoUserPool = new CognitoUserPool(minimalData);
	const cognitoUser = new CognitoUser({
		Username: 'username',
		Pool: cognitoUserPool,
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});
	test('Verify Software Token Happy case', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {});
			});
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {});
			});

		const callback = {
			onSuccess: jest.fn(),
		};

		cognitoUser.verifySoftwareToken(totpCode, deviceName, callback);
		expect(callback.onSuccess.mock.calls.length).toBe(1);
	});

	test('Verify software token first callback fails', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'), null);
			});

		const callback = {
			onFailure: jest.fn(),
		};

		cognitoUser.verifySoftwareToken(totpCode, deviceName, callback);
		expect(callback.onFailure.mock.calls.length).toBe(1);
	});
	test('Verify Software Token second callback fails', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {});
			});
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Request Access Error'), null);
			});

		const callback = {
			onFailure: jest.fn(),
		};

		cognitoUser.verifySoftwareToken(totpCode, deviceName, callback);
		expect(callback.onFailure.mock.calls.length).toBe(1);
	});
});

describe('Verify Software Token with an invalid signin user session', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });

	test('Happy case for non-signed in user session', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {});
			});
		const callback = {
			onSuccess: jest.fn(),
		};

		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.verifySoftwareToken(totpCode, deviceName, callback);
		expect(callback.onSuccess.mock.calls.length).toBe(1);
	});

	test('Error case for non-signed in user session', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Client Error'), null);
			});
		const callback = {
			onFailure: jest.fn(),
		};

		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.verifySoftwareToken(totpCode, deviceName, callback);
		expect(callback.onFailure.mock.calls.length).toBe(1);
	});
});

describe('Testing Associate Software Token', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });

	const callback = {
		associateSecretCode: jest.fn(),
		onFailure: jest.fn(),
	};

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.associateSecretCode.mockClear();
		callback.onFailure.mockClear();
	});

	test('Happy path for associate software token without a userSession ', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {});
			});

		cognitoUser.associateSoftwareToken(callback);
		expect(callback.associateSecretCode.mock.calls.length).toBe(1);
	});

	test('Failing in the first requeset to client', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'), null);
			});

		cognitoUser.associateSoftwareToken(callback);
		expect(callback.onFailure.mock.calls.length).toBe(1);
	});
	test('Happy path for a user with a validUserSession ', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {});
			});

		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.associateSoftwareToken(callback);

		expect(callback.associateSecretCode.mock.calls.length).toBe(1);
	});
	test('Error path for a user with a validUserSession ', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'), null);
			});

		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.associateSoftwareToken(callback);

		expect(callback.onFailure.mock.calls.length).toBe(1);
	});
});

describe('sendMFASelectionAnswer()', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });

	const callback = {
		mfaRequired: jest.fn(),
		onFailure: jest.fn(),
		totpRequired: jest.fn(),
	};

	afterAll(() => {
		jest.restoreAllMocks();
	});

	test('happy case with SMS_MFA', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, { Session: 'sessionData' });
			});
		cognitoUser.sendMFASelectionAnswer('SMS_MFA', callback);
		expect(callback.mfaRequired.mock.calls.length).toEqual(1);
	});

	test('happy case with software token MFA', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, { Session: 'sessionData' });
			});
		cognitoUser.sendMFASelectionAnswer('SOFTWARE_TOKEN_MFA', callback);
		expect(callback.totpRequired.mock.calls.length).toEqual(1);
	});

	test('error case with software token MFA', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'), null);
			});
		cognitoUser.sendMFASelectionAnswer('SOFTWARE_TOKEN_MFA', callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});
	test('error case with undefined answer challenge', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, { Session: 'sessionData' });
			});
		const res = cognitoUser.sendMFASelectionAnswer('WRONG_CHALLENGE', callback);
		expect(res).toEqual(undefined);
	});
});

describe('Signout and globalSignOut', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });

	const callback = {
		onSuccess: jest.fn(),
		onFailure: jest.fn(),
	};
	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.onSuccess.mockClear();
		callback.onFailure.mockClear();
	});

	test('signOut expected to set signinUserSession to equal null', () => {
		cognitoUser.signOut();
		expect(cognitoUser.signInUserSession).toEqual(null);
	});

	test('global signOut Happy Path', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2]();
			});
		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.globalSignOut(callback);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('global signOut catching an error', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network error'));
			});
		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.globalSignOut(callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('Global signout when user session is null', () => {
		cognitoUser.signInUserSession = null;
		cognitoUser.globalSignOut(callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('client request does not have a callback', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2]();
			});
		cognitoUser.setSignInUserSession(vCognitoUserSession);
		expect(cognitoUser.globalSignOut(callback)).toEqual(undefined);
	});
});

describe('List devices test suite', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });

	const callback = {
		onSuccess: jest.fn(),
		onFailure: jest.fn(),
	};

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.onSuccess.mockClear();
		callback.onFailure.mockClear();
	});

	test('Happy path for device list', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null, ['deviceName', 'device2Name']);
		});
		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.listDevices(1, 'paginationToken', callback);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('Client request throws an error', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](new Error('network error'), null);
		});
		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.listDevices(1, null, callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});
	test('Invalid userSession throws an error', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.listDevices(1, null, callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('Valid userSession but no return from client.request returns undefined', () => {
		cognitoUser.setSignInUserSession(vCognitoUserSession);
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2]();
		});
		expect(cognitoUser.listDevices(1, null, callback)).toEqual(undefined);
	});
});

describe('Include unit tests for setDeviceStatus[remembered,notRemembered]', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	const callback = {
		onSuccess: jest.fn(),
		onFailure: jest.fn(),
	};

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.onSuccess.mockClear();
		callback.onFailure.mockClear();
	});

	test('Happy path should callback success', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null);
		});

		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.setDeviceStatusNotRemembered(callback);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('Callback catches an error from client request', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](new Error('Network Error'));
		});

		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.setDeviceStatusNotRemembered(callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('Invalid user session throws an error', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.setDeviceStatusNotRemembered(callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('Client request does not work and method returns undefined', () => {
		cognitoUser.setSignInUserSession(vCognitoUserSession);
		expect(cognitoUser.setDeviceStatusNotRemembered(callback)).toEqual(
			undefined
		);
	});

	test('Happy path for setDeviceStatusRemembered should callback with onSuccess ', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null);
		});

		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.setDeviceStatusRemembered(callback);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('Client throws and error should callback onFailure', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](new Error('Network Error'));
		});

		cognitoUser.setSignInUserSession(vCognitoUserSession);
		cognitoUser.setDeviceStatusRemembered(callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('Invalid user session throws an error', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.setDeviceStatusRemembered(callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('Client request does not work and method returns undefined', () => {
		cognitoUser.setSignInUserSession(vCognitoUserSession);
		expect(cognitoUser.setDeviceStatusRemembered(callback)).toEqual(undefined);
	});
});

describe('ForgetDevices test suite', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	cognitoUser.setSignInUserSession(vCognitoUserSession);
	const callback = {
		onSuccess: jest.fn(),
		onFailure: jest.fn(),
	};

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.onSuccess.mockClear();
		callback.onFailure.mockClear();
	});

	test('Forget specific device happy path should callback onSuccess', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null);
		});
		cognitoUser.forgetSpecificDevice('deviceKey', callback);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});
	test('Client request throws an error for forget specific device', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](new Error('Network Error'));
		});
		cognitoUser.forgetSpecificDevice('deviceKey', callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('Returns undefined when client request does not work properly', () => {
		expect(cognitoUser.forgetSpecificDevice('deviceKey', callback)).toEqual(
			undefined
		);
	});
	test('forgetSpecificDevice happy path should callback onSuccess', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2]();
		});
		cognitoUser.forgetDevice(callback);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});
	test('Invalid user session throws and error for forget specific device', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.forgetSpecificDevice('deviceKey', callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});
});

describe('getDevice()', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	cognitoUser.setSignInUserSession(vCognitoUserSession);
	const callback = {
		onSuccess: jest.fn(),
		onFailure: jest.fn(),
	};

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.onSuccess.mockClear();
		callback.onFailure.mockClear();
	});

	test('Happy path for getDevice should callback onSuccess', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null);
		});
		cognitoUser.getDevice(callback);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('client request returns an error and onFailure is called', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](new Error('Network Error'));
		});
		cognitoUser.getDevice(callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('No client request method implementations, return undefined', () => {
		expect(cognitoUser.getDevice(callback)).toEqual(undefined);
	});

	test('invalid user session should callback onFailure', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.getDevice(callback);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});
});

describe('verifyAttribute() and getAttributeVerificationCode', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	cognitoUser.setSignInUserSession(vCognitoUserSession);
	const callback = {
		onSuccess: jest.fn(),
		onFailure: jest.fn(),
		inputVerificationCode: jest.fn(),
	};
	const verifyAttributeDefaults = ['username', '123456', callback];

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.onSuccess.mockClear();
		callback.onFailure.mockClear();
		callback.inputVerificationCode.mockClear();
	});

	test('Happy path for verifyAttribute should callback onSuccess', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null);
		});
		cognitoUser.verifyAttribute(...verifyAttributeDefaults);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('client request returns an error and onFailure is called', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](new Error('Network Error'));
		});
		cognitoUser.verifyAttribute(...verifyAttributeDefaults);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('No client request method implementations, return undefined', () => {
		expect(cognitoUser.verifyAttribute(...verifyAttributeDefaults)).toEqual(
			undefined
		);
	});

	const getAttrsVerifCodeDefaults = ['username', callback, {}];
	test('happy path for getAttributeVerificationCode', () => {
		callback.inputVerificationCode = null;
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null);
		});
		cognitoUser.getAttributeVerificationCode(...getAttrsVerifCodeDefaults);
		callback.inputVerificationCode = jest.fn();
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('when inputVerificationCode exists in the callback, call inputVerifier with the data', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null);
		});

		cognitoUser.getAttributeVerificationCode(...getAttrsVerifCodeDefaults);
		expect(callback.inputVerificationCode.mock.calls.length).toEqual(1);
	});

	test('when inputVerificationCode exists in the callback, call inputVerifier with the data', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](new Error('Network error'));
		});

		cognitoUser.getAttributeVerificationCode(...getAttrsVerifCodeDefaults);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('invalid user session should callback onFailure for verifyAttributes', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.verifyAttribute(...verifyAttributeDefaults);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('invalid user session should callback onFailure for getAttrsVerifCodeDefaults', () => {
		cognitoUser.getAttributeVerificationCode(...getAttrsVerifCodeDefaults);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});
});

describe('confirmPassword() and forgotPassword()', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	cognitoUser.setSignInUserSession(vCognitoUserSession);
	const callback = {
		onSuccess: jest.fn(),
		onFailure: jest.fn(),
	};
	const confirmPasswordDefaults = [
		'confirmCode',
		'newSecurePassword',
		callback,
		{},
	];
	const forgotPasswordDefaults = [callback, {}];

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.onSuccess.mockClear();
		callback.onFailure.mockClear();
	});

	test('confirmPassword(): happy path should callback onSuccess', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null);
		});
		cognitoUser.confirmPassword(...confirmPasswordDefaults);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('confirmPassword():client request throws an error', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](new Error('Network error'));
		});
		cognitoUser.confirmPassword(...confirmPasswordDefaults);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('forgotPassword(): happy path should callback onSuccess', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null);
		});
		cognitoUser.forgotPassword(...forgotPasswordDefaults);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('forgotPassword(): inputVerification code is a function should callback inputVerificationCode', () => {
		callback.inputVerificationCode = jest.fn();
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null);
		});
		cognitoUser.forgotPassword(...forgotPasswordDefaults);
		expect(callback.inputVerificationCode.mock.calls.length).toEqual(1);
	});

	test('forgotPassword(): client returning an error should call onFailure', () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](new Error('Network error'));
		});
		cognitoUser.forgotPassword(...forgotPasswordDefaults);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});
});

describe('MFA test suite', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	cognitoUser.setSignInUserSession(vCognitoUserSession);
	const callback = {
		onSuccess: jest.fn(),
		onFailure: jest.fn(),
	};

	const sendMfaDefaults = ['abc123', callback, 'SMS_MFA', {}];

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.onSuccess.mockClear();
		callback.onFailure.mockClear();
	});

	/** sendMFA()  */
	test('Happy path for sendMFACode should call onSuccess', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {
					ChallengeName: 'SMS_MFA',
					AuthenticationResult: { NewDeviceMetadata: 'deviceMetaData' },
				});
			});
		jest
			.spyOn(AuthenticationHelper.prototype, 'generateHashDevice')
			.mockImplementationOnce((...args) => {
				args[2](null, null);
			});
		jest
			.spyOn(AuthenticationHelper.prototype, 'getSaltDevices')
			.mockImplementationOnce(() => {
				return 'deadbeef';
			});
		jest
			.spyOn(AuthenticationHelper.prototype, 'getVerifierDevices')
			.mockImplementationOnce(() => {
				return 'deadbeef';
			});
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, { UserConfirmationNecessary: false });
			});
		cognitoUser.sendMFACode(...sendMfaDefaults);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('when userConfirmation is true, should callback onSuccess', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {
					ChallengeName: 'SMS_MFA',
					AuthenticationResult: { NewDeviceMetadata: 'deviceMetaData' },
				});
			});
		jest
			.spyOn(AuthenticationHelper.prototype, 'generateHashDevice')
			.mockImplementationOnce((...args) => {
				args[2](null, null);
			});
		jest
			.spyOn(AuthenticationHelper.prototype, 'getSaltDevices')
			.mockImplementationOnce(() => {
				return 'deadbeef';
			});
		jest
			.spyOn(AuthenticationHelper.prototype, 'getVerifierDevices')
			.mockImplementationOnce(() => {
				return 'deadbeef';
			});
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, { UserConfirmationNecessary: true });
			});
		cognitoUser.sendMFACode(...sendMfaDefaults);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('second client request fails so sendMFACode should call onFailure', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {
					ChallengeName: 'SMS_MFA',
					AuthenticationResult: { NewDeviceMetadata: 'deviceMetaData' },
				});
			});

		jest
			.spyOn(AuthenticationHelper.prototype, 'generateHashDevice')
			.mockImplementationOnce((...args) => {
				args[2](null, null);
			});
		jest
			.spyOn(AuthenticationHelper.prototype, 'getSaltDevices')
			.mockImplementationOnce(() => {
				return 'deadbeef';
			});
		jest
			.spyOn(AuthenticationHelper.prototype, 'getVerifierDevices')
			.mockImplementationOnce(() => {
				return 'deadbeef';
			});
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'), null);
			});
		cognitoUser.sendMFACode(...sendMfaDefaults);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('second client request does not exist so sendMFACode should return undefined', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {
					ChallengeName: 'SMS_MFA',
					AuthenticationResult: { NewDeviceMetadata: 'deviceMetaData' },
				});
			});

		jest
			.spyOn(AuthenticationHelper.prototype, 'generateHashDevice')
			.mockImplementationOnce((...args) => {
				args[2](null, null);
			});
		jest
			.spyOn(AuthenticationHelper.prototype, 'getSaltDevices')
			.mockImplementationOnce(() => {
				return 'deadbeef';
			});
		jest
			.spyOn(AuthenticationHelper.prototype, 'getVerifierDevices')
			.mockImplementationOnce(() => {
				return 'deadbeef';
			});
		expect(cognitoUser.sendMFACode(...sendMfaDefaults)).toEqual(undefined);
	});

	test('when generateHashDevice fails, sendMFACode should call onFailure', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {
					ChallengeName: 'SMS_MFA',
					AuthenticationResult: { NewDeviceMetadata: 'deviceMetaData' },
				});
			});
		jest
			.spyOn(AuthenticationHelper.prototype, 'generateHashDevice')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'), null);
			});

		cognitoUser.sendMFACode(...sendMfaDefaults);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('when AuthenticationResult.NewDeviceMetadata == null, callback onSuccess', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {
					ChallengeName: 'SMS_MFA',
					AuthenticationResult: { NewDeviceMetadata: null },
				});
			});

		cognitoUser.sendMFACode(...sendMfaDefaults);
		expect(callback.onSuccess.mock.calls.length).toEqual(1);
	});

	test('first network request throws an error calls onFailure', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'), null);
			});

		cognitoUser.sendMFACode(...sendMfaDefaults);
		expect(callback.onFailure.mock.calls.length).toEqual(1);
	});

	test('first client request does not exist so sendMFACode should return undefined', () => {
		expect(cognitoUser.sendMFACode(...sendMfaDefaults)).toEqual(undefined);
	});
});

describe('enableMFA()', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	cognitoUser.setSignInUserSession(vCognitoUserSession);
	const callback = jest.fn();

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.mockClear();
	});

	test('enableMFA happy path should callback on success  ', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null);
			});
		cognitoUser.enableMFA(callback);
		expect(callback.mock.calls[0][1]).toEqual('SUCCESS');
	});
	test('enableMFA should have an error when client request fails', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'));
			});
		cognitoUser.enableMFA(callback);
		expect(callback.mock.calls[0][0]).toMatchObject(Error('Network Error'));
	});
	test('enableMFA should return undefined when no client request is defined', () => {
		expect(cognitoUser.enableMFA(callback)).toEqual(undefined);
	});

	test('enableMFA should callback with an error when userSession is invalid', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.enableMFA(callback);
		expect(callback.mock.calls[0][0]).toMatchObject(
			Error('User is not authenticated')
		);
	});
});

describe('setUserMfaPreference', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	cognitoUser.setSignInUserSession(vCognitoUserSession);
	const callback = jest.fn();

	const setUserMfaPreferenceDefaults = [
		'smsMFASetting',
		'swTokenMFASetting',
		callback,
	];

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.mockClear();
	});
	test('happy path for setUserMfaPreferences should callback(null,SUCCESS)', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null);
			});
		cognitoUser.setUserMfaPreference(...setUserMfaPreferenceDefaults);
		expect(callback.mock.calls[0][1]).toEqual('SUCCESS');
	});
	test('client request throws an error path for setUserMfaPreferences should callback(null,SUCCESS)', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'));
			});
		cognitoUser.setUserMfaPreference(...setUserMfaPreferenceDefaults);
		expect(callback.mock.calls[0][0]).toMatchObject(Error('Network Error'));
	});

	test('happy path for setUserMfaPreferences should callback(null,SUCCESS)', () => {
		expect(
			cognitoUser.setUserMfaPreference(...setUserMfaPreferenceDefaults)
		).toEqual(undefined);
	});

	test('should callback error when cognito user session is invalid', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.setUserMfaPreference(...setUserMfaPreferenceDefaults);
		expect(callback.mock.calls[0][0]).toMatchObject(
			new Error('User is not authenticated')
		);
	});
});

describe('disableMFA()', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	cognitoUser.setSignInUserSession(vCognitoUserSession);
	const callback = jest.fn();

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.mockClear();
	});

	test('happy path should callback with (null, SUCCESS)', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null);
			});
		cognitoUser.disableMFA(callback);
		expect(callback.mock.calls[0][1]).toEqual('SUCCESS');
	});
	test('client request throws an error and should callback with (err, null)', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'));
			});
		cognitoUser.disableMFA(callback);
		expect(callback.mock.calls[0][0]).toMatchObject(new Error('Network Error'));
	});

	test('client request does not exist and disableMFA should callback with (err, null)', () => {
		expect(cognitoUser.disableMFA(callback)).toEqual(undefined);
	});

	test('when user is invalid, return callback with error', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.disableMFA(callback);
		expect(callback.mock.calls[0][0]).toMatchObject(
			new Error('User is not authenticated')
		);
	});
});

describe('getMFAOptions()', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	cognitoUser.setSignInUserSession(vCognitoUserSession);
	const callback = jest.fn();

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.mockClear();
	});

	test('happy path for getMFAOptions should callback onSuccess', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, { MFAOptions: 'SMS_MFA' });
			});
		cognitoUser.getMFAOptions(callback);
		expect(callback.mock.calls[0][1]).toEqual('SMS_MFA');
	});
	test('client request throws an error and should callback with (err, null)', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'));
			});
		cognitoUser.getMFAOptions(callback);
		expect(callback.mock.calls[0][0]).toMatchObject(new Error('Network Error'));
	});
	test('non-existent client request throws an error and should callback with (err, null)', () => {
		expect(cognitoUser.getMFAOptions(callback)).toEqual(undefined);
	});
	test('when user is invalid, return callback with error', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.getMFAOptions(callback);
		expect(callback.mock.calls[0][0]).toMatchObject(
			new Error('User is not authenticated')
		);
	});
});

describe('deleteUser()', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	cognitoUser.setSignInUserSession(vCognitoUserSession);
	const callback = jest.fn();

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.mockClear();
	});

	test('happy path should callback SUCCESS', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, null);
			});
		cognitoUser.deleteUser(callback, {});
		expect(callback.mock.calls[0][1]).toEqual('SUCCESS');
	});

	test('client request throws an error', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'));
			});
		cognitoUser.deleteUser(callback, {});
		expect(callback.mock.calls[0][0]).toMatchObject(new Error('Network Error'));
	});

	test('no network request returns undefined', () => {
		expect(cognitoUser.deleteUser(callback, {})).toEqual(undefined);
	});

	test('having an invalid user session should callback with a new error', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.deleteUser(callback, {});
		expect(callback.mock.calls[0][0]).toMatchObject(
			new Error('User is not authenticated')
		);
	});
});

describe('getUserAttributes()', () => {
	const cognitoUser = new CognitoUser({ ...userDefaults });
	cognitoUser.setSignInUserSession(vCognitoUserSession);
	const callback = jest.fn();

	afterAll(() => {
		jest.restoreAllMocks();
	});

	afterEach(() => {
		callback.mockClear();
	});

	test('happy path for getUserAttributes', () => {
		
		const userAttributesObject = {
			UserAttributes: [{ Name: 'name1', Value: 'value1' }],
		};
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				
				args[2](null, userAttributesObject);
			});
		cognitoUser.getUserAttributes(callback);
		expect(callback.mock.calls[0][1]).toMatchObject(userAttributesObject.UserAttributes);
	});

	test('client request throws an error', () => {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Network Error'));
			});
		cognitoUser.getUserAttributes(callback);
		expect(callback.mock.calls[0][0]).toMatchObject(new Error('Network Error'));
	});


	test('no network request returns undefined', () => {
		expect(cognitoUser.getUserAttributes(callback)).toEqual(undefined);
});

	test('having an invalid user session should callback with a new error', () => {
		cognitoUser.setSignInUserSession(ivCognitoUserSession);
		cognitoUser.getUserAttributes(callback);
		expect(callback.mock.calls[0][0]).toMatchObject(
			new Error('User is not authenticated')
		);
	});
});

describe.skip('Test suite for caching and modifying caches', () => {
	test('clearCachedTokens should leave the cognitoUser storage to be equal to an empty dict', async () => {
		const cognitoUser = new CognitoUser({ ...userDefaults });
		cognitoUser.setSignInUserSession(vCognitoUserSession);
		console.log(cognitoUser);
		cognitoUser.cacheTokens();
		console.log(cognitoUser);
		cognitoUser.clearCachedTokens(
			expect(cognitoUser.storage).toMatchObject({})
		);
	});

	test.skip('clearCachedTokens should leave the cognitoUser storage to be equal to an empty dict', () => {
		const cognitoUser = new CognitoUser({ ...userDefaults });
		cognitoUser.clearCachedDeviceKeyAndPassword();
		expect(cognitoUser.storage).toMatchObject({});
	});
	test.skip('clear cachedUser should leave the cognitoUser storage to be equal to an empty dict', async () => {
		const cognitoUser = new CognitoUser({ ...userDefaults });
		const testCognitoUser = cognitoUser;
		cognitoUser.cacheUserData({ language: 'EN', age: 23 });
		// console.log('pre',cognitoUser);
		cognitoUser.clearCachedUserData();
		// console.log('post',testCognitoUser);
		// expect(cognitoUser.storage).toMatchObject({});
	});
});
