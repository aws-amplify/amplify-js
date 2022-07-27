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
	AuthorizationMachineContext,
	UserPoolTokens,
	fetchAuthSessionEvent,
	beginningSessionEvent,
} from '../types/machines';
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
			fetchAuthSession: () => ({}),
			fetched: () => ({}),
			fetchUnAuthSession: () => ({}),
			noSession: () => ({}),
			receivedCachedCredentials: () => ({}),
			refreshSession: () => ({}),
			refreshed: () => ({}),
			signInRequested: () => ({}),
			// save the userpool tokens in the event for later use
			signInCompleted: (userPoolTokens: any) => {
				return { userPoolTokens };
			},
			signOut: () => ({}),
			throwError: (error: any) => ({ error }),
		},
	}
);

type AuthzEvents = EventFrom<typeof authorizationMachineModel>;

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
	assignAuthedSession: authorizationMachineModel.assign({
		sessionInfo: (_context: any, event: fetchAuthSessionEvent) => {
			return {
				identityID: event.data.identityID,
				AWSCredentials: event.data.AWSCredentials,
				authenticated: true,
			};
		},
	}),
	assignUnAuthedSession: authorizationMachineModel.assign({
		sessionInfo: (_context: any, event: fetchAuthSessionEvent) => {
			return {
				identityID: event.data.identityID,
				AWSCredentials: event.data.AWSCredentials,
				authenticated: false,
			};
		},
	}),
	// gets the identityID and AWS Credentials from the fetchAuthSessionStateMachine
	sessionInfo: authorizationMachineModel.assign({
		sessionInfo: (_context: any, event: fetchAuthSessionEvent) => {
			return {
				identityID: event.data.identityID,
				AWSCredentials: event.data.AWSCredentials,
			};
		},
	}),
};

// Authorization state machine
const authorizationStateMachine: MachineConfig<
	AuthorizationMachineContext,
	any,
	AuthzEvents
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
			invoke: {
				id: 'spawnFetchAuthSessionActor',
				src: fetchAuthSessionStateMachine,
				data: {
					clientConfig: (context: AuthorizationMachineContext, _event: any) =>
						context.config?.region,
					service: (context: AuthorizationMachineContext, _event: any) =>
						context.service,
					userPoolTokens: (_context: any, event: beginningSessionEvent) =>
						event.userPoolTokens,
					authenticated: true,
				},
				onDone: {
					target: 'sessionEstablished',
					actions: [authorizationStateMachineActions.assignAuthedSession],
				},
				onError: {
					target: 'error',
				},
			},
		},
		// for fetching session for users that haven't signed in
		fetchingUnAuthSession: {
			on: {
				// fetched: 'sessionEstablished',
			},
			invoke: {
				id: 'spawnFetchAuthSessionActor',
				src: fetchAuthSessionStateMachine,
				data: {
					clientConfig: (context: AuthorizationMachineContext, _event: any) =>
						context.config?.region,
					service: (context: AuthorizationMachineContext, _event: any) =>
						context.service,
					userPoolTokens: (_context: any, event: beginningSessionEvent) =>
						event.userPoolTokens,
					authenticated: false,
				},
				onDone: {
					target: 'sessionEstablished',
					actions: [authorizationStateMachineActions.assignUnAuthedSession],
				},
				onError: {
					target: 'error',
				},
			},
		},
		refreshingSession: {
			invoke: {
				id: 'refreshSessionStateMachine',
				src: refreshSessionStateMachine,
			},
			data: {
				clientConfig: (context: AuthorizationMachineContext, _event: any) =>
					context.config?.region,
				service: (context: AuthorizationMachineContext, _event: any) =>
					context.service,
				userPoolTokens: (_context: any, event: beginningSessionEvent) =>
					event.userPoolTokens,
				authenticated: false,
			},
			on: {
				refreshed: 'sessionEstablished',
				// from refreshed to configure (token expired)
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
