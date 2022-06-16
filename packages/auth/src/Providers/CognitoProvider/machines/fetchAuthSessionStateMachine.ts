import { createMachine, MachineConfig } from 'xstate';
import fetchAwsCredentialsStateMachine from './fetchAwsCredentialsStateMachine';
import fetchUserPoolTokensStateMachine from './fetchUserPoolTokensStateMachine';
import fetchIdentityStateMachine from './fetchIdentityStateMachine';

// Fetch Auth Session state machine
const fetchAuthSessionStateMachine: MachineConfig<any, any, any> = {
	id: 'fetchAuthSessionStateMachine',
	initial: 'initializingFetchAuthSession',
	context: {},
	states: {
		initializingFetchAuthSession: {
			on: {
				fetchUserPoolTokens: 'fetchingUserPoolTokens',
				fetchIdentity: 'fetchingIdentity',
				throwError: 'error',
			},
		},
		fetchingUserPoolTokens: {
			on: {
				fetchIdentity: 'fetchingIdentity',
				throwError: 'error',
			},
			...fetchUserPoolTokensStateMachine,
		},
		fetchingIdentity: {
			on: {
				fetchAwsCredentials: 'fetchingAWSCredentials',
				throwError: 'error',
			},
			...fetchIdentityStateMachine,
		},
		fetchingAWSCredentials: {
			on: {
				fetchedAuthSession: 'sessionEstablished',
				throwError: 'error',
			},
			...fetchAwsCredentialsStateMachine,
		},
		sessionEstablished: {
			type: 'final',
		},
		error: {
			type: 'final',
		},
	},
};

const finalMachine = createMachine(fetchAuthSessionStateMachine);

export default fetchAuthSessionStateMachine;
