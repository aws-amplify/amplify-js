import AuthenticationDetails from '../src/AuthenticationDetails';

describe('AuthenticationDetails getter methods', () => {
	const completeData = {
		ValidationData: {},
		Username: 'user@amzn.com',
		Password: 'abc123',
		AuthParameters: {},
		ClientMetadata: {},
	};

	// TODO: Are any of these fields required (I assume username/pw)? Or is it ok to pass empty data?
	// const missingData = {
	// 	ValidationData: {},
	// 	Username: undefined,
	// 	Password: undefined,
	// 	AuthParameters: {},
	// 	ClientMetadata: {},
	// };

	test('getUsername()', () => {
		const authDetails = new AuthenticationDetails(completeData);
		const username = authDetails.getUsername();

		expect(typeof username).toEqual('string');
		expect(username).toBe(completeData.Username);
	});

	test('getPassword()', () => {
		const authDetails = new AuthenticationDetails(completeData);
		const password = authDetails.getPassword();

		expect(typeof password).toEqual('string');
		expect(password).toBe(completeData.Password);
	});

	test('getValidationData()', () => {
		const authDetails = new AuthenticationDetails(completeData);
		const validationData = authDetails.getValidationData();

		// TODO: what else do we need to test for in the ValidationData object?
		expect(typeof validationData).toEqual('object');
		expect(validationData).toBe(completeData.ValidationData);
	});

	test('getAuthParameters()', () => {
		const authDetails = new AuthenticationDetails(completeData);
		const authParameters = authDetails.getAuthParameters();

		// TODO: what else do we need to test for in the AuthParameters object?
		expect(typeof authParameters).toEqual('object');
		expect(authParameters).toBe(completeData.AuthParameters);
	});

	test('getClientMetadata()', () => {
		const authDetails = new AuthenticationDetails(completeData);
		const clientMetadata = authDetails.getClientMetadata();

		// TODO: what else do we need to test for in the ClientMetadata object?
		expect(typeof clientMetadata).toEqual('object');
		expect(clientMetadata).toBe(completeData.ClientMetadata);
	});
});
