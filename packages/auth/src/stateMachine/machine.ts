// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from '@aws-amplify/core';
// TODO: Import from core once library build is resolved
import { Completer } from './completer';
import { MachineState } from './MachineState';
import { Observable } from 'zen-observable-ts';
import { v4 as uuid } from 'uuid';
import {
	MachineContext,
	MachineEventPayload,
	MachineEvent,
	StateMachineParams,
	StateTransition,
} from './types';
import { StateMachineHubEventName } from '../constants/StateMachineHubEventName';
import { HubClass } from '@aws-amplify/core/lib-esm/Hub';

export class Machine<ContextType extends MachineContext> {
	name: string;
	states: Map<string, MachineState<ContextType, MachineEventPayload>>;
	context: ContextType;
	current: MachineState<ContextType, MachineEventPayload>;
	hub: HubClass;
	public hubChannel: string;
	logger: Logger;
	initial?: MachineState<ContextType, MachineEventPayload>;
	// private _queue: MachineEvent<MachineEventPayload>[] = [];

	private _queue: String[];

	private _queueActive: boolean = false;
	private _transitions: StateTransition<ContextType, any>[];
	private _transitionObservable: Observable<
		MachineEvent<MachineEventPayload>[]
	>;
	private _transitionObserver: ZenObservable.Subscription;

	private _observer: Observable<string>;

	constructor(params: StateMachineParams<ContextType>) {
		this.name = params.name;
		this.states = this._createStateMap(params.states);
		this.context = params.context;
		this._queue = [];
		this.current = this.states.get(params.initial) || this.states[0];
		this.hub = new HubClass('auth-state-machine');
		this.hubChannel = `${this.name}-channel`;
		this.logger = new Logger(this.name);
		this._transitions = [];
		// this._transitionObserver = Observable.of(this._queue).subscribe({
		// 	next(x) {
		// 		this._queueProcessor();
		// 	},
		// 	error(err) {
		// 		console.log(`Finished with error: ${err}`);
		// 	},
		// 	complete() {
		// 		console.log('Finished');
		// 	},
		// });

		// this._transitionObserver = Observable.from(this._queue).subscribe(() => {
		// 	this._queueProcessor();
		// });

		this.hub.listen('auth-event-added', data => {
			/// add to queue

			/// then conditionally call processing function
			console.log('data', data);
		});
	}

	/**
	 * Receives an event for immediate processing
	 *
	 * @typeParam PayloadType - The type of payload received in current state
	 * @param event - The dispatched Event
	 */
	async send<PayloadType extends MachineEventPayload>(
		event: MachineEvent<PayloadType>
	) {
		this.hub.dispatch('auth-event-added', {
			event: 'auth-event-added',
			data: {
				event,
			},
		});
		// if (!this._queueActive) {
		// 	this._queueActive = true;
		// 	this._queueProcessor();
		// }
		// return;
	}

	private async _queueProcessor() {
		if (this._queue.length > 0) {
			let currentEvent = this._queue.shift();
			let queueProcessor = this._queueProcessor;
			this.hub.listen(this.hubChannel, data => {
				return this._queueProcessor();
			});
			// this._processEvent(currentEvent!);
		} else {
			this._queueActive = false;
			// this._transitionObserver.unsubscribe();
		}
	}

	protected async _processEvent(
		event: MachineEvent<MachineEventPayload>
	): Promise<void> {
		const validTransition = this.current.findTransition(event);
		this._transitions.push(validTransition!);
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

		await this._enterState(validTransition, event!);
	}

	private async _enterState<PayloadType extends MachineEventPayload>(
		transition: StateTransition<ContextType, PayloadType>,
		event: MachineEvent<PayloadType>
	): Promise<void> {
		this._invokeReducers<PayloadType>(transition, event);

		this._invokeActions<PayloadType>(transition, event);
		if (this.current?.invocation?.invokedMachine) {
			this.current.invocation.invokedMachine.send(
				this.current.invocation.event!
			);
		} else if (this.current?.invocation?.invokedPromise) {
			await this.current.invocation.invokedPromise(this.context, event);
		}

		// _broadCastTransition after _invokeReducers (for updated context)
		this._broadCastTransition<PayloadType>(event, transition);
	}

	private _checkGuards<PayloadType extends MachineEventPayload>(
		transition: StateTransition<ContextType, PayloadType>,
		event: MachineEvent<PayloadType>
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
		event: MachineEvent<PayloadType>
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
		event: MachineEvent<PayloadType>
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
		event: MachineEvent<PayloadType>,
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
		event: MachineEvent<PayloadType>
	): void {
		// event.completer!.complete(this.context);
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
