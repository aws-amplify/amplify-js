import { createMachine, MachineConfig } from 'xstate';

// Fetch AWS Credentials State Machine
const fetchAwsCredentialsStateMachine: MachineConfig<any, any, any> = {
	id: 'fetchAwsCredentialsStateMachine',
	initial: 'configuring',
	context: {},
	states: {
		configuring: {
			on: {
				fetch: 'fetching',
				fetched: 'fetched',
				throwError: 'error',
			},
		},
		fetching: {
			on: {
				fetched: 'fetched',
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

const finalMachine = createMachine(fetchAwsCredentialsStateMachine);

export default fetchAwsCredentialsStateMachine;
