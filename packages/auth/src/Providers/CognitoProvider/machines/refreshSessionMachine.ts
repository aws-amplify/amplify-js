import { createMachine, MachineConfig } from 'xstate';
import { createModel } from 'xstate/lib/model';
import {
	RefreshSessionStateMachineContext,
	AuthMachineContext,
} from '../types/machines';
import { fetchAuthSessionStateMachine } from '../machines/fetchAuthSessionStateMachine';

export const refreshSessionMachineModel = createModel({
	events: {
		refreshCognitoUserPool: () => ({}),
		refreshCognitoUserPoolWithIdentityId: () => ({}),
		refreshAWSCredentialsWithUserPool: () => ({}),
		refreshUnAuthAWSCredentials: () => ({}),
		refreshedCognitoUserPool: () => ({}),
		refreshedIdentityInfo: () => ({}),
		throwError: () => ({}),
		fetchedAWSCredentials: () => ({}),
		fetched: () => ({}),
	},
});

// Refresh Auth Session state machine
const refreshAuthSessionStateMachineConfig: MachineConfig<any, any, any> = {
	id: 'refreshAuthSessionStateMachine',
	initial: 'notStarted',
	context: refreshSessionMachineModel.initialContext,
	states: {
		notStarted: {
			on: {
				refreshCognitoUserPool: 'refreshingUserPoolToken',
				refreshCognitoUserPoolWithIdentityId:
					'refreshingUserPoolTokenWithIdentity',
				refreshAWSCredentialsWithUserPool:
					'refreshingAWSCredentialsWithUserPoolTokens',
				refreshUnAuthAWSCredentials: 'refreshingUnAuthAWSCredentials',
			},
		},
		refreshingUserPoolToken: {
			on: {
				refreshedCognitoUserPool: 'refreshed',
				refreshIdentityInfo: 'fetchingAuthSessionWithUserPool',
				throwError: 'error',
			},
		},
		refreshingUserPoolTokenWithIdentity: {
			on: {
				refreshedCognitoUserPool: 'refreshed',
				refreshIdentityInfo: 'refreshingAWSCredentialsWithUserPoolTokens',
				throwError: 'error',
			},
		},
		refreshingAWSCredentialsWithUserPoolTokens: {
			on: {
				fetchedAWSCredentials: 'refreshed',
				throwError: 'error',
			},
		},
		refreshingUnAuthAWSCredentials: {
			on: {
				fetchedAWSCredentials: 'refreshed',
				throwError: 'error',
			},
		},
		fetchingAuthSessionWithUserPool: {
			// invoke the fetchAuthSessionStateMachine
			invoke: {
				id: 'spawnFetchAuthSessionActor',
				src: fetchAuthSessionStateMachine,
				onDone: {
					target: 'refreshed',
				},
				onError: {
					target: 'error',
				},
			},
			on: {
				fetched: 'refreshed',
				throwError: 'error',
			},
			// set up invoke later
			// ...fetchAuthSessionStateMachine,
		},
		refreshed: {
			type: 'final',
		},
		error: {
			type: 'final',
		},
	},
};

export const refreshSessionStateMachine = createMachine(
	refreshAuthSessionStateMachineConfig
);
