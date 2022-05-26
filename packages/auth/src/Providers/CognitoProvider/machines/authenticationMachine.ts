import {
	createMachine,
	MachineConfig,
	interpret,
	spawn,
	assign,
	EventFrom,
	ActionFunctionMap,
	AssignAction,
	ActorRefFrom,
} from 'xstate';
import { stop } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';
import { AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';
import { signInMachine } from './signInMachine';
import { signUpMachine } from './signUpMachine';
import { SignInParams, SignUpParams, AmplifyUser } from '../../../types';
import { CognitoProviderConfig } from '../CognitoProvider';
import { CognitoService } from '../serviceClass';

type SignInActorRef = ActorRefFrom<typeof signInMachine>;
type SignUpActorRef = ActorRefFrom<typeof signUpMachine>;

interface AuthMachineContext {
	// TODO: union other valid actor refs here when we add more actors
	actorRef?: SignInActorRef | SignUpActorRef;
	config: null | CognitoProviderConfig;
	service: null | CognitoService;
	session?: AmplifyUser;
}

type AuthTypestate =
	| {
			value: 'notConfigured';
			context: AuthMachineContext & {
				config: null;
				service: null;
				session: undefined;
			};
	  }
	| {
			value: 'configured';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| {
			value: 'signedOut';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| {
			value: 'signedIn';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| {
			value: 'signingUp';
			context: AuthMachineContext;
	  }
	| {
			value: 'signedUp';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| { value: 'error'; context: AuthMachineContext }
	| {
			value: 'signingIn';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  };

const signInActorName = 'signInActor';
const signUpActorName = 'signUpActor';

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
				params: SignInParams & { password?: string },
				signInFlow: AuthFlowType
			) => ({ params, signInFlow }),
			initiateSignUp: (params: SignUpParams) => ({ params }),
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
				}),
		},
		'configure'
	),
	spawnSignInActor: authenticationMachineModel.assign(
		{
			actorRef: (context, event) => {
				if (!context.config || event.params.signInType !== 'Password') {
					// not implemented
					return context.actorRef;
				}
				const machine = signInMachine.withContext({
					clientConfig: { region: context.config?.region },
					authConfig: context.config,
					username: event.params.username,
					password: event.params.password,
					authFlow: event.signInFlow,
					service: context.service,
				});
				const signInActorRef = spawn(machine, {
					name: signInActorName,
				});
				return signInActorRef;
			},
		},
		'signInRequested'
	),
	spawnSignUpActor: authenticationMachineModel.assign(
		{
			actorRef: (context, event) => {
				if (!context.config) {
					return context.actorRef;
				}

				// TODO: discover what context is necessary for `signUp` event
				const machine = signUpMachine.withContext({
					clientConfig: { region: context.config?.region },
					authConfig: context.config,
					username: event.params.username,
					password: event.params.password,
					attributes: event.params.attributes,
					validationData: event.params.validationData,
					clientMetadata: event.params.clientMetadata,
					service: context.service,
				});
				const signUpActorRef = spawn(machine, {
					name: signUpActorName,
				});
				return signUpActorRef;
			},
		},
		'initiateSignUp'
	),
};

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
			onEntry: [authenticationStateMachineActions.spawnSignUpActor],
			on: {
				cancelSignUp: 'signedOut',
				error: 'error',
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
export const authMachine = createMachine<
	AuthMachineContext,
	AuthEvents,
	AuthTypestate
>(authenticationStateMachine, {
	actions: {
		stopSignInActor: stop(signInActorName),
	},
	guards: {},
});

const authMachineService = interpret(authMachine, { devTools: true });
export type AuthMachineService = typeof authMachineService;
export const authMachineEvents = authenticationMachineModel.events;
