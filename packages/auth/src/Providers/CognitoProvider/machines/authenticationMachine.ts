import {
	createMachine,
	MachineConfig,
	spawn,
	assign,
	EventFrom,
	AssignAction,
} from 'xstate';
import { stop } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';
import { AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';
import { signInMachine } from './signInMachine';
import { SignInParams, SignInWithSocial } from '../../../types';
import { AuthMachineContext, AuthTypestate } from '../types/machines';
import { CognitoProviderConfig } from '../CognitoProvider';
import { CognitoService } from '../serviceClass';

const signInActorName = 'signInActor';

async function checkActiveSession(context: AuthMachineContext) {
	try {
		if (
			!context.config?.identityPoolId ||
			!context.config.userPoolId ||
			!context.service
		) {
			throw new Error('no configured identityPoolId and userPoolId');
		}
		const session = await context.service.fetchSession();
		return session;
	} catch (err) {
		return false;
	}
}

export const authenticationMachineModel = createModel(
	{
		config: null,
		service: null,
	} as AuthMachineContext,
	{
		events: {
			configure: (config: CognitoProviderConfig) => ({ config }),
			initializedSignedIn: () => ({}),
			initializedSignedOut: () => ({}),
			cancelSignUp: () => ({}),
			cancelSignIn: () => ({}),
			error: (error: any) => ({ error }),
			signOutRequested: () => ({}),
			signInRequested: (
				signInEventParams:
					| (SignInParams & {
							signInFlow: AuthFlowType;
					  })
					| SignInWithSocial
			) => {
				console.log('request sign in');
				return { signInEventParams };
			},
			initiateSignUp: () => ({}),
			signInSuccessful: () => ({}),
		},
	}
);

type AuthEvents = EventFrom<typeof authenticationMachineModel>;

const authenticationStateMachineActions: Record<
	string,
	AssignAction<AuthMachineContext, any>
> = {
	assignConfig: authenticationMachineModel.assign(
		{
			config: (_context, event) => event.config,
		},
		'configure'
	),
	assignService: authenticationMachineModel.assign(
		{
			service: (_context, event) =>
				new CognitoService({
					region: event.config.region,
					userPoolId: event.config.userPoolId,
					identityPoolId: event.config.identityPoolId,
					clientId: event.config.clientId,
				}),
		},
		'configure'
	),
	spawnSignInActor: authenticationMachineModel.assign(
		{
			actorRef: (context, event) => {
				if (
					!context.config ||
					(event.signInEventParams.signInType !== 'Social' &&
						event.signInEventParams.signInType !== 'Password')
				) {
					// not implemented
					return context.actorRef;
				}
				if (event.signInEventParams.signInType === 'Password') {
					if (
						event.signInEventParams.signInFlow ===
						AuthFlowType.USER_PASSWORD_AUTH
					) {
						if (!event.signInEventParams.password) {
							throw new Error('Password is required for USER_PASSWORD_AUTH');
						}
						const machine = signInMachine.withContext({
							clientConfig: { region: context.config?.region },
							authConfig: context.config,
							username: event.signInEventParams.username,
							password: event.signInEventParams.password,
							authFlow: event.signInEventParams.signInFlow,

							service: context.service,
						});
						const signInActorRef = spawn(machine, {
							name: signInActorName,
						});
						return signInActorRef;
					}
				}
				if (event.signInEventParams.signInType === 'Social') {
					const machine = signInMachine.withContext({
						clientConfig: { region: context.config?.region },
						authConfig: context.config,
						authFlow: 'federated',
						service: context.service,
						oAuthProvider: event.signInEventParams?.social?.provider,
					});
					const signInActorRef = spawn(machine, {
						name: signInActorName,
					});
					return signInActorRef;
				}
			},
		},
		'signInRequested'
	),
};

// TODO: How to make this more easily extensible?
// AuthenticationState state machine
const authenticationStateMachine: MachineConfig<
	AuthMachineContext,
	any,
	AuthEvents
> = {
	id: 'authenticationMachine',
	initial: 'notConfigured',
	context: authenticationMachineModel.initialContext,
	states: {
		notConfigured: {
			on: {
				configure: {
					target: 'configured',
					actions: [
						authenticationStateMachineActions.assignConfig,
						authenticationStateMachineActions.assignService,
					],
				},
			},
		},
		configured: {
			invoke: {
				src: 'checkActiveSession',
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
			onEntry: [authenticationStateMachineActions.spawnSignUpActor],
			on: {
				cancelSignUp: {
					target: '#authenticationMachine.signedOut',
				},
				error: {
					target: '#authenticationMachine.error',
				},
				signUpSuccessful: {
					target: '#authenticationMachine.signedUp',
				},
			},
			onExit: [
				'stopSignUpActor',
				(context, event) => {
					console.log(context);
					console.log(event);
				},
			],
		},
		signedUp: {
			on: {
				// TODO: what should this be?
				// signOutRequested: 'signedOut',
			},
		},
		signingIn: {
			onEntry: [authenticationStateMachineActions.spawnSignInActor],
			on: {
				cancelSignIn: {
					target: '#authenticationMachine.signedOut',
				},
				error: {
					target: '#authenticationMachine.error',
					actions: [
						assign((_context, event) => ({
							error: event.error,
						})),
					],
				},
				signInSuccessful: {
					target: '#authenticationMachine.signedIn',
				},
			},
			onExit: ['stopSignInActor'],
			// ...srpSignInState,
		},
		error: {
			on: {
				signInRequested: 'signingIn',
				initiateSignUp: 'signingUp',
			},
			onExit: [
				'stopSignInActor',
				(context, event) => {
					console.log(context);
					console.log(event);
				},
			],
			// ...srpSignInState,
		},
	},
};
export const authMachine = createMachine<
	AuthMachineContext,
	AuthEvents,
	AuthTypestate
>(authenticationStateMachine, {
	actions: {
		stopSignInActor: stop(signInActorName),
	},
	guards: {},
	services: {
		checkActiveSession: async context => {
			try {
				if (
					!context.config?.identityPoolId ||
					!context.config.userPoolId ||
					!context.service
				) {
					throw new Error('no configured identityPoolId and userPoolId');
				}
				const session = await context.service.fetchSession();
				return session;
			} catch (err) {
				return false;
			}
		},
	},
});

export const authMachineEvents = authenticationMachineModel.events;
