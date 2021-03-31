import CognitoJwtToken from '../src/CognitoJwtToken';

describe('AuthenticationDetails getter methods', () => {
	const token =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBbWF6b24gQ29nbml0byBJZGVudGl0eSBKUyIsImlhdCI6MTYxNjYxOTk4OSwiZXhwIjoxNjQ4MTU1OTg5LCJhdWQiOiJBbXBsaWZ5IEpTIiwic3ViIjoiSm9obiBEb2UifQ.mVLc52533pWSad8vhD56JJsE-E-gdLJO-IeB-ojYsl4';
	const tokenDecoded = {
		iss: 'Amazon Cognito Identity JS',
		iat: 1616619989,
		exp: 1648155989,
		aud: 'Amplify JS',
		sub: 'John Doe',
	};
	const cognitoJwtToken = new CognitoJwtToken(token);

	test('getJwtToken()', () => {
		expect(cognitoJwtToken.getJwtToken()).toEqual(token);
	});

	test('getExpiration()', () => {
		expect(cognitoJwtToken.getExpiration()).toEqual(tokenDecoded.exp);
	});

	test('getIssuedAt()', () => {
		expect(cognitoJwtToken.getIssuedAt()).toEqual(tokenDecoded.iat);
	});

	test('decodePayload()', () => {
		expect(cognitoJwtToken.decodePayload()).toMatchObject(tokenDecoded);
	});
});
