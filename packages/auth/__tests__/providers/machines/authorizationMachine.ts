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

	// test('refresh session error', () => {
	// 	expect(() => provider2.refreshSession()).toThrow(Error);
	// });
});

// initialize the provider
const provider = new CognitoProvider({ ...testCognitoProviderConfig });
// configure the provider
provider.configure({ ...testCognitoProviderConfig });

// UNAUTH FLOW
describe('Authorization Machine Test UnAuth Flow', () => {
	// start the state machine
	const _authzService = interpret(authzMachine);
	_authzService.start();

	test('start machine test', () => {
		expect(_authzService).toBeTruthy();
		expect(_authzService).toBeDefined();
		expect(_authzService.state.matches('notConfigured'));
	});

	// configure the state machine
	_authzService.send(
		authzMachineEvents.configure({ ...testCognitoProviderConfig })
	);

	_authzService.onTransition(state => {
		expect(state.context.service).toBeInstanceOf(CognitoService);
		expect(state.context.config).toStrictEqual(testCognitoProviderConfig);
		// console.log(state);
	});

	test('config and service test', () => {
		// make sure machine is in configured state after configured action
		expect(_authzService.state.matches('configured'));
		expect(_authzService.state.context.service).toBeInstanceOf(CognitoService);
		expect(_authzService.state.context.config).toStrictEqual(
			testCognitoProviderConfig
		);
	});

	// fetch un auth session
	_authzService.send(authzMachineEvents.fetchUnAuthSession());

	test('fetch UnAuth tokens test', async () => {
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

		sessionToken3 =
			sessionEstablished.context.sessionInfo.AWSCredentials.SessionToken;
	});

	const sessionToken1: string = '';
	const sessionToken2: string = '';
	let sessionToken3: string = '';
	let sessionToken4: string = '';

	test('fetch cached session UnAuth test', async () => {
		_authzService.send(authzMachineEvents.fetchUnAuthSession());
		const sessionEstablished = await waitFor(_authzService, state =>
			state.matches('sessionEstablished')
		);
		sessionToken4 =
			sessionEstablished.context.sessionInfo.AWSCredentials.SessionToken;
		expect(sessionToken3 === sessionToken4).toBeTruthy();
	});

	test('refresh UnAuth session test', async () => {
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
	const _authzService = interpret(authzMachine);
	_authzService.start();

	test('start machine test', () => {
		expect(_authzService).toBeTruthy();
		expect(_authzService).toBeDefined();
		expect(_authzService.state.matches('notConfigured'));
	});

	// configure the state machine
	_authzService.send(
		authzMachineEvents.configure({ ...testCognitoProviderConfig })
	);

	_authzService.onTransition(state => {
		expect(state.context.service).toBeInstanceOf(CognitoService);
		expect(state.context.config).toStrictEqual(testCognitoProviderConfig);
		// console.log(state);
	});

	test('config and service test', () => {
		// make sure machine is in configured state after configured action
		expect(_authzService.state.matches('configured'));
		expect(_authzService.state.context.service).toBeInstanceOf(CognitoService);
		expect(_authzService.state.context.config).toStrictEqual(
			testCognitoProviderConfig
		);
	});

	let sessionToken1: string = '';
	let sessionToken2: string = '';
	const sessionToken3: string = '';
	const sessionToken4: string = '';

	// to test, login on the sample app and then copy and paste the tokens from the fetched auth session
	const testAccessToken =
		'eyJraWQiOiJiNU1ucXRxbUdNaVNOZlI2VUZ1UUVDU1J6R3hiVHkrMEthbmhyK3dyMHJNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjZGY0ZGRiZC01NTg3LTQ4ZWEtODE2NS02YzYyN2YyZDk3ZDEiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl9XQkgzakFUMkYiLCJjbGllbnRfaWQiOiI3djVrMzRsMzFmZzQ2czQ1MXNkcmQ0a3Y2ZyIsIm9yaWdpbl9qdGkiOiJkMzE4YmIxZi01ZDU2LTRlNDktOTcyZi00NjNlMWVjZGQxNmIiLCJldmVudF9pZCI6ImE1MDA4ZmMyLWYxMzEtNDQ2Yy04NjM2LTcwNzExOWY4NDYwMyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE2NTk2MzcyMDQsImV4cCI6MTY1OTY0MDgwNCwiaWF0IjoxNjU5NjM3MjA0LCJqdGkiOiI2ZmFkYzNmNy02NTBiLTRhNmUtOThjOC1mOTIxZWU0ZjEyZTciLCJ1c2VybmFtZSI6ImFtcGxpZnlraGEifQ.tIwwB5Lo5hzWr4yyriespMn8qZcft5rk29cZ1Mni_bnT8Ehd0-m_sMN1-r8CSBiEhK0RdnA42URZ2ODYQ_6Bd279wO3HbN4cxesUU-gjCDHXQgp4687atTOJ4ZJyF0laMUHKwwHrqpIP4RSQrQ63gEqk2UM6bTEftaMmEXQPSdRQcF5AZttBPRBFWdGZra1sLnwwGUK0Y2KYUeHd_S6u1t2VgWBL7n5lnPI-PVwL3ynT3pn3gVqF4DOGXlcXADEz4hVqG1Cccna2e1YmtW9dHIy8wcX3ZBT6QZmMgz1nd7aLFZEuXpP-TCDjFxcOK5nNwNSqC5teTFvJrwsBwQshNw';
	const testIdToken =
		'eyJraWQiOiJQUm84Uk9SSVRpb0JUSHZ1YlZKRXowaExQQ2NQbVlLOXlEQWttRUViSTZzPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjZGY0ZGRiZC01NTg3LTQ4ZWEtODE2NS02YzYyN2YyZDk3ZDEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yX1dCSDNqQVQyRiIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImFtcGxpZnlraGEiLCJvcmlnaW5fanRpIjoiZDMxOGJiMWYtNWQ1Ni00ZTQ5LTk3MmYtNDYzZTFlY2RkMTZiIiwiYXVkIjoiN3Y1azM0bDMxZmc0NnM0NTFzZHJkNGt2NmciLCJldmVudF9pZCI6ImE1MDA4ZmMyLWYxMzEtNDQ2Yy04NjM2LTcwNzExOWY4NDYwMyIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjU5NjM3MjA0LCJwaG9uZV9udW1iZXIiOiIrMTI0MDkzODkzNzEiLCJleHAiOjE2NTk2NDA4MDQsImlhdCI6MTY1OTYzNzIwNCwianRpIjoiNDA3Njg1MGQtNjUxNy00YjZlLWI5NDItMWMxNGIxMzRiNTVhIiwiZW1haWwiOiJraGF0cnVvbmcyMDA5QGdtYWlsLmNvbSJ9.Xt2KJeqiM8SzN7Fbc_DGQtJ_ZcmiCmEGWGeNWXjt2v-zgw83tzcLVRVQe8d_UoLdZFcDgs0Ezr2r1GRT1W1mmeT2RRwLFo8RZ53uLxsfSockzQx8ex-n3esIfaRYfWjphln75tvvrkapWrzlC3cv03OaVrwEUnyVGJkLRG_yauYTHG0qf8xvU9_qKmo9t1FOzjHI7zKPyJpwfNCXZMw8I5CNccVemoYyf58iRNcMc-OTs-vyrrtHFQWVFmRDadCqYBbmh0Lmx85HOM1aWmZmPgeff4kfZTpkll9TZ6AHujTbJg7QFrK5hR-xLT2sr8mr8E8vX7H_yVoNESVt6-VLDg';
	const testRefreshToken =
		'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.SuuA8o5_IDAsyx6AbL1BygCdN9tUIOBena_NxalsWYLoetL0_w_k424YawZqqEqpxGg4kW9yliTmbYwPyv9ioHyEu2evTqHqpkojvKt4uyXcNYkLGhBHCRvUg3FGE-Lh5vMdDyhPvjlQ3ww54T4IlwwKaAFO4YGzjqO3n9iqhzgys8yl-f4bp8tNvEfdl8dpynGK8wG9bP76LaNRgfEF1l_3fN8gTJ2N2ecBTCIoztM71IHFLnw4YPeFW_cfeyOzF1WZyzSy3UpveQ3agkoVkHCOjYyh16k3XDP4S2DjDKyBtwJnBxdbEgWz9jr4e2TNhy8G75giQ4ZhXxkracFWpA.6HkFd3IBFA4KmvNs.m71S_L2voeMU-R8mcIxbhX2OoJOc-X8moBlV3JtZQNdnv_4Dqp7P6TYh8xmG_uT0Ae1CAUFqepatkrh2TurFwZt9vDwqtCE04DFi3UEsmiNX0k2MdzVDB2x5gpOs5Sea14S7JOgK2TjHPHvQ5v_vx41nMuiGQ9EqtS57OyLkHVDV93JaZz7IiDBfaA30R5YxkPmeP16Ff8trDQ9WliTrV_Vh-mDortFR3U8SKVfQofPvuDoEss2FIhustHHZtPPg4sKnj3AF10hf1nYei2BZiC_TwxzATcv_C5m4ZbYbejFsux1b1AeMtV4J1ahK1ETcYkN29mV5f7eG7mQke1y4dRwuKG42ZIOJKdkX_FCMxlW5iKWp5_p75_kuVuOc2br5CUC1I8HSJac0OfcNtu2cNFtRt5IjFg17K3bI1it8mjySU6LVDsXwB52aYPIg6ETA4nsppNsmXhUOZBtJCz8sxAnVfMZs0Kgc3Ou-OZKXoWS0QQWN6sA5UGZt0n4rO0C94v62X9SfLfD3zyKXArKiIKn_Xvsalietb5QPCwSep8HOkEDGKy96wa_We7Dr_50WUFbxq4otSe9ignDh2O76R_ZiLH6hWz1GRdUhQgyyaD9bJQ74cfILh2k1a_g42o9Bky8ZQY_94SPr-gTL5UFrd8v0WXow00r-D2Y8DASIcF_kqQLnB0vhSg-0uUoBQsGQsUarx641S7fqX_R_3rIMRH0pqUefwDcUgTwFpOVpMzrp-fDkSJo_CbIrGad9alhH4MqcBwOboc6cM2c_pbTA07Zu_rO7j-QdxIQDji1W3P7wDKHQdZl4BwZaBwmMFDFOpza78l2dKdlj7ABjPu0eCsCOeuUyrr_MCfKut9RmR6_EXcGx8Mljbm6_HUj_RuxTQzGolrZZr1rVvVtJSBE2CMWw_e0v9jrTTB9e7ZdGzPEkNHt0D762yLhKDIdLwwTZ-XYO4WOPOGQb3vwUst19o5jS139Gkk3L9SfV126B0IvTKyRQZpDaDhN5I9dJRDQnpDnnWPsqLaBp7iR6KQ-QsLu9q1oaKeCtjHoE3Nww4PDb8mCT2vglyk6Sj_HYj4vb7ZTv6qB7WW3QYV4ZI8ZLAQCLXNsokdUvzEL65MvkeMA9us2pBFZ4GitIa43v5phGc8Lpc_JLaycbCPzXenKsDv1NF06RnJmY9gMTNtSiz54pZjggNkMBcHCdpYi8gy0kZmhlr3WMI3Ntmii6LfgzSM5xc427qqHhOYCTxWSDVihcy-jAeZisKcdU_wWfui1sqr_Co3m5kd6QqA.ZjYF0x3pCR2tvjH61rzaYA';

	test('fetch Auth tokens test', async () => {
		_authzService.send(authzMachineEvents.signInRequested());

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
	// identityPoolId: 'us-west-2:6f687fc7-c8b0-42f3-8868-d36a54342aab',
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
		// console.log(state);
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
