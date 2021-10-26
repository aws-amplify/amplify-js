import { AuthClass as Auth } from '../src/Auth';

describe('configure test', () => {
	test('throw error when storage is empty', () => {
		const opts = {
			userPoolId: 'awsUserPoolsId',
			userPoolWebClientId: 'awsUserPoolsWebClientId',
			region: 'region',
			identityPoolId: 'awsCognitoIdentityPoolId',
			mandatorySignIn: false,
			storage: {},
		};
		const auth = new Auth(null);
		expect.assertions(1);
		try {
			auth.configure(opts);
		} catch (e) {
			expect(e).not.toBeNull();
		}
	});
});
