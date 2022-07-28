import { createMachine, MachineConfig, assign } from 'xstate';
import { createModel } from 'xstate/lib/model';
import {
	RefreshSessionStateMachineContext,
	AuthMachineContext,
	AuthorizationMachineContext,
	RefreshSessionContext,
} from '../types/machines';
import { fetchAuthSessionStateMachine } from '../machines/fetchAuthSessionStateMachine';

export const refreshSessionMachineModel = createModel(
	{
		awsCredentials: null,
		identityId: null,
	} as RefreshSessionContext,
	{
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
	}
);

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
			invoke: {
				id: 'spawnFetchAuthSessionActor',
				src: fetchAuthSessionStateMachine,
				data: {
					clientConfig: (context: AuthorizationMachineContext, _event: any) =>
						context.config?.region,
					service: (context: AuthorizationMachineContext, _event: any) =>
						context.service,
					authenticated: false,
				},
				onDone: {
					target: 'refreshed',
					actions: [
						assign({
							identityId: (context, event) => {
								console.log('EVENT: ');
								console.log({ eventFromFetchAuthSessionMachine: event });
								return event.data.identityID;
							},
							awsCredentials: (context, event) => event.data.AWSCredentials,
						}),
					],
				},
				onError: {
					target: 'error',
				},
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
			data: {
				identityId: (context: RefreshSessionContext) => context.identityId,
				AWSCredentials: (context: RefreshSessionContext) =>
					context.awsCredentials,
			},
		},
		error: {
			type: 'final',
		},
	},
};

export const refreshSessionStateMachine = createMachine(
	refreshAuthSessionStateMachineConfig
);
