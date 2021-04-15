import CognitoUser from '../src/CognitoUser';

import CognitoUserPool from '../src/CognitoUserPool';
import AuthenticationDetails from '../src/AuthenticationDetails';
import Client from '../src/Client';

import {
	clientId,
	userPoolId,
	authDetailData,
	authDetailDataWithValidationData,
	vCognitoUserSssion,
	deviceName,
	totpCode
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
		user.setSignInUserSession(vCognitoUserSssion);
		expect(user.signInUserSession).toEqual(vCognitoUserSssion);

		// getter after set explicitly
		expect(user.getSignInUserSession()).toEqual(vCognitoUserSssion);
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
				Session: vCognitoUserSssion,
				ChallengeParameters: 'Custom challenge params',
			});
		});

		const user = new CognitoUser({
			Username: 'username',
			Pool: cognitoUserPool,
		});

		const authDetails = new AuthenticationDetails(authDetailData);
		user.initiateAuth(authDetails, callback);

		expect(user.Session).toMatchObject(vCognitoUserSssion);
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


describe('Testing Verifity Software Token with a signed in user', () => {
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
			onSuccess:jest.fn()	
		}

		cognitoUser.verifySoftwareToken(totpCode, deviceName, callback);
		expect(callback.onSuccess.mock.calls.length).toBe(1)
	});
	
	test('Verify Software Token First Callback fails', () => { 
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				
				args[2](new Error('Network Error'), null);
			});
			
		const callback = {
			onFailure:jest.fn()
		}

		cognitoUser.verifySoftwareToken(totpCode, deviceName, callback);
		expect(callback.onFailure.mock.calls.length).toBe(1)
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
			onFailure:jest.fn()
		}

		cognitoUser.verifySoftwareToken(totpCode, deviceName, callback);
		expect(callback.onFailure.mock.calls.length).toBe(1)
	});

	describe('Verify Software Token with an invalid signin user session', () => {
		const minimalData = { UserPoolId: userPoolId, ClientId: clientId };
		const cognitoUserPool = new CognitoUserPool(minimalData);
		const cognitoUser = new CognitoUser({
			Username: 'username',
			Pool: cognitoUserPool,
		});

		test('Happy case for non-signed in user session', () => {
			jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, {});
			});
			const callback = {
				onSuccess: jest.fn()
			}

			cognitoUser.setSignInUserSession(vCognitoUserSssion)
			cognitoUser.verifySoftwareToken(totpCode, deviceName, callback);
			expect(callback.onSuccess.mock.calls.length).toBe(1);			
		});

		test('Error case for non-signed in user session', () => {
			jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](new Error('Client Error'),null);
			});
			const callback = {
				onFailure: jest.fn()
			}

			cognitoUser.setSignInUserSession(vCognitoUserSssion)
			cognitoUser.verifySoftwareToken(totpCode, deviceName, callback);
			expect(callback.onFailure.mock.calls.length).toBe(1);		
		});
	});
})


// Progress Report:
// All files      -    60.67 |    42.43 |    61.11 |    59.29
// CognitoUser.js -    25.37 |       10 |    15.52 |     22.8
