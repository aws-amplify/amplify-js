import { AuthClass as Auth } from '../src/Auth';
import { Credentials } from '@aws-amplify/core';

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

	test('configure Credentials correctly when using different region', () => {
		const opts = {
			userPoolId: 'us-east-1_awdasd',
			userPoolWebClientId: 'awsUserPoolsWebClientId',
			region: 'us-east-1',
			identityPoolId: 'awsCognitoIdentityPoolId',
			identityPoolRegion: 'us-east-2',
		};

		const spyOn = jest.spyOn(Credentials, 'configure');

		const auth = new Auth(null);
		expect.assertions(1);

		auth.configure(opts);
		expect(spyOn).toBeCalledWith(
			expect.objectContaining({
				region: 'us-east-1',
				identityPoolRegion: 'us-east-2',
				identityPoolId: 'awsCognitoIdentityPoolId',
				userPoolId: 'us-east-1_awdasd',
			})
		);
	});
});
