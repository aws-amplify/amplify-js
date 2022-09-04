/*
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import {
	createMachine,
	MachineConfig,
	spawn,
	EventFrom,
	AssignAction,
} from 'xstate';
import { stop } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';
import {
	authenticationMachine,
	authenticationMachineEvents,
} from './authenticationMachine';
import {
	authorizationMachine,
	authorizationMachineEvents,
} from './authorizationMachine';
import { AuthMachineContext, AuthTypeState } from '../types/machines';
import { CognitoProviderConfig } from '../CognitoProvider';
import { CognitoService } from '../service';

export const authMachineModel = createModel({} as AuthMachineContext, {
	events: {
		configureAuth: (config: CognitoProviderConfig) => ({ config }),
		configureAuthentication: () => ({}),
		configureAuthorization: () => ({}),
		authenticationConfigured: () => ({}),
		authenticationNotConfigured: () => ({}),
		authorizationConfigured: () => ({}),
		authorizationNotConfigured: () => ({}),
	},
});

export type AuthEvents = EventFrom<typeof authMachineModel>;

const authStateMachineActions: Record<
	string,
	AssignAction<AuthMachineContext, any>
> = {
	assignConfig: authMachineModel.assign(
		{
			config: (_context, event) => event.config,
		},
		'configureAuth'
	),
	setAuthenticationActor: authMachineModel.assign(
		{
			authenticationActorRef: (context, _) => {
				const authenticationMachineWithContext =
					authenticationMachine.withContext({
						config: context.config,
						service: new CognitoService({
							region: context?.config?.region || '',
							userPoolId: context?.config?.userPoolId || '',
							identityPoolId: context?.config?.identityPoolId || '',
							clientId: context?.config?.clientId || '',
						}),
					});
				const authenticationRef = spawn(authenticationMachineWithContext, {
					name: 'authenticationActor',
				});
				return authenticationRef;
			},
		},
		'configureAuth'
	),
	setAuthorizationActor: authMachineModel.assign(
		{
			authorizationActorRef: (context, _) => {
				const authorizationMachineWithContext =
					authorizationMachine.withContext({
						config: context.config,
						service: new CognitoService({
							region: context?.config?.region || '',
							userPoolId: context?.config?.userPoolId || '',
							identityPoolId: context?.config?.identityPoolId || '',
							clientId: context?.config?.clientId || '',
						}),
					});
				const authorizationRef = spawn(authorizationMachineWithContext, {
					name: 'authorizationActor',
				});
				return authorizationRef;
			},
		},
		'configureAuthorization'
	),
};

// Top-level AuthState state machine
const authStateMachine: MachineConfig<AuthMachineContext, any, AuthEvents> = {
	id: 'authMachine',
	initial: 'notConfigured',
	states: {
		notConfigured: {
			on: {
				configureAuth: {
					target: 'configuringAuthentication',
					actions: [
						authStateMachineActions.assignConfig,
						authStateMachineActions.setAuthenticationActor,
						authStateMachineActions.setAuthorizationActor,
					],
				},
			},
		},
		configuringAuthentication: {
			entry: (context, _) => {
				context.authenticationActorRef?.send(
					authenticationMachineEvents.configure(context.config!)
				);
			},
			on: {
				authenticationConfigured: 'configuringAuthorization',
				authenticationNotConfigured: {
					actions: [stop(context => context.authenticationActorRef!)],
					target: 'configuringAuthorization',
				},
			},
		},
		configuringAuthorization: {
			entry: (context, _) => {
				context.authorizationActorRef?.send(
					authorizationMachineEvents.configure(context.config!)
				);
			},
			on: {
				authorizationConfigured: 'configured',
				authenticationNotConfigured: {
					actions: [stop(context => context.authorizationActorRef!)],
					target: 'configured',
				},
			},
		},
		configured: {
			type: 'final',
		},
	},
};
export const authMachine = createMachine<
	AuthMachineContext,
	AuthEvents,
	AuthTypeState
>(authStateMachine, {
	actions: {},
	guards: {},
	services: {},
});

export const authMachineEvents = authMachineModel.events;
