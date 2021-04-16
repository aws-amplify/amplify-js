import CognitoUser from '../src/CognitoUser';

import CognitoUserPool from '../src/CognitoUserPool';
import AuthenticationDetails from '../src/AuthenticationDetails';
import AuthenticationHelper from '../src/AuthenticationHelper';
import Client from '../src/Client';

import {
	clientId,
	userPoolId,
	cognitoUserSession,
	authDetailData,
	authDetailDataWithValidationData,
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
		user.setSignInUserSession(cognitoUserSession);
		expect(user.signInUserSession).toEqual(cognitoUserSession);

		// getter after set explicitly
		expect(user.getSignInUserSession()).toEqual(cognitoUserSession);
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
				Session: cognitoUserSession,
				ChallengeParameters: 'Custom challenge params',
			});
		});

		const authDetails = new AuthenticationDetails(authDetailData);
		user.initiateAuth(authDetails, callback);

		expect(user.Session).toMatchObject(cognitoUserSession);
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
		onSuccess: jest.fn(),
		customChallenge: jest.fn(),
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
		onSuccess: jest.fn(),
		customChallenge: jest.fn(),
	};

	afterEach(() => {
		jest.restoreAllMocks();
		callback.onFailure.mockClear();
		callback.onSuccess.mockClear();
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
				Session: cognitoUserSession,
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
		onSuccess: jest.fn(),
		customChallenge: jest.fn(),
	};

	afterEach(() => {
		jest.restoreAllMocks();
		callback.onFailure.mockClear();
		callback.onSuccess.mockClear();
		callback.customChallenge.mockClear();
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
