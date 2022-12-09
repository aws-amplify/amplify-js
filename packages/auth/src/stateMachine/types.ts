/**
 * Base type for a Machine's context
 */
export type MachineContext = {};

/**
 * The type accepted by Machine's send method
 */
export type MachineEvent = {
	name: string;
	payload: unknown;
	id?: string;
};

export type EventBroker<EventType extends MachineEvent> = {
	dispatch: (event: EventType) => void;
};

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
	machineManager: EventBroker<MachineEvent>;
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
	[event in EventTypes['name']]?: StateTransition<
		ContextType,
		Extract<EventTypes, { name: event }>,
		StateNames
	>[];
};

/**
 * The type representing a state transition
 * @typeParam ContextType - The type of the enclosing Machine's context
 * @typeParam EventType - The type of event being handled.
 * @typeParam StateNames - The type of all the state names. Expecting a union of strings.
 * @param nextState - The name of the State which will become the current State of the enclosing Machine, if the transition is triggered.
 * @param guards - An array of {@link TransitionGuard}, to be invoked before the transition is completed.
 * @param reducers - An array of {@link TransitionReducer}, to be invoked when the transition is completed.
 * @param effects - An array of {@link TransitionEffect}, to be invoked when the transition is completed.
 */
export type StateTransition<
	ContextType extends MachineContext,
	EventType extends MachineEvent,
	StateNames extends string
> = {
	nextState: StateNames;
	guards?: TransitionGuard<ContextType, EventType>[];
	reducers?: TransitionReducer<ContextType, EventType>[];
	effects?: TransitionEffect<ContextType, EventType>[];
};

/**
 * The effect a transition.
 * @typeParam ContextType - The type of the enclosing Machine's context.
 * @typeParam EventType - The type of event being handled.
 * @param context - The context of the Machine.
 * @param event - The event being handled.
 * @param eventBroker - The event broker handling events may emitted from effect.
 */
export type TransitionEffect<
	ContextType extends MachineContext,
	EventType extends MachineEvent
> = (
	context: ContextType,
	event: EventType,
	eventBroker: EventBroker<MachineEvent>
) => Promise<void>;

/**
 * Type for a TransitionGuard, which can prevent the enclosing Transition from completing
 * @typeParam ContextType - The type of the enclosing Machine's context
 * @typeParam EventType - The type of event being handled.
 * @param context - The context of the Machine.
 * @param event - The event being handled.
 * @returns If `true`, the transition will be prevented.
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
 * The type describing Machine's current status
 * @typeParam PayloadType - The type of the Event's payload
 * @typeParam StateNames - The type of all the state names.
 * @param currentState - The current state name.
 * @param context - The current Machine context
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
 * @param effectsPromise - The promise resolves when all the assciated state
 * transit effects are resolved. {@link StateTransition.effects}
 * @param newContext - The updated machine context after running the associated
 * state transit reducers. {@link StateTransition.reducers}
 *
 * @internal
 */
export interface MachineStateEventResponse<ContextType extends MachineContext> {
	nextState: string;
	newContext?: ContextType;
	effectsPromise?: Promise<unknown>;
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
	accept: (event: EventType) => MachineStateEventResponse<ContextType>;
}
