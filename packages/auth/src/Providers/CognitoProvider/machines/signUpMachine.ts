/*
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *	 http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { CognitoIdentityProviderClientConfig } from '@aws-sdk/client-cognito-identity-provider';
import {
	createMachine,
	MachineConfig,
	EventFrom,
	assign,
	sendParent,
} from 'xstate';
import { createModel } from 'xstate/lib/model';
import { CognitoUserPoolService } from '../services/CognitoUserPoolService';
import { SignUpResult } from '../../../types/AuthPluggable';
import { CognitoSignUpPluginOptions } from '../types/model/signup/CognitoSignUpPluginOptions';
import { UserPoolConfig } from '../types/model/config';

// TODO: what should we store here?
interface SignUpMachineContext {
	service: CognitoUserPoolService | null;
	authConfig: UserPoolConfig;
	clientConfig: CognitoIdentityProviderClientConfig;
	username: string;
	password: string;
	attributes?: object;
	pluginOptions?: CognitoSignUpPluginOptions;
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
		pluginOptions: {},
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
		pluginOptions: {},
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
								pluginOptions: context.pluginOptions,
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
						const res = await context.service?.confirmSignUp(
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

export const signUpMachine = createMachine<
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
