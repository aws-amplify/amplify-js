import CognitoUser from '../src/CognitoUser';
import { promisifyCallback } from './util';
import CognitoUserPool from '../src/CognitoUserPool';
import { clientId, userPoolId } from './constants';

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

	describe('Name of the group', () => {
		const cognitoUser = new CognitoUser(minimalData);
		afterAll(() => {
			jest.restoreAllMocks();
		});
		test('Verify Software Token Happy case', () => {
			jest.spyOn(Client.prototype, 'request').mockImplementation(
				(...args) => {
					console.log(args);
					args[2](null, {})
				});
	
			//returns a function that records everything being done to it
			const callback = jest.fn()

			cognitoUser.verifySoftwareToken()
		});
	});
	describe('Name of the group', () => {});
});
