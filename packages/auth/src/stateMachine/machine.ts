// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from '@aws-amplify/core';
import { MachineState } from './machineState';
import {
	CurrentStateAndContext,
	EventBroker,
	EventConsumer,
	EventProducer,
	MachineContext,
	MachineEvent,
	MachineManagerEvent,
	StateMachineParams,
	StateTransitions,
	TransitionListener,
} from './types';

/**
 * A Finite state machine implementation.
 * @typeParam ContextType - The type of the enclosing Machine's context.
 * @typeParam EventTypes - The type of all the possible events. Expecting a union of {@link MachineEvent} types.
 * @typeParam StateNames - The type of all the state names. Expecting a union of strings.
 */
export class Machine<
	ContextType extends MachineContext,
	EventTypes extends MachineEvent,
	StateNames extends string
> implements EventConsumer<EventTypes>, EventProducer
{
	private _logger: Logger;
	private _states: Record<
		StateNames,
		MachineState<ContextType, EventTypes, StateNames>
	>;
	private _context: ContextType;
	private _current: MachineState<ContextType, EventTypes, StateNames>;
	private _eventBrokers: EventBroker<MachineManagerEvent>[];
	private _transitionListeners: TransitionListener<
		ContextType,
		EventTypes,
		string
	>[];
	private _finalStates: StateNames[];
	private _initialState: StateNames;
	private _initialContext: ContextType;
	public readonly name: string;

	constructor(params: StateMachineParams<ContextType, EventTypes, StateNames>) {
		this.name = params.name;
		this._context = params.context;
		this._eventBrokers = [];
		this._transitionListeners = [];
		this._finalStates = params.finalStates ?? [];
		this._initialState = params.initial;
		this._initialContext = params.context;

		const dispatchToBrokers = (event: MachineEvent) => {
			if (!event.toMachine) {
				// By default, the emitted events will be routed back to current state machine;
				event.toMachine = this.name;
			}
			for (const broker of this._eventBrokers) {
				broker.dispatch(event as MachineManagerEvent);
			}
		};

		// TODO: validate FSM
		this._states = Object.entries<
			StateTransitions<ContextType, EventTypes, StateNames>
		>(params.states as any)
			.map(([stateName, transitions]) => {
				const castedStateName = stateName as StateNames;
				const machineState = new MachineState<
					ContextType,
					EventTypes,
					StateNames
				>({
					name: castedStateName,
					transitions,
					machineContextGetter: () => this._context,
					machineManagerBroker: {
						dispatch: dispatchToBrokers,
					},
				});
				return [castedStateName, machineState] as const;
			})
			.reduce((prev, [stateName, transitions]) => {
				prev[stateName as string] = transitions;
				return prev;
			}, {} as Record<StateNames, MachineState<ContextType, EventTypes, StateNames>>);

		this._current =
			this._states[params.initial] ||
			this._states[Object.keys(params.states)[0]];
	}

	/**
	 * Receives an event and make state transits accordingly.
	 * @param event - The dispatched Event.
	 * @internal
	 */
	async accept(event: EventTypes) {
		const {
			nextState: nextStateName,
			newContext,
			transition,
		} = await this._current.accept(event);
		const nextState = this._states[nextStateName];
		if (!nextState) {
			// TODO: handle invalid next state.
			throw new Error('TODO: handle invalid next state.');
		}
		this._current = nextState;
		if (newContext) {
			this._context = newContext;
		}
		for (const listener of this._transitionListeners) {
			listener.notify(transition);
		}

		// If the machine arrives at a final state, dispatch an event reset.
		if (this._finalStates.includes(this._current.name)) {
			for (const broker of this._eventBrokers) {
				broker.dispatch({
					type: 'RESET_MACHINE_EVENT_SYMBOL',
					toMachine: this.name,
				});
			}
		}
	}

	/**
	 * Get the current state and context of the machine.
	 * @returns The current state and context of the statemachine.
	 * @internal
	 */
	getCurrentState(): CurrentStateAndContext<ContextType, StateNames> {
		return {
			currentState: this._current.name,
			context: { ...this._context },
		};
	}

	/**
	 * Add more event brokers to current machine that would be invoked with
	 * events emitted from transition effects.
	 * @param broker
	 * @internal
	 */
	addBroker(broker: EventBroker<MachineManagerEvent>): void {
		this._eventBrokers.push(broker);
	}

	/**
	 * Add transition listeners to current machine that would be invoked with
	 * events emitted from transition effects. These can be used to execute
	 * arbitrary code upon state transition.
	 * @param listener
	 * @internal
	 */
	addListener(
		listener: TransitionListener<ContextType, EventTypes, string>
	): void {
		console.log(`${this.name}.addListener`, listener);
		this._transitionListeners.push(listener);
	}

	/**
	 * Resets the machine to a pristine state, with it's initial state, context and
	 * empty list of transition listeners.
	 */
	restart(): Machine<ContextType, EventTypes, StateNames> {
		this._current = this._states[this._initialState] || this._states[0];
		this._context = this._initialContext;
		this._transitionListeners = [];
		return this;
	}
}
