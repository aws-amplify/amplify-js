// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { MachineState } from './MachineState';
import {
	MachineContext,
	MachineEventPayload,
	MachineEvent,
	StateMachineParams,
	StateTransition,
} from './types';

// TODO: Queue
// TODO: Listeners
export class Machine<ContextType extends MachineContext> {
	name: string;
	states: Map<string, MachineState<ContextType, MachineEventPayload>>;
	context: ContextType;
	current: MachineState<ContextType, MachineEventPayload>;
	constructor(params: StateMachineParams<ContextType>) {
		this.name = params.name;
		this.states = this._createStateMap(params.states);
		this.context = params.context;
		this.current = this.states.get(params.initial) || this.states[0];
	}

	/**
	 * Receives an event for processing
	 *
	 * @typeParam PayloadType - The type of payload received in current state
	 * @param event - The dispatched Event
	 */
	send<PayloadType extends MachineEventPayload>(
		event: MachineEvent<PayloadType>
	) {
		const validTransition = this.current.findTransition(event);

		///TODO: Communicate null transition
		if (!validTransition) return;
		const checkGuards = this._checkGuards(validTransition, event);
		//TODO: Communicate guard failure
		if (!checkGuards) return;

		const nextState = this.states.get(validTransition.nextState);
		//TODO: Handle error in state map
		if (!nextState) return;

		this.current = nextState;
		this._enterState(validTransition, event);
	}

	private _enterState(
		transition: StateTransition<ContextType, MachineEventPayload>,
		event: MachineEvent<MachineEventPayload>
	) {
		this._invokeReducers(transition, event);
		this._invokeActions(transition, event);
		if (this.current?.invocation) {
			this.current.invocation.machine.send(this.current.invocation.event);
		}
	}

	private _checkGuards(
		transition: StateTransition<ContextType, MachineEventPayload>,
		event: MachineEvent<MachineEventPayload>
	): boolean {
		if (!transition.guards) return true;
		for (let g = 0; g < transition.guards.length; g++) {
			if (!transition.guards[g](this.context, event)) {
				return false;
			}
		}
		return true;
	}

	private _invokeReducers(
		transition: StateTransition<ContextType, MachineEventPayload>,
		event: MachineEvent<MachineEventPayload>
	): void {
		if (!transition.reducers) return;
		for (let r = 0; r < transition.reducers.length; r++) {
			transition.reducers[r](this.context, event);
		}
	}

	private async _invokeActions(
		transition: StateTransition<ContextType, MachineEventPayload>,
		event: MachineEvent<MachineEventPayload>
	): Promise<void> {
		if (!transition.actions) return;
		for (let r = 0; r < transition.actions.length; r++) {
			transition.actions[r](this.context, event);
		}
	}

	//TODO: validate states with uniqueness on name (otherwise a dupe will just be overridden in Map)
	private _createStateMap(
		states: MachineState<ContextType, MachineEventPayload>[]
	): Map<string, MachineState<ContextType, MachineEventPayload>> {
		return states.reduce(function (map, obj) {
			map.set(obj.name, obj);
			return map;
		}, new Map<string, MachineState<ContextType, MachineEventPayload>>());
	}
}
