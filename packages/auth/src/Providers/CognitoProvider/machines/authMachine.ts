import {
	createMachine,
	MachineConfig,
	send,
	spawn,
	assign,
	interpret,
	EventFrom,
	AssignAction,
	ActorRefFrom,
} from 'xstate';
import { pure, stop } from 'xstate/lib/actions';
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

let authenticationActorRef: ActorRefFrom<typeof authenticationMachine>;
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
			authenticationConfigurationFailed: () => ({}),
			authorizationConfigured: () => ({}),
			// error: (error: any) => ({ error }),
			error: () => ({}),
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
	setAuthenticationActor: authMachineModel.assign(
		{
			authenticationActorRef: () =>
				spawn(authenticationMachine, { name: 'authenticationActor' }),
		},
		'configureAuthentication'
	),
	setAuthorizationActor: authMachineModel.assign(
		{
			authorizationActorRef: () => spawn(authorizationMachine),
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
					target: 'configuringAuthentication',
					actions: [
						authStateMachineActions.assignConfig,
						authStateMachineActions.setAuthenticationActor,
					],
				},
			},
		},
		configuringAuthentication: {
			entry: (context, _) => {
				context.authenticationActorRef?.send(
					authenticationMachineEvents.configure(context.config!)
				);
			},
			on: {
				authenticationConfigured: 'configuringAuthorization',
				authenticationConfigurationFailed: 'authenticationNotConfigured',
				error: 'error',
			},
		},
		authenticationNotConfigured: {
			// onEntry: [
			// 	(context, event) => {
			// 		console.log('HEY!!!!');
			// 		// context.authenticationActorRef!.stop;
			// 	},
			// ],
			entry: ['stopAuthenticationActor'],
			always: 'configuringAuthorization',
		},
		configuringAuthorization: {
			entry: (context, event) => {
				context.authorizationActorRef?.send(
					authorizationMachineEvents.configure(context.config!)
				);
			},
			on: {
				authenticationConfigured: 'configuringAuthorization',
				error: 'error',
			},
		},
		error: {
			entry: (context, event) => {
				console.log('authenticationMachine error!');
			},
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
		stopAuthenticationActor: stop('authenticationActor'),
	},
	guards: {},
	services: {},
});

export const authMachineEvents = authMachineModel.events;
