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

import {
	AssignAction,
	EventFrom,
	MachineConfig,
	assign,
	createMachine,
	sendParent,
	spawn,
} from 'xstate';
import { pure, stop } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';
import { AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';
import { signInMachine } from './signInMachine';
import { SignInParams, SignInWithSocial, SignUpParams } from '../../../types';
import {
	AuthenticationMachineContext,
	AuthenticationTypeState,
} from '../types/machines';
import { CognitoConfirmSignInPluginOptions } from '../types/model';
import { UserPoolConfig } from '../types/model/config';
import { CognitoUserPoolService } from '../services/CognitoUserPoolService';

const signInActorName = 'signInActor';
const signUpActorName = 'signUpActor';

async function checkConfig(context: AuthenticationMachineContext) {
	if (context.config?.userPoolId) {
		throw new Error('Userpool has not been configured.');
	}
	if (!context.service) {
		throw new Error('The Cognito service has not been initialized.');
	}
	return;
}

export const authenticationMachineModel = createModel(
	{
		config: null,
		service: null,
	} as AuthenticationMachineContext,
	{
		id: 'authenticationMachine',
		events: {
			configure: (config: UserPoolConfig, storagePrefix: string) => ({
				config,
				storagePrefix,
			}),
			configurationSuccessful: () => ({}),
			failedToConfigure: () => ({}),
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
			initiateSignUp: (
				params: SignUpParams<CognitoConfirmSignInPluginOptions>
			) => ({ params }),
			signInSuccessful: () => ({}),
			signUpSuccessful: () => ({}),
		},
	}
);

export type AuthenticationEvents = EventFrom<typeof authenticationMachineModel>;

const authenticationMachineActions: Record<
	string,
	AssignAction<AuthenticationMachineContext, any>
> = {
	assignConfig: authenticationMachineModel.assign(
		{
			config: (_, event) => event.config,
			storagePrefix: (_, event) => event.storagePrefix,
		},
		'configure'
	),
	assignService: authenticationMachineModel.assign(
		{
			service: (_, event) =>
				new CognitoUserPoolService(
					{
						region: event.config.region,
						userPoolId: event.config.userPoolId,
						clientId: event.config.clientId,
					},
					event.storagePrefix
				),
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
	AuthenticationMachineContext,
	any,
	AuthenticationEvents
> = {
	id: 'authenticationMachine',
	initial: 'notConfigured',
	context: authenticationMachineModel.initialContext,
	states: {
		notConfigured: {
			on: {
				configure: [
					{
						target: 'configured',
						cond: (context, event) => {
							if (event.config?.userPoolId == null) {
								sendParent({ type: 'authenticationNotConfigured' });
								return false;
							}
							return true;
						},
					},
				],
			},
			exit: [
				authenticationMachineActions.assignConfig,
				authenticationMachineActions.assignService,
			],
		},
		configured: {
			entry: pure((_, event) => {
				return sendParent({ type: 'authenticationConfigured' });
			}),
			on: {
				signInRequested: 'signingIn',
				initiateSignUp: 'signingUp',
			},
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
		signedIn: {
			on: {
				signOutRequested: 'signedOut',
			},
		},
		signingUp: {
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
		},
		signedUp: {
			on: {
				// TODO: what should this be?
				// signOutRequested: 'signedOut',
			},
		},
		signingIn: {
			onEntry: [authenticationMachineActions.spawnSignInActor],
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
			entry: (context, event) => {
				console.log('authenticationMachine error!');
			},
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
export const authenticationMachine = createMachine<
	AuthenticationMachineContext,
	AuthenticationEvents,
	AuthenticationTypeState
>(authenticationStateMachine, {
	actions: {
		stopSignInActor: stop(signInActorName),
	},
	guards: {},
	services: {},
});

export const authenticationMachineEvents = authenticationMachineModel.events;
