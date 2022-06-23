import { createMachine, MachineConfig } from 'xstate';
import { createModel } from 'xstate/lib/model';

// info/context needed to fetch session
// First, fetch user pool tokens (JWT) from the user pool
// - session = this.getSessionData();

// Second, fetch the identity ID from the identity pool using the idToken from the first step
// - need idToken passed in as argument for the call

// Third, fetch the AWS Credentials from the identity pool
// - need idToken passed in as argument for the call
// - need identityID passed in as argument for the call as well

export const fetchAuthSessionMachineModel = createModel({
	events: {
		fetchUnAuthIdentityID: () => ({}),
		fetchAuthenticatedIdentityID: () => ({}),
		fetchedIdentityID: () => ({}),
		throwError: () => ({}),
		fetchedAWSCredentials: () => ({}),
	},
});

// Fetch Auth Session state machine
export const fetchAuthSessionStateMachineConfig: MachineConfig<any, any, any> =
	{
		id: 'fetchAuthSessionStateMachine',
		initial: 'notStarted',
		context: {},
		states: {
			notStarted: {
				on: {
					fetchUnAuthIdentityID: 'fetchingIdentityID',
					fetchAuthenticatedIdentityID: 'fetchingIdentityID',
				},
			},
			fetchingIdentityID: {
				on: {
					fetchedIdentityID: 'fetchingAWSCredentials',
					throwError: 'error',
				},
			},
			fetchingAWSCredentials: {
				on: {
					fetchedAWSCredentials: 'fetched',
					throwError: 'error',
				},
			},
			fetched: {
				type: 'final',
			},
			error: {
				type: 'final',
			},
		},
	};

export const fetchAuthSessionStateMachine = createMachine(
	fetchAuthSessionStateMachineConfig
);

// const finalMachine = createMachine(fetchAuthSessionStateMachine);

// fetchAuthSessionStateMachine;
