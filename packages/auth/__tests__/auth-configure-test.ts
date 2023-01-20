import { AuthClass as Auth } from '../src/Auth';
import type { AuthOptions } from '../src/types';
import { Credentials } from '@aws-amplify/core';

describe('configure test', () => {
	const { location } = window;

	beforeAll(() => {
		delete (window as any).location;
		(window as any).location = Object.assign(new URL('http://localhost'), {
			ancestorOrigins: '',
			assign: jest.fn(),
			reload: jest.fn(),
			replace: jest.fn(),
		});
	});

	afterAll(() => {
		window.location = location;
	});

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

	test('invoked _handleAuthResponse method when current url is redirectSignUrl on Authorization Code Flow', () => {
		const url =
			'http://localhost:4200/redirectSignIn?code=AUTHORIZATION_CODE&state=STATE';
		window.location.href = url;

		const opts: AuthOptions = {
			userPoolId: 'us-east-1_awdasd',
			userPoolWebClientId: 'awsUserPoolsWebClientId',
			region: 'us-east-1',
			identityPoolId: 'awsCognitoIdentityPoolId',
			mandatorySignIn: false,
			oauth: {
				domain: 'xxxxxxxxxxxx-xxxxxx-xxx.auth.us-west-2.amazoncognito.com',
				scope: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
				redirectSignIn: 'http://localhost:4200/redirectSignIn',
				redirectSignOut: 'http://localhost:4200/redirectSignOut',
				responseType: 'code',
			},
		};

		const auth = new Auth(null);

		jest
			.spyOn(auth as any, '_handleAuthResponse')
			.mockResolvedValueOnce(auth.Credentials);

		auth.configure(opts);

		expect((auth as any)._handleAuthResponse).toBeCalledTimes(1);
		expect((auth as any)._handleAuthResponse).toBeCalledWith(url);
	});

	test('no invoked _handleAuthResponse method when current url is not redirectSignUrl', () => {
		window.location.href =
			'http://localhost:4200/othercallback?code=AUTHORIZATION_CODE&state=STATE';

		const opts: AuthOptions = {
			userPoolId: 'us-east-1_awdasd',
			userPoolWebClientId: 'awsUserPoolsWebClientId',
			region: 'us-east-1',
			identityPoolId: 'awsCognitoIdentityPoolId',
			mandatorySignIn: false,
			oauth: {
				domain: 'xxxxxxxxxxxx-xxxxxx-xxx.auth.us-west-2.amazoncognito.com',
				scope: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
				redirectSignIn: 'http://localhost:4200/redirectSignIn',
				redirectSignOut: 'http://localhost:4200/redirectSignOut',
				responseType: 'code',
			},
		};

		const auth = new Auth(null);

		jest
			.spyOn(auth as any, '_handleAuthResponse')
			.mockResolvedValueOnce(auth.Credentials);

		auth.configure(opts);
		expect((auth as any)._handleAuthResponse).not.toBeCalled();
	});

	test('invoked _handleAuthResponse method when current url is redirectSignUrl on Implicit Flow', () => {
		const url =
			'http://localhost:4200/redirectSignIn#id_token=ID_TOKEN&access_token=ACCESS_TOKEN&token_type=bearer&expires_in=3600&state=STATE';
		window.location.href = url;

		const opts: AuthOptions = {
			userPoolId: 'us-east-1_awdasd',
			userPoolWebClientId: 'awsUserPoolsWebClientId',
			region: 'us-east-1',
			identityPoolId: 'awsCognitoIdentityPoolId',
			mandatorySignIn: false,
			oauth: {
				domain: 'xxxxxxxxxxxx-xxxxxx-xxx.auth.us-west-2.amazoncognito.com',
				scope: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
				redirectSignIn: 'http://localhost:4200/redirectSignIn',
				redirectSignOut: 'http://localhost:4200/redirectSignOut',
				responseType: 'token',
			},
		};

		const auth = new Auth(null);

		jest
			.spyOn(auth as any, '_handleAuthResponse')
			.mockResolvedValueOnce(auth.Credentials);

		auth.configure(opts);

		expect((auth as any)._handleAuthResponse).toBeCalledTimes(1);
		expect((auth as any)._handleAuthResponse).toBeCalledWith(url);
	});

	test.only.each([
		['invalid_request'],
		['unauthorized_client'],
		['invalid_scope'],
		['server_error'],
	])(
		'invoked _handleAuthResponse method when current url is redirectSignUrl with error=%s',
		error => {
			const url = `http://localhost:4200/redirectSignIn?error=${error}`;
			console.log(url);
			window.location.href = url;

			const opts: AuthOptions = {
				userPoolId: 'us-east-1_awdasd',
				userPoolWebClientId: 'awsUserPoolsWebClientId',
				region: 'us-east-1',
				identityPoolId: 'awsCognitoIdentityPoolId',
				mandatorySignIn: false,
				oauth: {
					domain: 'xxxxxxxxxxxx-xxxxxx-xxx.auth.us-west-2.amazoncognito.com',
					scope: [
						'openid',
						'email',
						'profile',
						'aws.cognito.signin.user.admin',
					],
					redirectSignIn: 'http://localhost:4200/redirectSignIn',
					redirectSignOut: 'http://localhost:4200/redirectSignOut',
					responseType: 'code',
				},
			};

			const auth = new Auth(null);

			jest
				.spyOn(auth as any, '_handleAuthResponse')
				.mockResolvedValueOnce(auth.Credentials);

			auth.configure(opts);

			expect((auth as any)._handleAuthResponse).toBeCalledTimes(1);
			expect((auth as any)._handleAuthResponse).toBeCalledWith(url);
		}
	);
});
