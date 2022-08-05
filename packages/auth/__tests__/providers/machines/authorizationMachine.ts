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

// what is the initial state ?
// does configure work?
// does fetchAuthSession actor gets spawned? when?
// does it transition to error state?
// (not sure how to test this yet) can we mock the fetchAuthSessionMachine and test the invoke function?

const testCognitoProviderConfig: CognitoProviderConfig = {
	userPoolId: 'us-west-2_WBH3jAT2F',
	region: 'us-west-2',
	clientId: '7v5k34l31fg46s451sdrd4kv6g',
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
// configure the provider
provider.configure({ ...testCognitoProviderConfig });

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
		sessionToken3 =
			sessionEstablished.context.sessionInfo.AWSCredentials.SessionToken;
	});

	let sessionToken3: string = '';
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
		// fetch unauth
		// fetch second time
		// spy on fetchUnAuthId / fetchUnAuthAWSCreds
		// assert they have been called 1 time only
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
		// const sessionToken2 =
		// 	sessionEstablished2.context.sessionInfo.awsCredentials.SessionToken;
		// expect(sessionToken === sessionToken2).toBeTruthy();
		expect(fetchUnAuthIdSpy).toHaveBeenCalledTimes(1);
		expect(fetchUnAuthAWSCredsSpy).toHaveBeenCalledTimes(1);
	});

	test('refresh UnAuth session test', async () => {
		const _authzService = interpret(authzMachine);
		_authzService.start();
		_authzService.send(authzMachineEvents.refreshSession());
		const sessionEstablished = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);
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

	let sessionToken1: string = '';
	let sessionToken2: string = '';

	// to test, login on the sample app and then copy and paste the tokens from the fetched auth session
	const testAccessToken = '';
	const testIdToken = '';
	const testRefreshToken = '';

	test('fetch Auth tokens test', async () => {
		_authzService.start();
		_authzService.send(authzMachineEvents.signInRequested());
		_authzService.send(
			authzMachineEvents.configure({ ...testCognitoProviderConfig })
		);
		_authzService.onTransition(state => {
			expect(state.context.service).toBeInstanceOf(CognitoService);
			expect(state.context.config).toStrictEqual(testCognitoProviderConfig);
		});
		// make sure state machine is back to the session Established state after doing fetchAuthSession
		expect(_authzService.state.matches('signingIn')).toBeTruthy();

		_authzService.send(
			authzMachineEvents.signInCompleted({
				accessToken: testAccessToken,
				idToken: testIdToken,
				refreshToken: testRefreshToken,
			})
		);
		expect(
			_authzService.state.matches('fetchAuthSessionWithUserPool')
		).toBeTruthy();

		const sessionEstablished = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);

		expect(_authzService.state.matches('sessionEstablished')).toBeTruthy();

		expect(sessionEstablished.context.sessionInfo.AWSCredentials).toBeDefined();
		expect(sessionEstablished.context.sessionInfo.identityID).toBeDefined();
		expect(sessionEstablished.context.sessionInfo.authenticated).toBeTruthy();

		sessionToken1 =
			sessionEstablished.context.sessionInfo.AWSCredentials.SessionToken;
	});

	test('fetch cached auth session test', async () => {
		_authzService.send(authzMachineEvents.fetchUnAuthSession());
		const sessionEstablished = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);
		sessionToken2 =
			sessionEstablished.context.sessionInfo.AWSCredentials.SessionToken;
		expect(sessionEstablished.context.sessionInfo.identityID).toBeDefined();
		expect(sessionToken1 === sessionToken2).toBeTruthy();
	});

	test('refresh auth session test', async () => {
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
		expect(_authzService.state.matches('refreshingSession')).toBeTruthy();

		const sessionEstablished = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);

		sessionToken2 =
			sessionEstablished.context.sessionInfo.AWSCredentials.SessionToken;

		expect(sessionToken1 === sessionToken2).toBeFalsy();
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
