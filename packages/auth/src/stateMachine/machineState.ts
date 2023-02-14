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
	TransitionListener,
} from './types';

export interface MachineStateClassParams<
	ContextType extends MachineContext,
	EventTypes extends MachineEvent,
	StateNames extends string
> {
	name: StateNames;
	transitions: StateTransitions<ContextType, EventTypes, StateNames>;
	machineContextGetter: () => ContextType;
	machineManagerBrokers: EventBroker<MachineEvent>;
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
		this.machineManager = props.machineManagerBrokers;
	}

	async accept(
		event: EventTypes
	): Promise<MachineStateEventResponse<ContextType, EventTypes>> {
		// TODO: currently if reducers are invoked before actions, we use reducers;
		// if context update happens after actions, we need to return new context
		// from actions. This is confusing.
		const validTransition = this.getValidTransition(event);
		const oldContext = this.machineContextGetter();
		let newContext = oldContext;
		// validTransition can only be the one handling current event. Cast
		// the event to make TSC happy.
		const castedEvent = event as Extract<
			EventTypes,
			{ type: EventTypes['type'] }
		>;
		validTransition?.reducers?.forEach(reducer => {
			newContext = reducer(newContext, castedEvent);
		});
		const contextAfterReducers = newContext;

		const promiseArr = validTransition?.actions?.map(async action => {
			const contextFromAction = await action(
				contextAfterReducers,
				castedEvent,
				this.machineManager
			);
			if (contextFromAction && contextFromAction !== contextAfterReducers) {
				Object.assign(newContext, contextFromAction);
			}
		});
		// TODO: Concurrently running actions causes new events emitted in
		// undetermined order. Should we run them in order? Or implement Promise.allSettle
		(await Promise.all(promiseArr ?? [])) as unknown as Promise<void>;

		const response: MachineStateEventResponse<ContextType, EventTypes> = {
			transition: validTransition,
			nextState: validTransition?.nextState ?? this.name,
			newContext: newContext !== oldContext ? newContext : undefined,
		};
		return response;
	}

	private getValidTransition(
		event: EventTypes
	):
		| StateTransition<
				ContextType,
				Extract<EventTypes, { type: EventTypes['type'] }>,
				StateNames
		  >
		| undefined {
		const context = this.machineContextGetter();
		const transitionsOnEvent =
			this.transitions[event.type as EventTypes['type']];
		const validTransitions =
			transitionsOnEvent?.filter(transition => {
				const blocked = transition?.guards?.some(
					guard =>
						guard(
							context,
							event as Extract<EventTypes, { type: EventTypes['type'] }>
						) === false
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
