import {
	createMachine,
	MachineConfig,
	send,
	spawn,
	assign,
	interpret,
	EventFrom,
	AssignAction,
} from 'xstate';
import { stop } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';
import {
	authenticationMachine,
	authenticationMachineEvents,
} from './authenticationMachine';
import {
	authorizationMachine,
	authorizationMachineEvents,
} from './authorizationMachine';
import { AuthMachineContext, AuthTypeState } from '../types/machines';
import { CognitoProviderConfig } from '../CognitoProvider';
import { CognitoService } from '../serviceClass';

let authenticationActorRef;
let authorizationActorRef;

async function configureAuthN(context: AuthMachineContext) {
	try {
		if (!context.config?.userPoolId) {
			throw new Error('no configured userPoolId');
		}
		send('configure', { to: 'child' });
	} catch (err) {
		return false;
	}
}

export const authMachineModel = createModel(
	{
		// config: null,
		// authenticationMachine: null,
		// authorizationMachine: null,
	} as AuthMachineContext,
	{
		events: {
			configureAuth: (config: CognitoProviderConfig) => ({ config }),
			fetchCachedCredentials: () => ({}),
			receivedCachedCredentials: () => ({}),
			configureAuthentication: () => ({}),
			configureAuthorization: () => ({}),
			authenticationConfigured: () => ({}),
			authorizationConfigured: () => ({}),
			error: (error: any) => ({ error }),
		},
	}
);

export type AuthEvents = EventFrom<typeof authMachineModel>;

const authStateMachineActions: Record<
	string,
	AssignAction<AuthMachineContext, any>
> = {
	assignConfig: authMachineModel.assign(
		{
			config: (_context, event) => event.config,
		},
		'configureAuth'
	),
	// setAuthenticationActor: authMachineModel.assign(
	// 	{
	// 		authenticationActorRef: context => {
	// 			const authenticationActorRef = context.authenticationMachine;
	// 			return authenticationActorRef;
	// 		},
	// 	},
	// 	'configureAuthentication'
	// ),
	setAuthorizationActor: authMachineModel.assign(
		{
			authorizationActorRef: context => {
				const authorizationActorRef = context.authorizationMachine;
				return authorizationActorRef;
			},
		},
		'configureAuthorization'
	),
};

// Top-level AuthState state machine
const authStateMachine: MachineConfig<AuthMachineContext, any, AuthEvents> = {
	id: 'authMachine',
	initial: 'notConfigured',
	states: {
		notConfigured: {
			on: {
				configureAuth: {
					target: 'configuringAuth',
					actions: [authStateMachineActions.assignConfig],
				},
			},
		},
		configuringAuth: {
			on: {
				// TODO: implement credentialStore state machine
				// fetchCachedCredentials: 'waitingForCachedCredentials',

				// Following line is temporary until credential store is implemented
				configureAuthentication: 'configuringAuthentication',
			},
		},
		waitingForCachedCredentials: {
			on: {
				receivedCachedCredentials: 'validatingCredentialsAndConfiguration',
			},
		},
		validatingCredentialsAndConfiguration: {
			on: {
				configureAuthentication: 'configuringAuthentication',
				configureAuthorization: 'configuringAuthorization',
			},
		},
		configuringAuthentication: {
			invoke: {
				id: 'authenticationStateMachine',
				src: authenticationMachine,
				onDone: 'configuringAuthorization',
				data: {
					config: (context: { config: any }, event: any) => context.config,
				},
			},
			entry: send(authenticationMachineEvents.configure(), {
				to: 'authenticationStateMachine',
			}),
		},
		configuringAuthorization: {
			invoke: {
				id: 'authorizationStateMachine',
				src: context => {
					if (context.config) {
						return context.authorizationMachine.send(
							authorizationMachineEvents.configure(context.config)
						);
					}
					// error?
				},
				onDone: {
					target: 'configured',
				},
			},
		},
		error: {
			type: 'final',
		},
		configured: {
			type: 'final',
		},
	},
};
export const authMachine = createMachine<
	AuthMachineContext,
	AuthEvents,
	AuthTypeState
>(authStateMachine, {
	actions: {
		// stopAuthenticationActor: stop(authenticationActorName),
		// stopAuthorizationActor: stop(authorizationActorName),
	},
	guards: {},
	services: {},
});

export const authMachineEvents = authMachineModel.events;
