import CognitoAccessToken from '../src/CognitoAccessToken';

describe('AuthenticationDetails getter methods', () => {
	test('getUsername()', () => {
		const accessToken = new CognitoAccessToken({ AccessToken: 'accessToken' });
		// TODO: mock this class and test to make sure the parent class gets instantiated
	});
});
