// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Base type for a Machine's context
 */
export type MachineContext = {};

/**
 * The type accepted by Machine's send method
 * @param type - The type of the event.
 * @param paylaod - The payload of the event.
 * @param id - Optional id of the event to track an individual event.
 * @param toMachine - Optional name of machine the event is sent to.
 */
export type MachineEvent = {
	type: string;
	payload?: unknown;
	id?: string;
	toMachine?: string;
};

/**
 * Event interface to sent to the {@link MachineManager.send | state machine manager}.
 */
export type MachineManagerEvent = MachineEvent & {
	toMachine: string;
};

/**
 * @internal
 */
export type EventProducer = {
	addListener: (broker: EventBroker<MachineEvent>) => void;
};

/**
 * @internal
 */
export type EventBroker<EventType extends MachineEvent> = {
	dispatch: (event: EventType) => void;
};

/**
 * @internal
 */
export type EventConsumer<EventType extends MachineEvent> = {
	accept: (event: EventType) => Promise<void>;
};

/**
 * The type accepted by the Machine constructor
 * @typeParam ContextType - The type of the enclosing Machine's context.
 * @typeParam EventTypes - The type of all the possible events. Expecting a union of {@link MachineEvent} types.
 * @typeParam StateNames - The type of all the state names. Expecting a union of strings.
 * @param name - The name of the Machine.
 * @param states - A map of all possible states and their transitions.
 * @param context - Inital context of the Machine.
 * @param initial - The name of the initial state.
 * @param machineManager - The {@link EventBroker} that accept events emitted from state transitions.
 */
export type StateMachineParams<
	ContextType extends MachineContext,
	EventTypes extends MachineEvent,
	StateNames extends string
> = {
	name: string;
	states: MachineStateParams<ContextType, EventTypes, StateNames>;
	context: ContextType;
	initial: StateNames;
};

/**
 * A map of all possible machine states and their transitions.
 * @typeParam ContextType - The type of the enclosing Machine's context.
 * @typeParam EventTypes - The type of all the possible events. Expecting a union of {@link MachineEvent} types.
 * @typeParam StateNames - The type of all the state names. Expecting a union of strings.
 */
export type MachineStateParams<
	ContextType extends MachineContext,
	EventTypes extends MachineEvent,
	StateNames extends string
> = {
	[name in StateNames]: StateTransitions<ContextType, EventTypes, StateNames>;
};

/**
 * The map interface instructing a Machine's behavior in certain state
 * receiving given events.
 * @typeParam ContextType - The type of the enclosing Machine's context.
 * @typeParam EventTypes - The type of all the possible events. Expecting a union of {@link MachineEvent} types.
 * @typeParam StateNames - The type of all the state names. Expecting a union of strings.
 */
export type StateTransitions<
	ContextType extends MachineContext,
	EventTypes extends MachineEvent,
	StateNames extends string
> = {
	[event in EventTypes['type']]?: StateTransition<
		ContextType,
		Extract<EventTypes, { type: event }>,
		StateNames
	>[];
};

/**
 * The type representing a state transition
 * @typeParam ContextType - The type of the enclosing Machine's context
 * @typeParam EventType - The type of event being handled.
 * @typeParam StateNames - The type of all the state names. Expecting a union of strings.
 * @param nextState - The name of the State which will become the current State of the enclosing Machine, if the
 * 			transition is triggered.
 * @param guards - An array of {@link TransitionGuard}, to be invoked before transition is started. If any guard returns
 * 			false, the reducers or actions will not be invoked.
 * @param reducers - An array of {@link TransitionReducer}, to be invoked before actions are invoked.
 * @param actions - An array of {@link TransitionAction}, to be invoked when the transition is completed. If more than
 * 			one action returns updated context, later action's result takes precedence.
 */
export type StateTransition<
	ContextType extends MachineContext,
	EventType extends MachineEvent,
	StateNames extends string
> = {
	nextState: StateNames;
	guards?: TransitionGuard<ContextType, EventType>[];
	reducers?: TransitionReducer<ContextType, EventType>[];
	actions?: TransitionAction<ContextType, EventType>[];
};

/**
 * The effect a transition.
 * @typeParam ContextType - The type of the enclosing Machine's context.
 * @typeParam EventType - The type of event being handled.
 * @param context - The context of the Machine.
 * @param event - The event being handled.
 * @param eventBroker - The event broker handling events may emitted from effect.
 * @return Promise of optional updated machine context.
 */
export type TransitionAction<
	ContextType extends MachineContext,
	EventType extends MachineEvent
> = (
	context: ContextType,
	event: EventType,
	eventBroker: EventBroker<MachineEvent>
) => Promise<Partial<ContextType> | void>;

/**
 * Type for a TransitionGuard, which can prevent the enclosing Transition from completing
 * @typeParam ContextType - The type of the enclosing Machine's context
 * @typeParam EventType - The type of event being handled.
 * @param context - The context of the Machine.
 * @param event - The event being handled.
 * @returns If `false`, the transition will be prevented.
 */
export type TransitionGuard<
	ContextType extends MachineContext,
	EventType extends MachineEvent
> = (context: ContextType, event: EventType) => boolean;

/**
 * Type for a TransitionReducer, which is used to modify the enclosing Machine's Context
 * @typeParam ContextType - The type of the enclosing Machine's context
 * @typeParam EventType - The type of event being handled.
 * @param context - The context of the Machine.
 * @param event - The event being handled.
 * @returns The new state machine context.
 */
export type TransitionReducer<
	ContextType extends MachineContext,
	EventType extends MachineEvent
> = (context: ContextType, event: EventType) => ContextType;

/**
 * The type describing Machine's current status.
 * 
 * @remarks
 * Since the context here is a _shallow_ copy of current state machine, you
 * should expect the referenced object to change with the further state machine
 * invocation.

 * @typeParam PayloadType - The type of the Event's payload
 * @typeParam StateNames - The type of all the state names.
 * @param currentState - The current state name.
 * @param context - The shallow copy of current Machine context
 */
export type CurrentStateAndContext<
	ContextType extends MachineContext,
	StateNames extends string
> = {
	currentState: StateNames;
	context: ContextType;
};

/**
 * The response from sending an event to a machine state.
 * @typeParam ContextType - The type of the enclosing Machine's context
 * @param nextState - The name of next state. It can be the same of current state,
 * indicating no state transit happens.
 * @param newContext - The updated machine context after running the associated
 * state transit reducers. {@link StateTransition.reducers}
 *
 * @internal
 */
export interface MachineStateEventResponse<ContextType extends MachineContext> {
	nextState: string;
	newContext?: ContextType;
	actionsPromise?: Promise<Partial<ContextType> | void>;
}

/**
 * Interface of a Machine state implementation.
 *
 * @internal
 */
export interface MachineState<
	ContextType extends MachineContext,
	EventType extends MachineEvent
> {
	name: string;
	accept: (event: EventType) => Promise<MachineStateEventResponse<ContextType>>;
}
