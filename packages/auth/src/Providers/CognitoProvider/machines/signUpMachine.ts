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
	| { value: 'signingUpInitiated'; context: SignUpMachineContext }
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
	id: 'signUpState',
	initial: 'notStarted',
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
	states: {
		notStarted: {
			entry: (_context, _event) => {
				console.log('Sign up machine has been spawned!', {
					_context,
					_event,
				});
			},
			always: {
				cond: 'someCond',
				target: 'initiatingSigningUp',
			},
		},
		initiatingSigningUp: {
			invoke: {
				id: 'InitiateSignUp',
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
						console.log('signUpMachine 97!!!', { res });
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
				onDone: [
					{
						target: 'confirmingSignUp',
						cond: 'needsConfirmation',
						actions: [
							assign((_context, event) => ({
								signUpResult: { ...event.data },
							})),
						],
					},
					{
						target: 'signedUp',
					},
				],
				onError: {
					target: 'error',
					actions: [assign({ error: (_context, event) => event.data })],
				},
			},
		},
		signingUpInitiated: {
			invoke: {
				src: async (_context, _event) => {
					console.log('signingUpInitiated!! 146');
				},
			},
		},
		confirmingSignUp: {
			on: {
				confirmSignUp: {
					target: 'respondingToConfirmSignUp',
					// TODO: what's this?
					internal: false,
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
				onDone: {
					target: 'signedUp',
				},
				onError: {
					target: 'error',
				},
			},
		},
		signedUp: {
			type: 'final',
		},
		error: {
			type: 'final',
			entry: ['sendErrorToParent'],
		},
	},
};

export const signUpMachine =
	/** @xstate-layout N4IgpgJg5mDOIC5SwJZQHYFUAOBlALgIb5gB06A9vgYQE4kQDEK6K+KxYuaW2io2CqnYV0-EAA9EAWgBsARgBMpAKwAGAOxrZATkU6AHGrXyALABoQATxmK1K0vZ3Ol89QGYNBgwF8fl1AwcGhJyKhp6SEYAY1EAMxRaAFtuIL4kEEFhFFFxKQR5DXlSHXt3eXkdIo1ZNQNLGwQ7WRLvHRUlUtl3NVMNPwCeYKJQymoiSKZxLLYcsQz86VNZDVJ3RW75bQMVxXcdBsR5dwNSRUUNHpV22T6VWUUBkEDeELIWWeIWKFTWdCgcMxWOxOL9ggBXaLRODwDIzETzUCLfQOXqmfbHYzyAzyWSHBAGUxnPTtLymDoqUymXz+Z5DPAjd7Ajjsf6-b6Aj4gkhg7AAMUIKAANuDaGBpkJZrkFjJaqd1gZyipPF5tCp8YTiSiyRSqbIni9hpxSC8OdgAJLMzhMLksrj0iXZaVI2ymHSqPQqLw9ZbOHb46R2VHXFyKNxqTwGFQG+lvE08M2Wz4MGLxRIpB1wyUIvJHEok7oaDSmRQ45buCzWRCa-Tawm6t0xtJx2LoBLJb681Nt9O8x1SxGSasOWqUxTUgwbfYadVVgonM4XK43O4PJuvRmkVvtpKd+ndne83CQ6GwWECbNzXNNbz5nTlcm9WQddyzxo1kle+tuKk0wbNzdt3TPc0gPXt6QFYVRXFLMnUHfIKxaCpix0Mxn16Us8TncdVhMHYw2cYwJz8WlKAgOBxENBljTGCIGH7HMZQQaQNFQtYFF0MM1GcXZ8TDYoCMUEM1AuCpHlpKi41tL42QTf4cAYq8mKWViSmxZVST0IT6jnaRClIZ8ahUYzZGfa4NCE9cjVCU15ItK16Nggdrz0ylSC8S4VAMYtjMKLDGj01ZDLM+4zKqSyJNjQC0w7WS0kU50hwKUxincNLqW6LSzGxAN9OC4zQuM8Lo0igDjReSAFKcxiXQQKk1FUXFqWM0wRO8nSAryr0QtMoqLJK-8N2NMBaFoChaAS+CZC9IlLmLViegMUohPxE4WkpBQtl0FQ9n2KzqJISaXJxBx3A4vQth4iyAwuU4RNQ9o+kKNKNhInwgA */
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
			someCond: () => {
				console.log('testing `someCond`');
				return true;
			},
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
