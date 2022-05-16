import { createMachine, MachineConfig, interpret, spawn, assign } from 'xstate';
import { stop } from 'xstate/lib/actions';
import { AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';
import { signInMachine } from './signInMachine';
import { SignInParams, AmplifyUser } from '../../../types';
import { CognitoProviderConfig } from '../CognitoProvider';
import { CognitoService } from '../serviceClass';

// TODO: What to store here?
interface AuthMachineContext {
	// TODO: Type this to ActorRef
	actorRef: any;
	config: null | CognitoProviderConfig;
	service: null | CognitoService;
	session?: AmplifyUser;
}

interface AuthStates {
	states: {
		notConfigured: {};
		configured: {};
		// signingOut: {};
		signedOut: {};
		signingUp: {};
		signingIn: {
			states: any;
		};
		signedIn: {};
		error: {};
	};
}

type AuthEvents =
	| { type: 'configure'; config: CognitoProviderConfig }
	| { type: 'initializedSignedIn' }
	| { type: 'initializedSignedOut' }
	| { type: 'cancelSignUp' }
	| { type: 'cancelSignIn' }
	| { type: 'error'; error: any }
	| { type: 'signOutRequested' }
	| {
			type: 'signInRequested';
			params: SignInParams & { password?: string };
			signInFlow: AuthFlowType;
	  }
	| { type: 'initiateSignUp' }
	| { type: 'signInSuccessful' };

async function checkActiveSession(context: AuthMachineContext) {
	if (
		!context.config?.identityPoolId ||
		!context.config.userPoolId ||
		!context.service
	) {
		throw new Error('no configured identityPoolId and userPoolId');
	}
	const session = await context.service.cognitoFetchSession();
	return session;
}

// AuthenticationState state machine
const authenticationStateMachine: MachineConfig<
	AuthMachineContext,
	AuthStates,
	AuthEvents
> = {
	id: 'authenticationMachine',
	initial: 'notConfigured',
	context: {
		actorRef: null,
		config: null,
		service: null,
	},
	states: {
		notConfigured: {
			on: {
				configure: {
					target: 'configured',
					actions: ['configureProvider', 'configureCognitoService'],
				},
			},
		},
		configured: {
			invoke: {
				src: checkActiveSession,
				onDone: [
					{
						cond: (_context, event) => !!event.data,
						actions: [
							assign((_context, event) => ({
								session: event.data,
							})),
						],
						target: 'signedIn',
					},
					{
						// by default set the user to signedOut
						target: 'signedOut',
					},
				],
				// in any cases, if there are errors, the user is considered 'signedOut'
				// TODO: we should only have user as 'signedOut' if they are unauthorized
				// There could be legitimate network errors during the requests, maybe 'error' will be a more accurate state for
				// those scenarios
				onError: 'signedOut',
			},
		},
		// signingOut: {
		// 	on: {
		// 		initializedSignedIn: 'signedIn',
		// 		initializedSignedOut: 'signedOut',
		// 	},
		// },
		signedOut: {
			on: {
				signInRequested: 'signingIn',
				initiateSignUp: 'signingUp',
			},
		},
		signedIn: {
			on: {
				signOutRequested: 'signedOut',
			},
		},
		signingUp: {
			on: {
				cancelSignUp: 'signedOut',
				error: 'error',
			},
		},
		signingIn: {
			onEntry: ['spawnSignInActor'],
			on: {
				cancelSignIn: {
					target: '#authenticationMachine.signedOut',
				},
				error: {
					target: '#authenticationMachine.error',
				},
				signInSuccessful: {
					target: '#authenticationMachine.signedIn',
				},
			},
			onExit: [
				'stopSignInActor',
				(context, event) => {
					console.log(context);
					console.log(event);
					console.log('exit boi');
				},
			],
			// ...srpSignInState,
		},
		error: {
			on: {
				signInRequested: 'signingIn',
				initiateSignUp: 'signingUp',
			},
		},
	},
};

const signInActorName = 'signInActor';

export const authMachine = createMachine(authenticationStateMachine, {
	actions: {
		spawnSignInActor: assign({
			actorRef: (context, event) => {
				if (event.type !== 'signInRequested') return null;
				if (event.params.signInType !== 'Password') {
					// not implemented
					return null;
				}
				if (!context.config) return null;
				const machine = signInMachine.withContext({
					clientConfig: { region: context.config?.region },
					authConfig: context.config,
					username: event.params.username,
					password: event.params.password,
					authFlow: event.signInFlow,
					service: context.service,
				});
				const ref = spawn(machine, {
					name: signInActorName,
				});
				return ref;
			},
		}),
		configureProvider: assign({
			config: (context, event) =>
				event.type === 'configure' ? event.config : context.config,
		}),
		configureCognitoService: assign({
			service: (context, event) =>
				event.type === 'configure'
					? new CognitoService({
							region: event.config.region,
							userPoolId: event.config.userPoolId,
							identityPoolId: event.config.identityPoolId,
					  })
					: context.service,
		}),
		stopSignInActor: stop(signInActorName),
	},
	guards: {},
});

const authMachineService = interpret(authMachine);
export type AuthMachineService = typeof authMachineService;
