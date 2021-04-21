import CognitoUserPool from '../src/CognitoUserPool';
import Client from '../src/Client';
import { clientId, userPoolId, userName, password } from './constants';

describe('Constructor and accessor methods', () => {
	const minimalData = { UserPoolId: userPoolId, ClientId: clientId };
	const cognitoUserPool = new CognitoUserPool(minimalData);

	afterAll(() => {
		jest.restoreAllMocks();
	});

	test('Improper data supplied', () => {
		const data = { UserPoolId: null, ClientId: clientId };
		expect(() => {
			new CognitoUserPool(data);
		}).toThrowError();
	});

	test('Getting clientId from CognitoUserPool', () => {
		expect(cognitoUserPool.getClientId()).toBe(clientId);
	});

	test('Getting userPoolId from CognitoUserPool', () => {
		expect(cognitoUserPool.getUserPoolId()).toBe(userPoolId);
	});

	test('Getting user context data without advancedSecurityData', () => {
		const cognitoUserPool = new CognitoUserPool(minimalData);
		expect(cognitoUserPool.getUserContextData(userName)).toBe(undefined);
	});

	test('When a user has not been logged in, return null from getting the current user', () => {
		expect(cognitoUserPool.getCurrentUser()).toBe(null);
	});
	test('When a user has been logged in, return the CognitoUser getting the current user', async () => {
		jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			// need to mock the implementation of storage.getItem() to give us a
			// hard-coded CognitoUser with username:'userame'
			return 'username';
		});

		//returns a function that records everything being done to it
		expect(cognitoUserPool.getCurrentUser()).toMatchObject({
			username: 'username',
		});
	});
});

describe('Testing signUp of a user into a user pool', () => {
	const minimalData = { UserPoolId: userPoolId, ClientId: clientId };
	const cognitoUserPool = new CognitoUserPool(minimalData);

	afterAll(() => {
		jest.restoreAllMocks();
	});

	test('Signing up a user happy path', async () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			args[2](null, {});
		});

		//returns a function that records everything being done to it
		const callback = jest.fn();

		cognitoUserPool.signUp(userName, password, [], [], callback, []);
		//mockCallback.mock.calls[1][0]).toBe(1);

		// looking at all the recorded calls to the jest.fn()
		// 1st param is number of times invoked
		// 2nd param is the index of the argument passed in
		expect(callback.mock.calls[0][1]).toMatchObject({
			user: { username: userName },
		});
		expect(callback.mock.calls[0][0]).toBe(null);
	});

	test('Signing up a user has some kind of error', async () => {
		jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
			const err = new Error('Network Error');
			args[2](null, {});
		});

		//returns a function that records everything being done to it
		const callback = jest.fn();
		cognitoUserPool.signUp(userName, password, [], [], callback, []);
		expect(callback.mock.calls.length).toBe(1);
	});
});
