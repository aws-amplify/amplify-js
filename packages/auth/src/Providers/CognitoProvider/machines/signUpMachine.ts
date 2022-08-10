import { CognitoIdentityProviderClientConfig } from '@aws-sdk/client-cognito-identity-provider';
import {
	createMachine,
	MachineConfig,
	EventFrom,
	assign,
	sendParent,
} from 'xstate';
import { createModel } from 'xstate/lib/model';
import { CognitoService } from '../serviceClass';
import { CognitoProviderConfig } from '../CognitoProvider';
import { cacheInitiateAuthResult } from '../service';
import { SignUpResult } from '../../../types/AuthPluggable';

// TODO: what should we store here?
interface SignUpMachineContext {
	service: CognitoService | null;
	authConfig: CognitoProviderConfig;
	clientConfig: CognitoIdentityProviderClientConfig;
	username: string;
	password: string;
	attributes?: object;
	validationData?: { [key: string]: any };
	clientMetadata?: { [key: string]: string };
	error?: any; // TODO: should this be a proper error type?
	signUpResult?: SignUpResult | null;
}

type SignUpMachineTypestate =
	| { value: 'notStarted'; context: SignUpMachineContext }
	| {
			value: 'initiatingSigningUp';
			context: SignUpMachineContext;
	  }
	| {
			value: 'signedUp';
			context: SignUpMachineContext;
	  }
	| {
			value: 'error';
			context: SignUpMachineContext & { error: any };
	  }
	| { value: 'confirmingSignUp'; context: SignUpMachineContext }
	| {
			value: 'respondingToConfirmSignUp';
			context: SignUpMachineContext & { confirmationCode: string };
	  };

export const signUpMachineModel = createModel(
	{
		clientConfig: {},
		authConfig: {
			userPoolId: '',
			clientId: '',
			region: '',
		},
		username: '',
		password: '',
		attributes: {},
		validationData: {},
		clientMetadata: {},
		service: null,
	} as SignUpMachineContext,
	{
		events: {
			confirmSignUp: (params: { confirmationCode: string }) => ({
				params,
			}),
		},
	}
);

type SignUpMachineEvents = EventFrom<typeof signUpMachineModel>;

const signUpStateMachine: MachineConfig<
	SignUpMachineContext,
	any,
	SignUpMachineEvents
> = {
	context: {
		service: null,
		authConfig: {
			userPoolId: '',
			clientId: '',
			// hardcoded
			region: 'us-west-2',
		},
		clientConfig: {},
		username: '',
		password: '',
		attributes: {},
		validationData: {},
		clientMetadata: {},
		error: undefined,
		signUpResult: null,
	},
	id: 'signUpState',
	initial: 'notStarted',
	states: {
		notStarted: {
			entry: (_context, _event) => {
				console.log('Sign up machine has been spawned!', {
					_context,
					_event,
				});
			},
			always: {
				target: 'initiatingSigningUp',
			},
		},
		initiatingSigningUp: {
			invoke: {
				src: async (context, _event) => {
					try {
						const res = await context.service?.cognitoSignUp(
							context.clientConfig,
							{
								username: context.username,
								password: context.password,
								attributes: context.attributes,
								validationData: context.validationData,
								clientMetadata: context.clientMetadata,
								clientId: context.authConfig.clientId,
							}
						);
						// TODO: ask James about this
						// if (res && typeof res.AuthenticationResult !== 'undefined') {
						// 	cacheInitiateAuthResult(res, context.userStorage);
						// }
						return res;
					} catch (err) {
						console.error('initiatingSigningUp error: ', err);
						throw err;
					}
				},
				id: 'InitiateSignUp',
				onDone: [
					{
						actions: assign((_context, event) => ({
							signUpResult: { ...event.data },
						})),
						cond: 'needsConfirmation',
						target: 'confirmingSignUp',
					},
					{
						target: 'signedUp',
					},
				],
				onError: [
					{
						actions: assign({ error: (_context, event) => event.data }),
						target: 'error',
					},
				],
			},
		},
		confirmingSignUp: {
			on: {
				confirmSignUp: {
					target: 'respondingToConfirmSignUp',
				},
			},
		},
		respondingToConfirmSignUp: {
			invoke: {
				src: async (context, event) => {
					try {
						const res = await context.service?.cognitoConfirmSignUp(
							context.clientConfig,
							{
								clientId: context.authConfig.clientId,
								confirmationCode: event.params.confirmationCode,
								username: context.username,
							}
						);
						console.log('respondingToConfirmSignUp', { res });
						return res;
					} catch (err) {
						console.error('respondingToConfirmSignUp error: ', err);
						throw err;
					}
				},
				onDone: [
					{
						target: 'signedUp',
					},
				],
				onError: [
					{
						target: 'error',
					},
				],
			},
		},
		signedUp: {
			type: 'final',
		},
		error: {
			entry: 'sendErrorToParent',
			type: 'final',
		},
	},
};

