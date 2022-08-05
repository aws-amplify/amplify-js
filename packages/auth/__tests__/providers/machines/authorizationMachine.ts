import { interpret } from 'xstate';
import { done } from 'xstate/lib/actions';
import {
	authzMachine,
	authzMachineEvents,
} from '../../../src/Providers/CognitoProvider/machines/authorizationMachine';
import { CognitoService } from '../../../src/Providers/CognitoProvider/serviceClass';
import {
	CognitoProviderConfig,
	CognitoProvider,
} from '../../../src/Providers/CognitoProvider/CognitoProvider';
import { waitFor } from 'xstate/lib/waitFor';
import { AWSCredentials } from '../../../src/types';

const testCognitoProviderConfig: CognitoProviderConfig = {
	userPoolId: '',
	region: 'us-west-2',
	clientId: '',
	identityPoolId: 'us-west-2:6f687fc7-c8b0-42f3-8868-d36a54342aab',
};

// test to make sure provider throws error without config
const provider2 = new CognitoProvider({});

describe('Cognito Provider Test', () => {
	test('config error test', () => {
		// make sure an error is thrown if we try fetch session before configuring
		expect(() => provider2.configure({})).toThrow(Error);
	});
});

// initialize the provider
const provider = new CognitoProvider({ ...testCognitoProviderConfig });

// UNAUTH FLOW
describe('Authorization Machine Test UnAuth Flow', () => {
	test('start machine test', () => {
		const _authzService = interpret(authzMachine);
		_authzService.start();
		expect(_authzService).toBeTruthy();
		expect(_authzService).toBeDefined();
		expect(_authzService.state.matches('notConfigured'));
	});

	test('config and service test', () => {
		const _authzService = interpret(authzMachine);
		_authzService.start();
		// configure the state machine
		_authzService.send(
			authzMachineEvents.configure({ ...testCognitoProviderConfig })
		);

		_authzService.onTransition(state => {
			expect(state.context.service).toBeInstanceOf(CognitoService);
			expect(state.context.config).toStrictEqual(testCognitoProviderConfig);
		});
		// make sure machine is in configured state after configured action
		expect(_authzService.state.matches('configured'));
		expect(_authzService.state.context.service).toBeInstanceOf(CognitoService);
		expect(_authzService.state.context.config).toStrictEqual(
			testCognitoProviderConfig
		);
	});

	test('fetch UnAuth tokens test', async () => {
		const fetchUnAuthIdSpy = jest
			.spyOn(CognitoService.prototype, 'fetchUnAuthIdentityID')
			.mockImplementation(() => {
				return Promise.resolve('identityId');
			});
		const fetchUnAuthAWSCredsSpy = jest
			.spyOn(CognitoService.prototype, 'fetchUnAuthAWSCredentials')
			.mockImplementation(() =>
				Promise.resolve({
					AccessKeyId: 'accessKeyId',
					SecretKey: 'secretKey',
					Expiration: new Date(),
					SessionToken: 'sessionToken',
				})
			);
		const _authzService = interpret(authzMachine);
		_authzService.start();
		// configure the state machine
		_authzService.send(
			authzMachineEvents.configure({ ...testCognitoProviderConfig })
		);
		_authzService.send(authzMachineEvents.fetchUnAuthSession());
		// wait for fetchUnAuthSession to be finished
		const sessionEstablished = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);
		// make sure fetchUnAuthSession moved to sessionEstablished
		expect(_authzService.state.matches('sessionEstablished')).toBeTruthy();
		// make sure AWS Credentials exist after fetchUnAuthSession call
		expect(
			_authzService.state.context.sessionInfo.AWSCredentials
		).toBeDefined();
		// make sure there aren't any userPoolTokens
		expect(
			_authzService.state.context.sessionInfo.userPoolTokens
		).toBeUndefined();
		expect(fetchUnAuthIdSpy).toHaveBeenCalledTimes(1);
		expect(fetchUnAuthAWSCredsSpy).toHaveBeenCalledTimes(1);
	});

	const sessionToken3: string = '';
	let sessionToken4: string = '';

	test('fetch cached session UnAuth test', async () => {
		const fetchUnAuthIdSpy = jest
			.spyOn(CognitoService.prototype, 'fetchUnAuthIdentityID')
			.mockImplementation(() => {
				return Promise.resolve('identityId');
			});
		const fetchUnAuthAWSCredsSpy = jest
			.spyOn(CognitoService.prototype, 'fetchUnAuthAWSCredentials')
			.mockImplementation(() =>
				Promise.resolve({
					AccessKeyId: 'accessKeyId',
					SecretKey: 'secretKey',
					Expiration: new Date(),
					SessionToken: 'sessionToken',
				})
			);
		const _authzService = interpret(authzMachine);
		_authzService.start();
		_authzService.send(
			authzMachineEvents.configure({ ...testCognitoProviderConfig })
		);
		_authzService.send(authzMachineEvents.fetchUnAuthSession());
		const sessionEstablished = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);
		const sessionToken =
			sessionEstablished.context.sessionInfo.AWSCredentials.SessionToken;

		_authzService.send(authzMachineEvents.fetchUnAuthSession());
		const sessionEstablished2 = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);
		const sessionToken2 =
			sessionEstablished2.context.sessionInfo.AWSCredentials.SessionToken;
		expect(fetchUnAuthIdSpy).toHaveBeenCalledTimes(2);
		expect(fetchUnAuthAWSCredsSpy).toHaveBeenCalledTimes(2);
	});

	test('refresh UnAuth session test', async () => {
		const _authzService = interpret(authzMachine);
		_authzService.start();
		_authzService.send(
			authzMachineEvents.configure({ ...testCognitoProviderConfig })
		);
		_authzService.send(authzMachineEvents.fetchUnAuthSession());
		const sessionEstablished = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);
		_authzService.send(authzMachineEvents.refreshSession());
		sessionToken4 =
			sessionEstablished.context.sessionInfo.AWSCredentials.SessionToken;
		expect(sessionToken3 === sessionToken4).toBeFalsy();
	});
});

