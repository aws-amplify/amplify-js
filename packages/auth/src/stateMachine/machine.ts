// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 } from 'uuid';
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
	private _states: Record<
		StateNames,
		MachineState<ContextType, EventTypes, StateNames>
	>;
	private _context: ContextType;
	private _current: MachineState<ContextType, EventTypes, StateNames>;
	private _eventBrokers: EventBroker<MachineManagerEvent>[];

	public readonly name: string;

	constructor(params: StateMachineParams<ContextType, EventTypes, StateNames>) {
		this.name = params.name;
		this._context = params.context;
		this._eventBrokers = [];

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
					machineManager: {
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
	 * Receives an event and make state transits accrodingly.
	 * @param event - The dispatched Event.
	 * @internal
	 */
	async accept(event: EventTypes) {
		const {
			nextState: nextStateName,
			newContext,
			effectsPromise,
		} = this._current.accept(event);
		const nextState = this._states[nextStateName];
		if (!nextState) {
			// TODO: handle invalid next state.
			throw new Error('TODO: handle invalid next state.');
		}
		this._current = nextState;
		if (newContext) {
			this._context = newContext;
		}
		await effectsPromise;
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
	addListener(broker: EventBroker<MachineManagerEvent>): void {
		this._eventBrokers.push(broker);
	}
}
