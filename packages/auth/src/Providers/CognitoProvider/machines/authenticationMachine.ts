import {
	AuthFlowType,
	CognitoIdentityProviderClientConfig,
} from '@aws-sdk/client-cognito-identity-provider';
import { createMachine, MachineConfig } from 'xstate';
import { CognitoProviderConfig } from '../CognitoProvider';
import { cognitoSignIn } from '../service';

// TODO: What to store here?
interface AuthMachineContext {}

interface AuthStates {}

type AuthEvents =
	| { type: 'configure'; data: any }
	| { type: 'initializedSignedIn' }
	| { type: 'initializedSignedOut' }
	| { type: 'cancelSignUp' }
	| { type: 'cancelSignIn' }
	| { type: 'error' }
	| { type: 'signOutRequested' }
	| { type: 'signInRequested' }
	| { type: 'initiateSignUp' };

// AuthenticationState state machine
const authenticationStateMachine: MachineConfig<
	AuthMachineContext,
	any,
	AuthEvents
> = {
	id: 'authenticationState',
	initial: 'notConfigured',
	context: {},
	states: {
		notConfigured: {
			on: {
				configure: {
					target: 'configured',
					actions: 'sayHello',
				},
			},
		},
		configured: {
			always: [
				{ target: 'signedIn', cond: 'isAuthenticated' },
				{ target: 'signedOut' },
			],
			// on: {
			// 	// check if user is authenticated, go to 'signedIn' state
			// 	initializedSignedIn: 'signedIn',
			// 	// else go to 'signedOut' state
			// 	initializedSignedOut: 'signedOut',
			// },
		},
		signingOut: {
			on: {
				initializedSignedIn: 'signedIn',
				initializedSignedOut: 'signedOut',
			},
		},
		signedOut: {
			on: {
				signInRequested: 'signingIn',
				initiateSignUp: 'signingUp',
			},
		},
		signingUp: {
			on: {
				cancelSignUp: 'signedOut',
				error: 'error',
			},
		},
		signingIn: {
			on: {
				cancelSignIn: 'signedOut',
				error: 'error',
			},
			// ...srpSignInState
			// spawn the sign in actor here
		},
		signedIn: {
			on: {
				signOutRequested: 'signedOut',
			},
		},
		error: {
			type: 'final',
		},
	},
};

export const authMachine = createMachine(authenticationStateMachine, {
	actions: {
		sayHello: async (context, event) => {
			// @ts-ignore
			console.log(event);
			// @ts-ignore
			const { config } = event.data as { config: CognitoProviderConfig };
			console.log(config);
			const res = await cognitoSignIn(config, {
				username: 'jamesauchu',
				password: 'The#test1',
				signInType: 'Password',
				clientId: config.clientId,
				authFlow: AuthFlowType.USER_PASSWORD_AUTH,
			});
			console.log(res);
		},
	},
	guards: {
		isAuthenticated: (context, event) => {
			// NOTE: maybe call proivider's fetchSession
			// return !!context.provider.fetchSession();
			return true;
		},
	},
});
