import { Observable } from 'rxjs';
import { NewAmplify as Amplify } from '../src';
import { AmplifyUserSessionProvider } from '../src/types';

describe('NewAmplify tests', () => {
	const config = {
		Auth: {
			userPoolId: 'userpoolid',
			userPoolClientId: 'userpool-clientid',
		},
	};

	test('accessing config', () => {
		// TODO: Test Hub event after Hub refactor
		Amplify.configure(config);

		const { Auth: AuthConfig } = Amplify.getConfig();

		expect(AuthConfig).toEqual(config.Auth);
	});

	test('config cannot be modified outside of Singleton', () => {
		Amplify.configure(config);

		const returnedConfig = Amplify.getConfig();

		if (returnedConfig.Auth) {
			returnedConfig.Auth.userPoolId = 'modified-userpool';
		}

		const configAfterModify = Amplify.getConfig();

		expect(configAfterModify.Auth?.userPoolId).toBe('userpoolid');
	});

	test('getUserSession & listenUserSession with sessionProvider', async () => {
		const sessionProvider: AmplifyUserSessionProvider = {
			async getUserSession(options) {
				return {
					isLoggedIn: true,
				};
			},
			listenUserSession() {
				return new Observable(observer => {});
			},
		};

		Amplify.configure(config, {
			Auth: {
				sessionProvider,
			},
		});

		const spyOnGetUserSession = jest.spyOn(sessionProvider, 'getUserSession');
		const spyOnListenUserSession = jest.spyOn(
			sessionProvider,
			'listenUserSession'
		);

		await Amplify.Auth.getUserSession();
		Amplify.Auth.listenUserSession();

		expect(spyOnGetUserSession).toBeCalled();
		expect(spyOnListenUserSession).toBeCalled();
	});

	test('getUserSession without session provider', async () => {
		Amplify.configure(config, { Auth: null });

		const getUserSession = async () => {
			await Amplify.Auth.getUserSession();
		};

		await expect(getUserSession()).rejects.toThrow(
			'No user session provider configured'
		);
	});

	test('listen user session without session provider', () => {
		Amplify.configure(config, { Auth: null });
		expect(Amplify.Auth.listenUserSession).toThrow(
			'No user session provider configured'
		);
	});
});
