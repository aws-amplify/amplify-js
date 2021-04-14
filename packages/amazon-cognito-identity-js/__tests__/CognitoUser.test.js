import CognitoUser from '../src/CognitoUser';

import CognitoUserPool from '../src/CognitoUserPool';
import AuthenticationDetails from '../src/AuthenticationDetails';
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
			new CognitoUser({
				Username: 'username',
				Pool: cognitoUserPool,
			});
		}).not.toThrowError();

		expect(spyon).toBeCalled();
	});
});

describe('getters and setters', () => {
	const user = new CognitoUser({
		Username: 'username',
		Pool: cognitoUserPool,
	});

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

		const user = new CognitoUser({
			Username: 'username',
			Pool: cognitoUserPool,
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

		const user = new CognitoUser({
			Username: 'username',
			Pool: cognitoUserPool,
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

		const user = new CognitoUser({
			Username: 'username',
			Pool: cognitoUserPool,
		});

		const getCognitoUserSessionSpy = jest.spyOn(user, 'getCognitoUserSession');
		const cacheTokensSpy = jest.spyOn(user, 'cacheTokens');

		const authDetails = new AuthenticationDetails(authDetailData);
		user.initiateAuth(authDetails, callback);

		expect(getCognitoUserSessionSpy).toBeCalledWith('great success');
		expect(cacheTokensSpy).toBeCalled();
		expect(callback.onSuccess.mock.calls.length).toBe(1);
	});

	test('initiate auth with validation data', () => {
		const user = new CognitoUser({
			Username: 'username',
			Pool: cognitoUserPool,
		});
		const authDetails = new AuthenticationDetails(
			authDetailDataWithValidationData
		);

		user.initiateAuth(authDetails, callback);
		// expect(authDetails.getAuthParameters().USERNAME).toEqual(user.username);
	});
});

describe('authenticateUser()', () => {
	afterAll(() => {
		jest.restoreAllMocks();
	});

	const user = new CognitoUser({
		Username: 'username',
		Pool: cognitoUserPool,
	});
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

// Progress Report:
// All files      -    56.46 |    41.78 |     56.6 |    57.07
// CognitoUser.js -    22.43 |       10 |    15.52 |     22.8
