// /*
//  * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
//  * the License. A copy of the License is located at
//  *
//  *	 http://aws.amazon.com/apache2.0/
//  *
//  * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
//  * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
//  * and limitations under the License.
//  */

// import { setInterval, clearInterval } from 'timers';
// import { Completer } from './completer';
// import { Machine } from './machine';
// import {
// 	MachineContext,
// 	MachineEvent,
// 	MachineEventPayload,
// 	QueuedMachineEvent,
// 	StateMachineParams,
// } from './types';

// export class QueuedMachine<
// 	ContextType extends MachineContext
// > extends Machine<ContextType> {
// 	queue: QueuedMachineEvent<ContextType>[] = [];
// 	processing: boolean = false;
// 	interval: NodeJS.Timer;
// 	constructor(params: StateMachineParams<ContextType>) {
// 		super(params);
// 	}

// 	/**
// 	 * Receives an event for immediate processing
// 	 *
// 	 *
// 	 * @typeParam PayloadType - The type of payload received in current state
// 	 * @param event - The dispatched Event
// 	 */
// 	async send<PayloadType extends MachineEventPayload>(
// 		_: MachineEvent<PayloadType>
// 	) {
// 		// this.logger.warn(
// 		// 	'An event cannot be directly sent to a QueuedMachine. Use QueuedMachine.enqueue instead.'
// 		// );
// 	}

// 	/**
// 	 * Receives an event for queued processing
// 	 *
// 	 *
// 	 * @param enqueuedItem - The event, with additional data for handling queueing
// 	 */
// 	enqueue(itemToEnqueue: QueuedMachineEvent<ContextType>) {
// 		itemToEnqueue.completer = new Completer<ContextType>();
// 		this.queue.push(itemToEnqueue);
// 		if (!this.processing) {
// 			this.processing = true;
// 			this._queueProcessor();
// 		}
// 		return;
// 	}

// 	_queueProcessor() {
// 		this.interval = setInterval(() => {
// 			let currentEvent = this.queue.shift();
// 			this._processItem(currentEvent!);
// 		}, 1);
// 	}

// 	async _processItem(currentEvent: QueuedMachineEvent<ContextType>) {
// 		this.hub.listen(this.hubChannel, data => {
// 			const { payload } = data;
// 			if (currentEvent!.restingStates.includes(payload.data.state)) {
// 				currentEvent!.completer!.complete(payload.data.context);
// 			}
// 		});
// 		super._processEvent(currentEvent!.event);
// 		await currentEvent!.completer!.promise;
// 		if (this.queue.length === 0) {
// 			clearInterval(this.interval);
// 			this.processing = false;
// 		}
// 	}
// }
