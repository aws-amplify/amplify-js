// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { MachineState } from './MachineState';
import { v4 as uuid } from 'uuid';
import {
	CurrentStateAndContext,
	EventBroker,
	EventConsumer,
	EventProducer,
	MachineContext,
	MachineEvent,
	StateMachineParams,
	StateTransitions,
} from './types';
// TODO: Import from core once library build is resolved
import { HubClass } from '@aws-amplify/core/lib-esm/Hub';

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
	private _eventBrokers: EventBroker<MachineEvent>[];

	public readonly name: string;
	public readonly hub: HubClass;
	public readonly hubChannel: string;

	constructor(params: StateMachineParams<ContextType, EventTypes, StateNames>) {
		this.name = params.name;
		this._context = params.context;
		this._eventBrokers = [];
		this.hub = new HubClass('auth-state-machine');
		this.hubChannel = `${this.name}-channel`;

		const dispatchToBrokers = event => {
			if (!event.toMachine) {
				// By default, the emitted events will be routed back to current state machine;
				event.toMachine = this.name;
			}
			for (const broker of this._eventBrokers) {
				broker.dispatch(event);
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
					transitions: transitions,
					machineContextGetter: () => this._context,
					machineManager: {
						dispatch: dispatchToBrokers,
					},
					hub: this.hub,
					hubChannel: this.hubChannel,
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
		event.id = uuid();
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
	 */
	addListener(broker: EventBroker<MachineEvent>): void {
		this._eventBrokers.push(broker);
	}
}
