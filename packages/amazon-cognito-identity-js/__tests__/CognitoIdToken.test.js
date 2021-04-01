import CognitoIdToken from '../src/CognitoIdToken'

describe('Constructor for CognitoId Token', () => {

	test('Constructing a CognitoID Token', () => {
		const cognitoToken = new CognitoIdToken('testingJWTTokenString')
		expect(typeof cognitoToken.jwtToken).toBe('string')
	})
})