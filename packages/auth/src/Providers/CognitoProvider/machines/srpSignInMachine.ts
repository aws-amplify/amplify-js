import { createMachine, MachineConfig } from 'xstate';

// SRPSignInState state machine
const srpSignInStateMachine: MachineConfig<any, any, any> = {
	id: 'srpSignInState',
	initial: 'notStarted',
	context: {},
	states: {
		notStarted: {
			on: {
				initiateSRP: 'initiatingSRPA',
				throwAuthError: 'error',
			},
		},
		initiatingSRPA: {
			on: {
				respondPasswordVerifier: 'respondingPasswordVerifier',
				throwPasswordVerifierError: 'error',
				throwAuthError: 'error',
				cancelSRPSignIn: 'cancelling',
			},
		},
		respondingPasswordVerifier: {
			on: {
				finalizeSRPSignIn: 'signedIn',
				respondNextAuthChallenge: 'nextAuthChallenge',
				cancelSRPSignIn: 'cancelling',
			},
		},
		nextAuthChallenge: {
			type: 'final',
		},
		signedIn: {
			type: 'final',
		},
		cancelling: {
			on: {
				restoreToNotInitialized: 'notStarted',
			},
		},
		error: {
			type: 'final',
		},
	},
};

const finalMachine = createMachine(srpSignInStateMachine);
