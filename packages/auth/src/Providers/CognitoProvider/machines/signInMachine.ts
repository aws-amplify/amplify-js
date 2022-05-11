import { createMachine, MachineConfig } from 'xstate';
import { cognitoSignIn } from '../service';
import {
	CognitoIdentityProviderClientConfig,
	AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoProviderConfig } from '../CognitoProvider';

export interface SignInMachineContext {
	// Q: Could also just pass down the client directly
	clientConfig: CognitoIdentityProviderClientConfig;
	authConfig: CognitoProviderConfig;
}

export type SignInEvents =
	| { type: 'initiateSignIn'; username: string; password: string }
	| { type: 'initiatingSignIn' };

// SRPSignInState state machine
const signInMachineConfig: MachineConfig<
	SignInMachineContext,
	any,
	SignInEvents
> = {
	id: 'srpSignInState',
	initial: 'notStarted',
	context: {
		// TODO: should have config passed down from the parent machine
		clientConfig: {},
		authConfig: {
			userPoolId: '',
			clientId: '',
			// hardcoded
			region: 'us-west-2',
		},
	},
	states: {
		notStarted: {
			on: {
				// guarded transitions -> check the initiateAuth responses
				initiateSignIn: {
					target: 'initiatingSignIn',
				},
			},
		},
		initiatingSignIn: {
			on: {},
			invoke: {
				id: 'InitaiteAuth',
				src: (context, event) =>
					cognitoSignIn(context.clientConfig, {
						signInType: 'Password',
						// @ts-ignore
						username: event.username,
						clientId: context.authConfig.clientId,
						authFlow: AuthFlowType.USER_PASSWORD_AUTH,
						// @ts-ignore
						password: event.password,
					}),
			},
		},
		// notStarted: {
		// 	on: {
		// 		initiateSRP: 'initiatingSRPA',
		// 		throwAuthError: 'error',
		// 	},
		// },
		// initiatingSRPA: {
		// 	on: {
		// 		respondPasswordVerifier: 'respondingPasswordVerifier',
		// 		throwPasswordVerifierError: 'error',
		// 		throwAuthError: 'error',
		// 		cancelSRPSignIn: 'cancelling',
		// 	},
		// },
		// respondingPasswordVerifier: {
		// 	on: {
		// 		finalizeSRPSignIn: 'signedIn',
		// 		respondNextAuthChallenge: 'nextAuthChallenge',
		// 		cancelSRPSignIn: 'cancelling',
		// 	},
		// },
		// nextAuthChallenge: {
		// 	type: 'final',
		// },
		// signedIn: {
		// 	type: 'final',
		// },
		// cancelling: {
		// 	on: {
		// 		restoreToNotInitialized: 'notStarted',
		// 	},
		// },
		// error: {
		// 	type: 'final',
		// },
	},
};

const finalMachine = createMachine(signInMachineConfig);
