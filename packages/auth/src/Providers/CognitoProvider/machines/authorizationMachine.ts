import {
	createMachine,
	MachineConfig,
	spawn,
	assign,
	EventFrom,
	AssignAction,
} from 'xstate';
import { stop } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';
import {
	AuthMachineContext,
	AuthTypestate,
	AuthorizationMachineContext,
} from '../types/machines';
import { CognitoProviderConfig } from '../CognitoProvider';
import { CognitoService } from '../serviceClass';
import { fetchAuthSessionStateMachine } from '../machines/fetchAuthSessionStateMachine';

// state machine events
export const authorizationMachineModel = createModel(
	{
		config: null,
		service: null,
	} as AuthorizationMachineContext,
	{
		events: {
			cachedCredentialAvailable: () => ({}),
			cancelSignIn: () => ({}),
			// configures the cognito provider
			configure: (config: CognitoProviderConfig) => ({ config }),
			fetchAuthSession: () => {
				const test: string = 'fetch test from state machine';
				console.log(test);
				return { test };
			},
			fetched: () => {
				console.log('fetch test from state machine');
				return {};
			},
			fetchUnAuthSession: () => ({}),
			noSession: () => ({}),
			receivedCachedCredentials: () => ({}),
			refreshSession: () => ({}),
			signInRequested: () => ({}),
			signInCompleted: (userPoolTokens: {
				idToken: string;
				accessToken: string;
				refreshToken: string;
			}) => {
				// console.log('idToken: ' + userPoolTokens.idToken);
				console.log({ userPoolTokens });
				return { userPoolTokens };
			},
			signOut: () => ({}),
			throwError: (error: any) => ({ error }),
		},
	}
);

// State machine actions
const authorizationStateMachineActions: Record<
	string,
	AssignAction<AuthorizationMachineContext, any>
> = {
	assignConfig: authorizationMachineModel.assign(
		{
			config: (_context, event) => event.config,
		},
		'configure'
	),
	assignService: authorizationMachineModel.assign(
		{
			service: (_context, event) =>
				new CognitoService({
					region: event.config.region,
					userPoolId: event.config.userPoolId,
					identityPoolId: event.config.identityPoolId,
					clientId: event.config.clientId,
				}),
		},
		'configure'
	),
	spawnFetchAuthSessionActor: authorizationMachineModel.assign(
		{
			actorRef: (context, event) => {
				const machine = fetchAuthSessionStateMachine.withContext({
					clientConfig: { region: context.config?.region },
					service: context.service,
					userPoolTokens: event.userPoolTokens,
				});
				const fetchAuthSessionActorRef = spawn(machine, {
					name: 'fetchAuthSessionActor',
				});
				return fetchAuthSessionActorRef;
			},
		},
		'signInCompleted'
	),
};

// Authorization state machine
const authorizationStateMachine: MachineConfig<
	AuthorizationMachineContext,
	any,
	any
> = {
	id: 'authorizationStateMachine',
	initial: 'notConfigured',
	context: authorizationMachineModel.initialContext,
	states: {
		notConfigured: {
			on: {
				configure: 'configured',
				cachedCredentialAvailable: 'sessionEstablished',
				throwError: 'error',
			},
		},
		configured: {
			on: {
				// fetchAuthSession: 'fetchingAuthSession',
				signInRequested: 'signingIn',
				fetchUnAuthSession: 'fetchingUnAuthSession',
			},
		},
		signingIn: {
			on: {
				cancelSignIn: 'fetchingUnAuthSession',
				signInCompleted: 'fetchAuthSessionWithUserPool',
			},
		},
		fetchAuthSessionWithUserPool: {
			onEntry: [authorizationStateMachineActions.spawnFetchAuthSessionActor],
			on: {
				fetched: 'sessionEstablished',
			},
			invoke: {
				src: 'fetchAuthSessionStateMachine',
			},
		},
		// for fetching session for users that haven't signed in
		fetchingUnAuthSession: {
			on: {
				fetched: 'sessionEstablished',
			},
			invoke: {
				src: 'fetchAuthSessionStateMachine',
			},
		},
		refreshingSession: {
			on: {
				refreshed: 'sessionEstablished',
			},
		},
		// waitingToStore: {
		// 	always: {
		// 		target: 'sessionEstablished',
		// 	},
		// 	on: {
		// 		error: 'error',
		// 		receivedCachedCredentials: 'sessionEstablished',
		// 	},
		// },
		// fetchingAuthSession: {
		// 	on: {
		// 		fetchedAuthSession: 'sessionEstablished',
		// 		noSession: 'configured',
		// 	},
		// 	invoke: {
		// 		src: 'fetchAuthSessionStateMachine',
		// 	},
		// 	// ...fetchAuthSessionStateMachine,
		// },
		sessionEstablished: {
			on: {
				// fetchAuthSession: 'fetchingAuthSession',
				// signOut: 'configured',
				signInRequested: 'signingIn',
				refreshSession: 'refreshingSession',
			},
		},
		error: {
			type: 'final',
		},
	},
};

export const authzMachine = createMachine(authorizationStateMachine);
export const authzMachineEvents = authorizationMachineModel.events;
