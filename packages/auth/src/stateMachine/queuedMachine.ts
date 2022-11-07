/*
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *	 http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { Hub } from '@aws-amplify/core';
import { Completer } from './completer';
import { Machine } from './machine';
import {
	MachineContext,
	MachineEvent,
	MachineEventPayload,
	QueuedMachineEvent,
	StateMachineParams,
} from './types';

export class QueuedMachine<
	ContextType extends MachineContext
> extends Machine<ContextType> {
	queue: QueuedMachineEvent<ContextType>[] = [];
	processing: boolean = false;
	constructor(params: StateMachineParams<ContextType>) {
		super(params);
	}

	/**
	 * Receives an event for immediate processing
	 *
	 *
	 * @typeParam PayloadType - The type of payload received in current state
	 * @param event - The dispatched Event
	 */
	send<PayloadType extends MachineEventPayload>(_: MachineEvent<PayloadType>) {
		// super.logger.warn(
		// 	'An event cannot be directly sent to a QueuedMachine. Use QueuedMachine.enqueue instead.'
		// );
	}

	/**
	 * Receives an event for queued processing
	 *
	 *
	 * @param enqueuedItem - The event, with additional data for handling queueing
	 */
	enqueue(itemToEnqueue: QueuedMachineEvent<ContextType>) {
		this.queue.push(itemToEnqueue);
		itemToEnqueue.completer = new Completer<ContextType>();
		if (!this.processing) {
			this.processing = true;
			this._queueProcessor();
		}
	}

	async _queueProcessor() {
		while (this.queue.length != 0) {
			let currentEvent = this.queue[0];
			Hub.listen('DummyMachineQueued-channel', data => {
				const { payload } = data;
				if (currentEvent.restingStates?.includes(payload.data.state)) {
					currentEvent.completer!.complete(payload.data.context);
				}
				this.queue.shift();
			});
			super._processEvent(currentEvent.event);
		}
		this.processing = false;
	}
}
