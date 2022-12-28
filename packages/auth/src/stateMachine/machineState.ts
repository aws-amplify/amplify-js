// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	MachineContext,
	MachineEvent,
	MachineState as IMachineState,
	MachineStateEventResponse,
	EventBroker,
	StateTransition,
	StateTransitions,
} from './types';

export interface MachineStateClassParams<
	ContextType extends MachineContext,
	EventTypes extends MachineEvent,
	StateNames extends string
> {
	name: StateNames;
	transitions: StateTransitions<ContextType, EventTypes, StateNames>;
	machineContextGetter: () => ContextType;
	machineManager: EventBroker<MachineEvent>;
}

/**
 * @internal
 */
export class MachineState<
	ContextType extends MachineContext,
	EventTypes extends MachineEvent,
	StateNames extends string
> implements IMachineState<ContextType, EventTypes>
{
	name: StateNames;
	transitions: StateTransitions<ContextType, EventTypes, StateNames>;
	private readonly machineContextGetter: () => ContextType; // Use readonly to prevent re-assign of context reference
	private readonly machineManager: EventBroker<MachineEvent>;

	constructor(
		props: MachineStateClassParams<ContextType, EventTypes, StateNames>
	) {
		this.name = props.name;
		this.transitions = props.transitions ?? {};
		this.machineContextGetter = props.machineContextGetter;
		this.machineManager = props.machineManager;
	}

	accept(event: EventTypes): MachineStateEventResponse<ContextType> {
		const validTransition = this.getValidTransition(event);
		const nextState = validTransition?.nextState ?? this.name;
		const oldContext = this.machineContextGetter();
		let newContext = oldContext;
		// validTransition can only be the one handling current event. Cast
		// the event to make TSC happy.
		const castedEvent = event as Extract<
			EventTypes,
			{ name: EventTypes['name'] }
		>;
		validTransition?.reducers?.forEach(reducer => {
			newContext = reducer(newContext, castedEvent);
		});
		const response: MachineStateEventResponse<ContextType> = {
			nextState,
		};
		if (newContext !== oldContext) {
			response.newContext = newContext;
		}
		if ((validTransition?.effects ?? []).length > 0) {
			const promiseArr = validTransition!.effects!.map(effect =>
				effect(newContext, castedEvent, this.machineManager)
			);
			// TODO: Concurrently running effects causes new events emitted in
			// undetermined order. Should we run them in order? Or implement Promise.allSettle
			response.effectsPromise = Promise.all(
				promiseArr
			) as unknown as Promise<void>;
		}
		return response;
	}

	private getValidTransition(
		event: EventTypes
	):
		| StateTransition<
				ContextType,
				Extract<EventTypes, { name: EventTypes['name'] }>,
				StateNames
		  >
		| undefined {
		const context = this.machineContextGetter();
		const transitionsOnEvent =
			this.transitions[event.name as EventTypes['name']];
		const validTransitions =
			transitionsOnEvent?.filter(transition => {
				const blocked = transition?.guards?.some(guard =>
					guard(
						context,
						event as Extract<EventTypes, { name: EventTypes['name'] }>
					)
				);
				return !blocked;
			}) ?? [];
		if (validTransitions.length === 0) {
			return undefined; // TODO: should we do nothing on unknown event?
		} else if (validTransitions.length > 1) {
			throw new Error('Got more than 1 valid transitions');
		} else {
			return validTransitions[0];
		}
	}
}
