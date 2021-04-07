import AuthenticationDetails from '../src/AuthenticationDetails';
import { authDetailData } from './constants';

describe('AuthenticationDetails getter methods', () => {
	const authDetails = new AuthenticationDetails(authDetailData);

	test('getUsername()', () => {
		const username = authDetails.getUsername();
		expect(typeof username).toEqual('string');
		expect(username).toBe(authDetailData.Username);
	});

	test('getPassword()', () => {
		const password = authDetails.getPassword();
		expect(typeof password).toEqual('string');
		expect(password).toBe(authDetailData.Password);
	});

	test('getValidationData()', () => {
		const validationData = authDetails.getValidationData();
		expect(typeof validationData).toEqual('object');
		expect(validationData).toBe(authDetailData.ValidationData);
	});

	test('getAuthParameters()', () => {
		const authParameters = authDetails.getAuthParameters();
		expect(typeof authParameters).toEqual('object');
		expect(authParameters).toBe(authDetailData.AuthParameters);
	});

	test('getClientMetadata()', () => {
		const clientMetadata = authDetails.getClientMetadata();
		expect(typeof clientMetadata).toEqual('object');
		expect(clientMetadata).toBe(authDetailData.ClientMetadata);
	});
});