export const signUpMachine =
	/** @xstate-layout N4IgpgJg5mDOIC5SwJZQHYFUAOBlALgIb5gB06A9vgYQE4kQDEio2Fq+KF6LIAHogAsAdgAMpAKwBGKQA4ATADYAnAG
	 * Zhq2YqkAaEAE9EsiaU3DBEkZamLRq1QF8He1Bhw0SpFOhSdi3qFw0H3QoHEYIbjJvA
	 * DcKAGsyAEkfPxIgt2xeNg4uHiR+RHNFUnllUVl1YWNRQUFFPUMEQWVSWqlhYWVFbVF5euEnF2D3Ik9vXxR-UIyQsOxGMFp
	 * aClpSbAAbYgAzVYBbUhTJ4jBZnGz2Se5eAWb5VVNROTVVbp6rRqFFeVJbaXl5HYeooJPIhiBXFg8GMyABjbjbFC0PYBM4LeHoRHItEXX
	 * LXAq3GSicTdCzyKSqCryWTCeSfBDkkyyUTlAG1ZkSZRg5wQkbQk6kWhwNjoCABAAqFAAwgikXs0REol50HFEq
	 * RIaMBULYCKxaFJTLMXK0QhYhRYf5uABtUQAXVxV3yoFuxmEpBELWUylksikb1k9NUZV+gikElp-WUEnsgnBGv5nm1uol0tl2
	 * L5i2Wq3WW3wu2R6r5HjISe4eqgBrT8r5ppV5st6Bt9oKOUdN0QRJMglUNnkGhBc
	 * jpBiEClKUejrxpfqeTh5lAgcF48eL5CoNHokAdnHxzsQ-RM5Wkg5ZfTJ9Oj7tEEivxM6omEHVUEjjRZhyuOnBmwQC5xbl23TqFM0UjiE+K
	 * iyFGFjmEG9L7qUlLEhS0bCCCEEvpkK4YliKJfpkW55O2CAgWIphcio9jUoCyi6MORFSIIpj1N65jUlyFKxjyy5vqWoo
	 * poa2E4n+eKAYSdg-MI4ZXh0LGobByhutUYhaJ0ykdOhUIrpCkC-qw-4EQSiCKA+pAKAorzKIIgISBIgb3KQ9GAve17MvR
	 * EiKOpmqeEsKy0PhO5AShJggfI1mCFS94wbRFjiHI0g+tREiyGF5geQmYB+SJe7kqQh4yAoJ77kOTQALR2VyLF9MyvrVIojizkAA */
	createMachine<
		SignUpMachineContext,
		SignUpMachineEvents,
		SignUpMachineTypestate
	>(signUpStateMachine, {
		actions: {
			sendErrorToParent: sendParent((context, _event) => ({
				type: 'error',
				error: context.error,
			})),
		},
		guards: {
			needsConfirmation: (_context, event) => {
				console.log(
					{ _context, event },
					// @ts-ignore
					`needsConfirmation: ${event.data.UserConfirmed === false}`
				);
				// @ts-ignore
				return event.data.UserConfirmed === false;
			},
		},
	});

export const signUpMachineEvents = signUpMachineModel.events;
