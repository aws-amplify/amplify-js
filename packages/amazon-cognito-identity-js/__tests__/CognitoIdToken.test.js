import CognitoIdToken from '../src/CognitoIdToken';

describe('Constructor for CognitoId Token', () => {
	test('Constructing a CognitoID Token', () => {
		const cognitoToken = new CognitoIdToken('testToken');
		expect(typeof cognitoToken.jwtToken).toBe('string');
	});
});
