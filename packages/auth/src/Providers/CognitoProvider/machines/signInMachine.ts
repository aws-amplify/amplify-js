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
	createMachine,
	MachineConfig,
	sendParent,
	assign,
	EventFrom,
	AssignAction,
} from 'xstate';
import { createModel } from 'xstate/lib/model';
import {
	AuthFlowType,
	ChallengeNameType,
	InitiateAuthCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	SignInMachineContext,
	SignInMachineTypestate,
	RespondToAuthEventOptions,
	RespondToMFAChallengeOptions,
	RespondToCompleteNewPasswordChallengeOptions,
	assertEventType,
	assertUserPasswordSignInContext,
} from '../types/machines';
import { federatedSignInMachine } from './oAuthSignInMachine';

export const signInMachineModel = createModel(
	{
		clientConfig: {},
		authConfig: {
			userPoolId: '',
			clientId: '',
			region: '',
		},
		service: null,
	} as SignInMachineContext,
	{
		events: {
			respondToAuthChallenge: (
				respondToAuthChallengeOptions: RespondToAuthEventOptions
			) => ({ respondToAuthChallengeOptions }),
			'done.invoke.InitiateAuth': (data: InitiateAuthCommandOutput) => ({
				data,
			}),
		},
	}
);

type SignInMachineEvents = EventFrom<typeof signInMachineModel>;

const signInMachineActions: Record<
	string,
	AssignAction<SignInMachineContext, any>
> = {};

async function respondToAuthChallenge(
	context: SignInMachineContext,
	event: ReturnType<
		typeof signInMachineModel['events']['respondToAuthChallenge']
	>
) {
	switch (event.respondToAuthChallengeOptions.challengeName) {
		case ChallengeNameType.SMS_MFA:
		case ChallengeNameType.SOFTWARE_TOKEN_MFA:
			return await respondToMFAChallenge(
				context,
				event.respondToAuthChallengeOptions
			);
		case ChallengeNameType.NEW_PASSWORD_REQUIRED:
			return await respondToNewPasswordChallenge(
				context,
				event.respondToAuthChallengeOptions
			);
		default:
			throw new Error('NOT IMPLEMENTED!!');
	}
}

async function respondToNewPasswordChallenge(
	context: SignInMachineContext,
	respondToAuthChallengeOptions: RespondToCompleteNewPasswordChallengeOptions
) {
	assertUserPasswordSignInContext(context);
	return await context.service?.completeNewPassword({
		username: context.username,
		newPassword: respondToAuthChallengeOptions.newPassword!,
		session: context.session!,
		requiredAttributes: respondToAuthChallengeOptions.requiredAttributes,
	});
}

async function respondToMFAChallenge(
	context: SignInMachineContext,
	respondToAuthChallengeOptions: RespondToMFAChallengeOptions
) {
	assertUserPasswordSignInContext(context);
	return await context.service?.cognitoConfirmSignIn(context.clientConfig, {
		mfaType: respondToAuthChallengeOptions.challengeName as
			| ChallengeNameType.SOFTWARE_TOKEN_MFA
			| ChallengeNameType.SMS_MFA,
		challengeName: respondToAuthChallengeOptions.challengeName,
		confirmationCode: respondToAuthChallengeOptions.confirmationCode,
		username: context.username,
		session: context.session!,
		clientId: context.authConfig.clientId,
	});
}

export const signInMachineConfig: MachineConfig<
	SignInMachineContext,
	any,
	SignInMachineEvents
> = {
	id: 'signInMachine',
	initial: 'notStarted',
	context: signInMachineModel.initialContext,
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
				{
					target: 'federatedSignIn',
					cond: 'isFederatedSignIn',
				},
				{
					target: 'error',
				},
			],
		},
		federatedSignIn: {
			invoke: {
				src: federatedSignInMachine,
				data: {
					// @ts-ignore
					authConfig: (context, _event) => context.authConfig,
					// @ts-ignore
					oAuthStorage: (_context, _event) => window.sessionStorage,
					// @ts-ignore
					scopes: (_context, _event) => [] as string[],
					// @ts-ignore
					oAuthProvider: (context, _event) => context.oAuthProvider,
				},
				// there shouldn't be on done
				onDone: [
					{
						target: 'signedIn',
					},
				],
				onError: 'error',
			},
		},
		initiatingPlainUsernamePasswordSignIn: {
			invoke: {
				id: 'InitiateAuth',
				src: async (context, _event) => {
					try {
						assertUserPasswordSignInContext(context);
						const res = await context.service?.signIn(context.clientConfig, {
							signInType: 'Password',
							username: context.username,
							clientId: context.authConfig.clientId,
							authFlow: AuthFlowType.USER_PASSWORD_AUTH,
							password: context.password,
						});
						if (res && typeof res.AuthenticationResult !== 'undefined') {
							context.service?.cacheInitiateAuthResult(
								res,
								context.authConfig.storage
							);
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
					assertEventType(event, 'respondToAuthChallenge');
					const res = await respondToAuthChallenge(context, event);
					if (res && typeof res.AuthenticationResult !== 'undefined') {
						context.service?.cacheInitiateAuthResult(
							res,
							context.authConfig.storage
						);
					}
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
				onError: {
					target: 'error',
					actions: [assign({ error: (_context, event) => event.data })],
				},
			},
		},
		signedIn: {
			type: 'final',
			onEntry: [sendParent({ type: 'signInSuccessful' })],
		},
		error: {
			type: 'final',
			onEntry: [
				sendParent((context, _event) => ({
					type: 'error',
					error: context.error,
				})),
			],
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
		// cancelling: { on: { restoreToNotInitialized: 'notStarted',
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
			// @ts-ignore
			return context.authFlow === AuthFlowType.USER_SRP_AUTH;
		},
		isFederatedSignIn: context => {
			return context.authFlow === 'federated';
		},
		hasNextChallenge: (_context, event) => {
			return (
				event.type === 'done.invoke.InitiateAuth' &&
				typeof event.data.ChallengeName !== 'undefined' &&
				typeof event.data.Session !== 'undefined'
			);
		},
	},
	services: {},
});

export const signInMachineEvents = signInMachineModel.events;
