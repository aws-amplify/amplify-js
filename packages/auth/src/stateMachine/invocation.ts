// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Machine } from './machine';
import {
	MachineContext,
	MachineEventPayload,
	MachineEvent,
	StateMachineParams,
	InvocationPromise,
	InvokedPromiseType,
} from './types';

export class Invocation<
	ContextType extends MachineContext,
	InitialEventPayloadType extends MachineEventPayload
> {
	event?: MachineEvent<ContextType, InitialEventPayloadType>;
	invokedMachine?: Machine<ContextType>;
	invokedPromise?: InvocationPromise<ContextType, InitialEventPayloadType>;
	expectedStates?: string[];
	constructor(params: {
		machineParams?: StateMachineParams<ContextType>;
		invokedPromise?: InvocationPromise<ContextType, InitialEventPayloadType>;
		expectedStates?: string[];
		event?: MachineEvent<ContextType, InitialEventPayloadType>;
	}) {
		this.event = params?.event;

		this.expectedStates = params?.expectedStates;

		if (params.machineParams) {
			this.invokedMachine = new Machine<ContextType>(params.machineParams);
		} else if (params.invokedPromise) {
			this.invokedPromise = params.invokedPromise;
		}
	}
}
