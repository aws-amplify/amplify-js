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
import { AuthorizationMachineContext } from '../types/machines';
import { CognitoProviderConfig } from '../CognitoProvider';
import { CognitoService } from '../serviceClass';
import { fetchAuthSessionStateMachine } from '../machines/fetchAuthSessionStateMachine';
import { refreshSessionStateMachine } from '../machines/refreshSessionMachine';

// state machine events
export const authorizationMachineModel = createModel(
	{
		config: null,
		service: null,
		identityID: null,
		AWSCredentials: null,
	} as AuthorizationMachineContext,
	{
		events: {
			cachedCredentialAvailable: () => ({}),
			cancelSignIn: () => ({}),
			// configures the cognito provider
			configure: (config: CognitoProviderConfig) => ({ config }),
			fetchAuthSession: () => {
				return {};
			},
			fetched: () => {
				// console.log('fetch test from state machine');
				return {};
			},
			fetchUnAuthSession: () => ({}),
			noSession: () => ({}),
			receivedCachedCredentials: () => ({}),
			refreshSession: () => ({}),
			signInRequested: () => ({}),
			// save the userpool tokens in the event for later use
			signInCompleted: (userPoolTokens: {
				idToken: string;
				accessToken: string;
				refreshToken: string;
			}) => {
				// console.log('idToken: ' + userPoolTokens.idToken);
				// console.log('UserPool Tokens: ');
				// console.log({ userPoolTokens });
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
	// gets the identityID and AWS Credentials from the fetchAuthSessionStateMachine
	getSession: authorizationMachineModel.assign({
		getSession: (context: any, event: any) => {
			// console.log('GET SESSION ACTION FROM AUTHORIZATION MACHINE: ');
			// console.log([event.data.identityID, event.data.AWSCredentials]);
			// context.identityID = event.data.identityID;
			// context.AWSCredentials = event.data.AWSCredentials;
			// console.log(event);
			return [event.data.identityID, event.data.AWSCredentials];
		},
	}),
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
				configure: {
					target: 'configured',
					actions: [
						authorizationStateMachineActions.assignConfig,
						authorizationStateMachineActions.assignService,
					],
				},
				cachedCredentialAvailable: 'sessionEstablished',
				throwError: 'error',
			},
		},
		// state after cognito is configured
		configured: {
			on: {
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
			// onEntry: [authorizationStateMachineActions.spawnFetchAuthSessionActor],
			invoke: {
				id: 'spawnFetchAuthSessionActor',
				src: fetchAuthSessionStateMachine,
				data: {
					clientConfig: (context: any, event: any) => context.config?.region,
					service: (context: any, event: any) => context.service,
					userPoolTokens: (context: any, event: any) => event.userPoolTokens,
					authenticated: true,
				},
				onDone: {
					target: 'sessionEstablished',
					actions: [
						// assign({
						// 	getSession: (context: any, event: any) => {
						// 		return event.data.identityID;
						// 	},
						// }),
						authorizationStateMachineActions.getSession,
					],
				},
				onError: {
					target: 'error',
				},
			},
			// on: {
			// 	fetched: 'sessionEstablished',
			// },
		},
		// for fetching session for users that haven't signed in
		fetchingUnAuthSession: {
			on: {
				fetched: 'sessionEstablished',
			},
			invoke: {
				id: 'spawnFetchAuthSessionActor',
				src: fetchAuthSessionStateMachine,
				data: {
					clientConfig: (context: any, event: any) => context.config?.region,
					service: (context: any, event: any) => context.service,
					userPoolTokens: (context: any, event: any) => event.userPoolTokens,
					authenticated: false,
				},
				onDone: {
					target: 'sessionEstablished',
					actions: [
						// assign({
						// 	getSession: (context: any, event: any) => {
						// 		return event.data.identityID;
						// 	},
						// }),
						authorizationStateMachineActions.getSession,
					],
				},
				onError: {
					target: 'error',
				},
			},
		},
		refreshingSession: {
			// invoke: {
			// 	id: 'refreshSessionStateMachine',
			// },
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
		sessionEstablished: {
			on: {
				signInRequested: 'signingIn',
				refreshSession: 'refreshingSession',
			},
		},
		error: {
			type: 'final',
		},
	},
};

export const authzMachine = createMachine(authorizationStateMachine, {
	actions: {
		stopFetchAuthSessionActor: stop('fetchAuthSessionActor'),
	},
});
export const authzMachineEvents = authorizationMachineModel.events;
