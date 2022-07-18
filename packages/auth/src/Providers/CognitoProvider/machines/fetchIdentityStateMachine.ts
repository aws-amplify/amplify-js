import { createMachine, MachineConfig } from 'xstate';

// Fetch Identity State Machine
const fetchIdentityStateMachine: MachineConfig<any, any, any> = {
	id: 'fetchIdentityStateMachine',
	initial: 'configuring',
	context: {},
	states: {
		configuring: {
			on: {
				fetch: 'fetching',
				fetched: 'fetched',
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

const finalMachine = createMachine(fetchIdentityStateMachine);

export default fetchIdentityStateMachine;
