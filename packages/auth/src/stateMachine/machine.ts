// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from '@aws-amplify/core';
// TODO: Import from core once library build is resolved
import { HubClass } from '@aws-amplify/core/lib-esm/Hub';
import { Completer } from './completer';
import { MachineState } from './MachineState';
import { v4 as uuid } from 'uuid';
import {
	MachineContext,
	MachineEventPayload,
	MachineEvent,
	StateMachineParams,
	StateTransition,
} from './types';
import { StateMachineHubEventName } from '../constants/StateMachineHubEventName';

export class Machine<ContextType extends MachineContext> {
	name: string;
	states: Map<string, MachineState<ContextType, MachineEventPayload>>;
	context: ContextType;
	current: MachineState<ContextType, MachineEventPayload>;
	hub: HubClass;
	public hubChannel: string;
	logger: Logger;
	initial?: MachineState<ContextType, MachineEventPayload>;
	private _queue: MachineEvent<ContextType, MachineEventPayload>[] = [];
	private _queueActive: boolean = false;
	private _interval: NodeJS.Timer;
	private _eventInFlight: boolean;
	constructor(params: StateMachineParams<ContextType>) {
		this.name = params.name;
		this.states = this._createStateMap(params.states);
		this.context = params.context;
		this.current = this.states.get(params.initial) || this.states[0];
		this.hub = new HubClass('auth-state-machine');
		this.hubChannel = `${this.name}-channel`;
		this.logger = new Logger(this.name);
		this._eventInFlight = false;
	}

	/**
	 * Receives an event for immediate processing
	 *
	 * @typeParam PayloadType - The type of payload received in current state
	 * @param event - The dispatched Event
	 */
	send<PayloadType extends MachineEventPayload>(
		event: MachineEvent<ContextType, PayloadType>
	) {
		event.completer = new Completer<ContextType>();
		event.id == uuid();
		this._queue.push(event);
		if (!this._queueActive) {
			this._queueActive = true;
			this._queueProcessor();
		}
		return;
	}

	private async _queueProcessor() {
		this._interval = setInterval(async () => {
			if (this._queue.length > 0 && !this._eventInFlight) {
				let currentEvent = this._queue.shift();
				this._eventInFlight = true;
				await this._handleQueuedItem(currentEvent!);
			}
		}, 1);
	}

	async _handleQueuedItem<PayloadType extends MachineEventPayload>(
		currentEvent: MachineEvent<ContextType, PayloadType>
	) {
		// clear interval before anything else to eliminate risk of it remaining
		if (this._queue.length === 0) {
			clearInterval(this._interval);
			this._queueActive = false;
		}

		this.hub.listen(this.hubChannel, hubEvent => {
			const { payload } = hubEvent;
			if (currentEvent!.id == hubEvent.payload.data.event.id) {
				currentEvent!.completer!.complete(payload.data.context);
			}
		});
		await this._processEvent<PayloadType>(currentEvent);
		await currentEvent!.completer!.promise;
		this._eventInFlight = false;
	}

	protected async _processEvent<PayloadType extends MachineEventPayload>(
		event: MachineEvent<ContextType, PayloadType>
	): Promise<void> {
		const validTransition = this.current.findTransition(event);

		if (!validTransition) {
			this._handleFailure(StateMachineHubEventName.NULL_TRANSITION, event);
			return;
		}
		const checkGuards = this._checkGuards(validTransition, event);
		if (!checkGuards) {
			this._handleFailure(StateMachineHubEventName.STATE_GUARD_FAILURE, event);
			return;
		}

		const nextState = this.states.get(validTransition.nextState);
		if (!nextState) {
			this._handleFailure(StateMachineHubEventName.NEXT_STATE_NOT_FOUND, event);
			return;
		}

		this.current = nextState;
		return await this._enterState<PayloadType>(validTransition, event!);
	}

	private async _enterState<PayloadType extends MachineEventPayload>(
		transition: StateTransition<ContextType, PayloadType>,
		event: MachineEvent<ContextType, PayloadType>
	): Promise<void> {
		this._invokeReducers<PayloadType>(transition, event);

		// _broadCastTransition after _invokeReducers (for updated context)
		this._broadCastTransition<PayloadType>(event, transition);
		this._invokeActions<PayloadType>(transition, event);
		if (this.current?.invocation?.invokedMachine) {
			this.current.invocation.invokedMachine.send(
				this.current.invocation.event!
			);
		} else if (this.current?.invocation?.invokedPromise) {
			await this.current.invocation.invokedPromise(this.context, event);
		}
	}

	private _checkGuards<PayloadType extends MachineEventPayload>(
		transition: StateTransition<ContextType, PayloadType>,
		event: MachineEvent<ContextType, PayloadType>
	): boolean {
		if (!transition.guards) return true;
		for (let g = 0; g < transition.guards.length; g++) {
			if (!transition.guards[g](this.context, event)) {
				return false;
			}
		}
		return true;
	}

	private _invokeReducers<PayloadType extends MachineEventPayload>(
		transition: StateTransition<ContextType, PayloadType>,
		event: MachineEvent<ContextType, PayloadType>
	): void {
		if (!transition.reducers) return;
		for (let r = 0; r < transition.reducers.length; r++) {
			this.context = transition.reducers[r](
				this._copyContext(this.context),
				event
			);
		}
	}

	private async _invokeActions<PayloadType extends MachineEventPayload>(
		transition: StateTransition<ContextType, PayloadType>,
		event: MachineEvent<ContextType, PayloadType>
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

	private _broadCastTransition<PayloadType extends MachineEventPayload>(
		event: MachineEvent<ContextType, PayloadType>,
		transition: StateTransition<ContextType, PayloadType>
	): void {
		this.hub.dispatch(
			this.hubChannel,
			{
				event: StateMachineHubEventName.STATE_TRANSITION,
				data: {
					state: this.current?.name,
					context: this.context,
					transition,
					event,
				},
			},
			this.name
		);
	}

	private _handleFailure<PayloadType extends MachineEventPayload>(
		msg: StateMachineHubEventName,
		event: MachineEvent<ContextType, PayloadType>
	): void {
		event.completer!.complete(this.context);
		this.hub.dispatch(
			this.hubChannel,
			{
				event: msg,
				data: {
					state: this.current?.name,
					context: this.context,
					event,
				},
			},
			this.name
		);
	}

	private _copyContext<T extends object>(source: T): T {
		return JSON.parse(JSON.stringify(source));
	}
}
