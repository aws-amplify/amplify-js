import { createMachine, MachineConfig } from 'xstate';

// Fetch User Pool Tokens State Machine
const fetchUserPoolTokensStateMachine: MachineConfig<any, any, any> = {
	id: 'fetchUserPoolTokensStateMachine',
	initial: 'configuring',
	context: {},
	states: {
		configuring: {
			on: {
				refresh: 'refreshing',
				fetched: 'fetched',
				throwError: 'error',
			},
		},
		refreshing: {
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

const finalMachine = createMachine(fetchUserPoolTokensStateMachine);

export default fetchUserPoolTokensStateMachine;
