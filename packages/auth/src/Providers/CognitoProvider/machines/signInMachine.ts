import {
	createMachine,
	MachineConfig,
	sendParent,
	assign,
	EventFrom,
	AssignAction,
} from 'xstate';
import { createModel } from 'xstate/lib/model';
import { cacheInitiateAuthResult } from '../service';
import { CognitoService } from '../serviceClass';
import {
	CognitoIdentityProviderClientConfig,
	AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoProviderConfig } from '../CognitoProvider';

export interface SignInMachineContext {
	// NOTE: Could also just pass down the client directly
	clientConfig: CognitoIdentityProviderClientConfig;
	authConfig: CognitoProviderConfig;
	username: string;
	service: CognitoService | null;
	password?: string;
	authFlow?: AuthFlowType;
	error?: any;
	session?: string;
	userStorage?: Storage;
}

type SignInMachineTypestate =
	| { value: 'notStarted'; context: SignInMachineContext }
	| {
			value: 'initiatingPlainUsernamePasswordSignIn';
			context: SignInMachineContext;
	  }
	| { value: 'nextAuthChallenge'; context: SignInMachineContext }
	| {
			value: 'signedIn';
			context: SignInMachineContext;
	  }
	| {
			value: 'error';
			context: SignInMachineContext & { error: any };
	  }
	| { value: 'initiatingSRPA'; context: SignInMachineContext }
	| {
			value: 'respondingToAuthChallenge';
			context: SignInMachineContext & { session: string };
	  };

export const signInMachineModel = createModel(
	{
		clientConfig: {},
		authConfig: {
			userPoolId: '',
			clientId: '',
			region: '',
		},
		username: '',
		service: null,
	} as SignInMachineContext,
	{
		events: {
			respondToAuthChallenge: (params: {
				confirmationCode: string;
				mfaType?: 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA';
				clientMetadata?: Record<string, any>;
			}) => ({ params }),
		},
	}
);

type SignInMachineEvents = EventFrom<typeof signInMachineModel>;

const signInMachineActions: Record<
	string,
	AssignAction<SignInMachineContext, any>
> = {};

// SRPSignInState state machine
export const signInMachineConfig: MachineConfig<
	SignInMachineContext,
	any,
	SignInMachineEvents
> = {
	id: 'signInMachine',
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
		username: '',
		service: null,
		password: undefined,
		authFlow: undefined,
		error: undefined,
		userStorage: undefined,
		session: undefined,
	},
	states: {
		notStarted: {
			onEntry: [
				(_context, _event) => {
					console.log('Sign In Machine has been spawned!');
				},
			],
			always: [
				{
					target: 'initiatingSRPA',
					cond: 'isSRPFlow',
				},
				{
					target: 'initiatingPlainUsernamePasswordSignIn',
					cond: 'isUsernamePasswordFlow',
				},
			],
		},
		initiatingPlainUsernamePasswordSignIn: {
			invoke: {
				id: 'InitaiteAuth',
				src: async (context, event) => {
					console.log(event);
					try {
						const res = await context.service?.signIn(context.clientConfig, {
							signInType: 'Password',
							username: context.username,
							clientId: context.authConfig.clientId,
							authFlow: AuthFlowType.USER_PASSWORD_AUTH,
							password: context.password,
						});
						console.log(res);
						if (res && typeof res.AuthenticationResult !== 'undefined') {
							cacheInitiateAuthResult(res, context.userStorage);
						}
						return res;
					} catch (err) {
						console.error(err);
						throw err;
					}
				},
				onDone: [
					{
						target: 'nextAuthChallenge',
						cond: 'hasNextChallenge',
						actions: assign((_context, event) => ({
							session: event.data.Session,
						})),
					},
					{
						target: 'signedIn',
					},
				],
				onError: {
					target: 'error',
					actions: [assign({ error: (_context, event) => event.data })],
				},
			},
		},
		nextAuthChallenge: {
			on: {
				respondToAuthChallenge: {
					target: 'respondingToAuthChallenge',
				},
			},
		},
		respondingToAuthChallenge: {
			invoke: {
				src: async (context, event) => {
					const res = await context.service?.cognitoConfirmSignIn(
						{ region: context.authConfig.region },
						{
							confirmationCode: event.params.confirmationCode,
							username: context.username,
							clientId: context.authConfig.clientId,
							session: context.session!,
						}
					);
					if (res && typeof res.AuthenticationResult !== 'undefined') {
						cacheInitiateAuthResult(res, context.userStorage);
					}
					console.log(res);
					return res;
				},
				onDone: [
					{
						target: 'nextAuthChallenge',
						cond: 'hasNextChallenge',
						actions: [
							assign((_context, event) => ({
								session: event.data.Session,
							})),
						],
					},
					{
						target: 'signedIn',
					},
				],
			},
		},
		signedIn: {
			type: 'final',
			entry: sendParent({ type: 'signInSuccessful' }),
		},
		error: {
			type: 'final',
			entry: ['sendErrorToParent'],
		},
		// these are from Preamp
		initiatingSRPA: {
			// on: {
			// 	respondPasswordVerifier: 'respondingPasswordVerifier',
			// 	throwPasswordVerifierError: 'error',
			// 	throwAuthError: 'error',
			// 	cancelSRPSignIn: 'cancelling',
			// },
		},
		// notStarted: {
		// 	on: {
		// 		initiateSRP: 'initiatingSRPA',
		// 		throwAuthError: 'error',
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

export const signInMachine = createMachine<
	SignInMachineContext,
	SignInMachineEvents,
	SignInMachineTypestate
>(signInMachineConfig, {
	actions: {
		sendErrorToParent: sendParent((context, _event) => ({
			type: 'error',
			error: context.error,
		})),
	},
	guards: {
		isUsernamePasswordFlow: context => {
			return context.authFlow === AuthFlowType.USER_PASSWORD_AUTH;
		},
		isSRPFlow: context => {
			return context.authFlow === AuthFlowType.USER_SRP_AUTH;
		},
		hasNextChallenge: (_context, event) => {
			// @ts-ignore
			return event.data.ChallengeName && event.data.Session;
		},
	},
});

export const signInMachineEvents = signInMachineModel.events;
