// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Completer } from './completer';
import { Invocation } from './invocation';
import { MachineState } from './machineState';
import UuidStatic from 'uuid';

/**
 * Base type for a Machine's context
 */
export type MachineContext = Record<string, unknown>;

/**
 * Base type for a MachineEvent's payload
 */
export type MachineEventPayload = Record<string, unknown>;

export type InvokedPromiseType = object;

/**
 * The type accepted by Machine's send method
 * @typeParam PayloadType - The type of the Event's payload
 * @param name - The event name; used when matching a transition
 * @param payload - The event payload
 */
export type MachineEvent<PayloadType extends MachineEventPayload> = {
	name: string;
	payload?: PayloadType;
};

/**
 * A wrapper for the MachineEvent when it is queued
 * @typeParam PayloadType - The type of the Event's payload
 * @param event - The underlying event to be enqueued
 * @param restingStates - The state names of the underlying machine which, when reached, will allow for the event to be dequeued
 * @param restingStates - The state names of the underlying machine which, when reached, will allow for the event to be dequeued
 * @param completer - A promise that will resolve when a restingState is reached
 */
export type QueuedMachineEvent<ContextType extends MachineContext> = {
	event: MachineEvent<MachineEventPayload>;
	restingStates: string[];
	completer?: Completer<ContextType>;
};

/**
 * The type accepted by the Machine constructor
 * @typeParam PayloadType - The type of the Event's payload
 * @param name - The Machine's name
 * @param states - An array of MachineStates
 * @param context - The Machine's extended state
 * @param initial - The name of the Machine's initial State
 * @param enqueueEvents - Flag to determine if events should be enqueued
 */
export type StateMachineParams<ContextType extends MachineContext> = object & {
	name: string;
	states: MachineState<ContextType, MachineEventPayload>[];
	context: ContextType;
	initial: string;
	enqueueEvents?: boolean;
};

/**
 * The type accepted by the MachineState constructor
 * @typeParam ContextType - The type of the enclosing Machine's context
 * @typeParam PayloadType - The type of the Event's payload
 * @param name - The state name
 * @param transitions - The array of available transitions
 * @param invocation - An invocation to call when the State becomes the current state of enclosing Machine
 */
export type MachineStateParams<
	ContextType extends MachineContext,
	PayloadType extends MachineEventPayload
> = {
	name: string;
	transitions?: StateTransition<ContextType, PayloadType>[];
	invocation?: Invocation<any, MachineEventPayload>;
};

/**
 * The type representing a state transition
 * @typeParam ContextType - The type of the enclosing Machine's context
 * @typeParam PayloadType - The type of the enclosing State's event payload
 * @param event - The name of the event that can trigger the Transition
 * @param nextState - The name of the State which will become the current State of the enclosing Machine, if the transition is triggered
 * @param actions - An array of TransitionActions, to be invoked when transition is completed
 * @param guards An array of TransitionGuards, to be invoked before the transition is completed
 * @param reducers An array of TransitionReducers, to be invoked when the transition is completed
 */
export type StateTransition<
	ContextType extends MachineContext,
	PayloadType extends MachineEventPayload
> = {
	event: string;
	nextState: string;
	actions?: TransitionAction<ContextType, PayloadType>[];
	guards?: TransitionGuard<ContextType, PayloadType>[];
	reducers?: TransitionReducer<ContextType, PayloadType>[];
};

/**
 * Type for a fire-and-forget action function
 * @typeParam ContextType - The type of the enclosing Machine's context
 * @typeParam PayloadType - The type of the Event's payload
 */
export type TransitionAction<
	ContextType extends MachineContext,
	PayloadType extends MachineEventPayload
> = (context: ContextType, event: MachineEvent<PayloadType>) => Promise<void>;

/**
 * Type for a TransitionGuard, which can prevent the enclosing Transition from completing
 * @typeParam ContextType - The type of the enclosing Machine's context
 * @typeParam PayloadType - The type of the Event's payload
 */
export type TransitionGuard<
	ContextType extends MachineContext,
	PayloadType extends MachineEventPayload
> = (context: ContextType, event: MachineEvent<PayloadType>) => boolean;

/**
 * Type for a TransitionReducer, which is used to modify the enclosing Machine's Context
 * @typeParam ContextType - The type of the enclosing Machine's context
 * @typeParam PayloadType - The type of the Event's payload
 */
export type TransitionReducer<
	ContextType extends MachineContext,
	PayloadType extends MachineEventPayload
> = (context: ContextType, event: MachineEvent<PayloadType>) => ContextType;

export type InvocationPromise<
	ContextType extends MachineContext,
	PayloadType extends MachineEventPayload,
	ReturnType extends InvokedPromiseType
> = (
	context: ContextType,
	event: MachineEvent<PayloadType>
) => Promise<ReturnType>;
