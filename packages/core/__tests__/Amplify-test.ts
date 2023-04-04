import { Observable } from 'rxjs';
import { Amplify } from '../src';
import { AmplifyUserSessionProvider } from '../src/types';

describe('Amplify config test', () => {
	beforeAll(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
	});

	test('empty config', () => {
		const mockComp = {
			configure: jest.fn(),
		};

		Amplify.register(mockComp);
		const res = Amplify.configure(null);

		expect(mockComp.configure).toBeCalledWith({});
	});

	test('happy case', () => {
		const mockComp = {
			configure: jest.fn(),
		};

		Amplify.register(mockComp);
		const res = Amplify.configure({
			attr: 'attr',
		});
		expect(mockComp.configure).toBeCalled();
		expect(res).toEqual({ attr: 'attr' });
	});

	test('reading config', () => {
		const config = {
			Auth: {
				userPoolId: 'userpoolid',
				userPoolClientId: 'userpool-clientid',
			},
		};

		Amplify.configure(config);

		const { Auth: AuthConfig } = Amplify.config;

		expect(AuthConfig).toEqual(config.Auth);
	});

	test('sessionProvider', async () => {
		const config = {
			Auth: {
				userPoolId: 'userpoolid',
				userPoolClientId: 'userpool-clientid',
			},
		};

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

		const spyOnGetUserSession = jest.spyOn(sessionProvider, 'getUserSession');
		const spyOnListenUserSession = jest.spyOn(
			sessionProvider,
			'listenUserSession'
		);
		Amplify.configure(config, {
			Auth: {
				sessionProvider,
			},
		});

		await Amplify.Auth.getUserSession();
		Amplify.Auth.listenUserSession();

		expect(spyOnGetUserSession).toBeCalled();
		expect(spyOnListenUserSession).toBeCalled();
	});
});

describe('addPluggable test', () => {
	test('happy case', () => {
		const pluggable = {
			getCategory: jest.fn(),
		};

		const mockComp = {
			addPluggable: jest.fn(),
			configure: jest.fn(),
		};

		Amplify.register(mockComp);
		Amplify.addPluggable(pluggable);

		expect(mockComp.addPluggable).toBeCalled();
	});

	test('no pluggable', () => {
		const pluggable = {
			getCategory: jest.fn(),
		};

		const mockComp = {
			addPluggable: jest.fn(),
		};

		Amplify.addPluggable({});

		expect(mockComp.addPluggable).not.toBeCalled();
	});
});
