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
import { CognitoProviderConfig } from '../types/model/config';

export const authMachineModel = createModel({} as AuthMachineContext, {
	events: {
		configureAuth: (config: CognitoProviderConfig, storagePrefix: string) => ({
			config,
			storagePrefix,
		}),
		configureAuthentication: () => ({}),
		configureAuthorization: () => ({}),
		authenticationConfigured: () => ({}),
		authenticationNotConfigured: () => ({}),
		authorizationConfigured: () => ({}),
		authorizationNotConfigured: () => ({}),
		authenticationReset: () => ({}),
		authorizationReset: () => ({}),
		error: () => ({}),
	},
});

export type AuthEvents = EventFrom<typeof authMachineModel>;

const authStateMachineActions: Record<
	string,
	AssignAction<AuthMachineContext, any>
> = {
	assignConfig: authMachineModel.assign(
		{
			config: (_, event) => event.config,
			storagePrefix: (_, event) => event.storagePrefix,
		},
		'configureAuth'
	),
	setAuthenticationActor: authMachineModel.assign({
		authenticationActorRef: (_, __) => {
			const authenticationMachineWithContext =
				authenticationMachine.withContext({
					config: null,
					service: null,
				});
			const authenticationRef = spawn(authenticationMachineWithContext, {
				name: 'authenticationActor',
			});
			return authenticationRef;
		},
	}),
	setAuthorizationActor: authMachineModel.assign({
		authorizationActorRef: (_, __) => {
			const authorizationMachineWithContext = authorizationMachine.withContext({
				config: null,
				service: null,
			});
			const authorizationRef = spawn(authorizationMachineWithContext, {
				name: 'authorizationActor',
			});
			return authorizationRef;
		},
	}),
};

// Top-level AuthState state machine
const authStateMachine: MachineConfig<AuthMachineContext, any, AuthEvents> = {
	id: 'authMachine',
	initial: 'notConfigured',
	states: {
		notConfigured: {
			entry: [
				authStateMachineActions.setAuthenticationActor,
				authStateMachineActions.setAuthorizationActor,
			],
			on: {
				configureAuth: {
					target: 'configuringAuthentication',
					actions: [authStateMachineActions.assignConfig],
				},
			},
		},
		configuringAuthentication: {
			entry: (context, _) => {
				context.authenticationActorRef?.send(
					authenticationMachineEvents.configure(
						context.config?.userPoolConfig!,
						context.storagePrefix!
					)
				);
			},
			on: {
				authenticationConfigured: 'configuringAuthorization',
				authenticationNotConfigured: {
					// actions: stop(context => context.authenticationActorRef!),
					target: 'configuringAuthorization',
				},
			},
		},
		configuringAuthorization: {
			entry: (context, _) => {
				context.authorizationActorRef?.send(
					authorizationMachineEvents.configure(
						context.config!,
						context.storagePrefix!
					)
				);
			},
			on: {
				authorizationConfigured: 'configured',
				authenticationNotConfigured: {
					// actions: [stop(context => context.authorizationActorRef!)],
					target: 'configured',
				},
			},
		},
		resettingAuthentication: {
			///TODO: implement storage clear
			on: {
				authenticationReset: 'resettingAuthorization',
			},
		},
		resettingAuthorization: {
			///TODO: implement storage clear
			on: {
				authorizationReset: 'configuringAuthorization',
			},
		},
		configured: {
			on: {
				configureAuth: 'resettingAuthentication',
				error: 'error',
			},
		},
		error: {
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
