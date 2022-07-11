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
import { AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';
import { signInMachine } from './signInMachine';
import { SignInParams, SignInWithSocial } from '../../../types';
import { AuthMachineContext, AuthTypestate } from '../types/machines';
import { CognitoProviderConfig } from '../CognitoProvider';
import { CognitoService } from '../serviceClass';
import fetchAuthSessionStateMachine from './fetchAuthSessionStateMachine';

// events
export const authorizationMachineModel = createModel(
	{
		config: null,
		service: null,
	} as AuthMachineContext,
	{
		events: {
			configure: (config: CognitoProviderConfig) => ({ config }),
			fetchAuthSession: () => {
				const test: string = 'fetch test from state machine';
				console.log(test);
				return { test };
			},
			fetchedAuthSession: () => ({}),
			noSession: () => ({}),
			error: (error: any) => ({ error }),
		},
	}
);

// Authorization state machine
const authorizationStateMachine: MachineConfig<any, any, any> = {
	id: 'authorizationStateMachine',
	initial: 'notConfigured',
	context: {},
	states: {
		notConfigured: {
			on: {
				configure: 'configured',
			},
		},
		configured: {
			on: {
				fetchAuthSession: 'fetchingAuthSession',
			},
		},
		fetchingAuthSession: {
			on: {
				fetchedAuthSession: 'sessionEstablished',
				noSession: 'configured',
			},
			invoke: {
				src: 'fetchAuthSessionStateMachine',
			},
			// ...fetchAuthSessionStateMachine,
		},
		sessionEstablished: {
			on: {
				fetchAuthSession: 'fetchingAuthSession',
			},
		},
		error: {
			type: 'final',
		},
	},
};

// State machine actions
const authorizationStateMachineActions: Record<
	string,
	AssignAction<AuthMachineContext, any>
> = {};

export const authzMachine = createMachine(authorizationStateMachine);
export const authzMachineEvents = authorizationMachineModel.events;
