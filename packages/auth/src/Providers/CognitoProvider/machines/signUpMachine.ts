import { createMachine, MachineConfig } from 'xstate';

// TODO: what should we store here?
interface SignUpMachineContext {}

type SignUpEvents =
	| { type: 'initiateSignUp' }
	| { type: 'confirmSignUp' }
	| { type: 'initiateSignUpSuccess' }
	| { type: 'initiateSignUpFailure' }
	| { type: 'confirmSignUpSuccess' }
	| { type: 'confirmSignUpFailure' };

const signUpStateMachine: MachineConfig<
	SignUpMachineContext,
	any,
	SignUpEvents
> = {
	id: 'signUpState',
	initial: 'notStarted',
	context: {},
	states: {
		notStarted: {
			on: {
				initiateSignUp: 'initiatingSigningUp',
				confirmSignUp: 'confirmingSignUp',
			},
		},
		initiatingSigningUp: {
			on: {
				initiateSignUpSuccess: 'signingUpInitiated',
				initiateSignUpFailure: 'error',
			},
		},
		signingUpInitiated: {
			on: {
				initiateSignUp: 'initiatingSigningUp',
				confirmSignUp: 'confirmingSignUp',
			},
		},
		confirmingSignUp: {
			on: {
				confirmSignUp: 'confirmingSignUp',
				confirmSignUpSuccess: 'signedUp',
				confirmSignUpFailure: 'error',
			},
		},
		signedUp: {
			type: 'final',
		},
		error: {
			type: 'final',
		},
	},
};

const finalMachine = createMachine(signUpStateMachine);