// AUTH FLOW
describe('Authorization State Machine Auth Flow', () => {
	let _authzService = interpret(authzMachine);

	beforeEach(() => {
		_authzService = interpret(authzMachine);
	});

	test('start machine test', () => {
		_authzService.start();
		expect(_authzService).toBeTruthy();
		expect(_authzService).toBeDefined();
		expect(_authzService.state.matches('notConfigured'));
	});

	test('config and service test', () => {
		_authzService.start();
		// configure the state machine
		_authzService.send(
			authzMachineEvents.configure({ ...testCognitoProviderConfig })
		);
		_authzService.onTransition(state => {
			expect(state.context.service).toBeInstanceOf(CognitoService);
			expect(state.context.config).toStrictEqual(testCognitoProviderConfig);
		});
		// make sure machine is in configured state after configured action
		expect(_authzService.state.matches('configured'));
		expect(_authzService.state.context.service).toBeInstanceOf(CognitoService);
		expect(_authzService.state.context.config).toStrictEqual(
			testCognitoProviderConfig
		);
	});

	const sessionToken1: string = '';
	const sessionToken2: string = '';

	// to test, login on the sample app and then copy and paste the tokens from the fetched auth session
	const testAccessToken = '';
	const testIdToken = '';
	const testRefreshToken = '';

	test('fetch Auth tokens test', async () => {
		const fetchAWSCredsSpy = jest
			.spyOn(CognitoService.prototype, 'fetchAWSCredentials')
			.mockImplementation(() =>
				Promise.resolve({
					AccessKeyId: 'accessKeyId',
					SecretKey: 'secretKey',
					Expiration: new Date(),
					SessionToken: 'sessionToken',
				})
			);
		const fetchIdSpy = jest
			.spyOn(CognitoService.prototype, 'fetchIdentityId')
			.mockImplementation(() => {
				return Promise.resolve('identityId');
			});
		const _authzService = interpret(authzMachine);
		_authzService.start();
		_authzService.send(
			authzMachineEvents.configure({ ...testCognitoProviderConfig })
		);
		_authzService.send(authzMachineEvents.signInRequested());
		_authzService.onTransition(state => {
			expect(state.context.service).toBeInstanceOf(CognitoService);
			expect(state.context.config).toStrictEqual(testCognitoProviderConfig);
		});

		const signinIn = await waitFor(_authzService, state =>
			state.matches('signingIn')
		);

		expect(_authzService.state.matches('signingIn')).toBeTruthy();

		_authzService.send(
			authzMachineEvents.signInCompleted({
				idToken: '',
				accessToken: '',
				refreshToken: '',
			})
		);

		const sessionEstablished = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);

		expect(_authzService.state.matches('sessionEstablished')).toBeTruthy();

		expect(fetchIdSpy).toHaveBeenCalledTimes(1);
		expect(fetchAWSCredsSpy).toHaveBeenCalledTimes(1);

		expect(sessionEstablished.context.sessionInfo.AWSCredentials).toBeDefined();
		expect(sessionEstablished.context.sessionInfo.identityID).toBeDefined();
		expect(sessionEstablished.context.sessionInfo.authenticated).toBeTruthy();
	});

	test('fetch cached auth session test', async () => {
		const fetchAWSCredsSpy = jest
			.spyOn(CognitoService.prototype, 'fetchAWSCredentials')
			.mockImplementation(() =>
				Promise.resolve({
					AccessKeyId: 'accessKeyId',
					SecretKey: 'secretKey',
					Expiration: new Date(),
					SessionToken: 'sessionToken',
				})
			);
		const fetchIdSpy = jest
			.spyOn(CognitoService.prototype, 'fetchIdentityId')
			.mockImplementation(() => {
				return Promise.resolve('identityId');
			});
		_authzService.start();
		_authzService.send(
			authzMachineEvents.configure({ ...testCognitoProviderConfig })
		);
		_authzService.send(authzMachineEvents.signInRequested());

		const signinIn = await waitFor(_authzService, state =>
			state.matches('signingIn')
		);

		expect(_authzService.state.matches('signingIn')).toBeTruthy();

		_authzService.send(
			authzMachineEvents.signInCompleted({
				idToken: '',
				accessToken: '',
				refreshToken: '',
			})
		);

		const sessionEstablished = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);

		expect(fetchIdSpy).toHaveBeenCalledTimes(2);
		expect(fetchAWSCredsSpy).toHaveBeenCalledTimes(2);

		expect(sessionEstablished.context.sessionInfo.AWSCredentials).toBeDefined();
		expect(sessionEstablished.context.sessionInfo.identityID).toBeDefined();
		expect(sessionEstablished.context.sessionInfo.authenticated).toBeTruthy();
	});

	test('refresh auth session test', async () => {
		const fetchAWSCredsSpy = jest
			.spyOn(CognitoService.prototype, 'fetchAWSCredentials')
			.mockImplementation(() =>
				Promise.resolve({
					AccessKeyId: 'accessKeyId',
					SecretKey: 'secretKey',
					Expiration: new Date(),
					SessionToken: 'sessionToken',
				})
			);
		const fetchIdSpy = jest
			.spyOn(CognitoService.prototype, 'fetchIdentityId')
			.mockImplementation(() => {
				return Promise.resolve('identityId');
			});
		_authzService.start();
		_authzService.send(
			authzMachineEvents.configure({ ...testCognitoProviderConfig })
		);
		_authzService.send(authzMachineEvents.signInRequested());

		const signinIn = await waitFor(_authzService, state =>
			state.matches('signingIn')
		);

		expect(_authzService.state.matches('signingIn')).toBeTruthy();

		_authzService.send(
			authzMachineEvents.signInCompleted({
				idToken: '',
				accessToken: '',
				refreshToken: '',
			})
		);
		_authzService.send(
			authzMachineEvents.refreshSession(
				{
					accessToken: testAccessToken,
					idToken: testIdToken,
					refreshToken: testRefreshToken,
				},
				true
			)
		);

		const sessionEstablished = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);

		expect(_authzService.state.matches('sessionEstablished')).toBeTruthy();

		expect(fetchIdSpy).toHaveBeenCalledTimes(3);
		expect(fetchAWSCredsSpy).toHaveBeenCalledTimes(3);

		expect(sessionEstablished.context.sessionInfo.AWSCredentials).toBeDefined();
		expect(sessionEstablished.context.sessionInfo.identityID).toBeDefined();
		expect(sessionEstablished.context.sessionInfo.authenticated).toBeTruthy();
	});
});

// EDGE CASES
const testCognitoProviderConfig2: CognitoProviderConfig = {
	userPoolId: 'us-west-2_WBH3jAT2F',
	region: 'us-west-2',
	clientId: '7v5k34l31fg46s451sdrd4kv6g',
};

describe('test edge cases', () => {
	const _authzService = interpret(authzMachine);
	_authzService.start();

	test('start machine test', () => {
		expect(_authzService).toBeTruthy();
		expect(_authzService).toBeDefined();
		expect(_authzService.state.matches('notConfigured'));
	});

	// configure the state machine
	_authzService.send(
		authzMachineEvents.configure({ ...testCognitoProviderConfig2 })
	);

	_authzService.onTransition(state => {
		expect(state.context.service).toBeInstanceOf(CognitoService);
		expect(state.context.config).toStrictEqual(testCognitoProviderConfig2);
	});

	test('config and service test', () => {
		// make sure machine is in configured state after configured action
		expect(_authzService.state.matches('configured'));
		expect(_authzService.state.context.service).toBeInstanceOf(CognitoService);
		expect(_authzService.state.context.config).toStrictEqual(
			testCognitoProviderConfig2
		);
	});
});
