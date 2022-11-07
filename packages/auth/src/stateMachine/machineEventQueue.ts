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

// import { Machine } from './machine';
// import {
// 	MachineContext,
// 	MachineEvent,
// 	MachineEventPayload,
// 	QueuedMachineEvent,
// } from './types';

// export class MachineEventQueue<ContextType extends MachineContext> {
// 	machine: Machine<ContextType>;
// 	queue: QueuedMachineEvent<any>[] = [];
// 	processing: boolean = false;

// 	constructor(machine: Machine<ContextType>) {
// 		this.machine = machine;
// 	}

// 	enqueue<PayloadType extends MachineEventPayload>(
// 		event: QueuedMachineEvent<PayloadType>
// 	): Completer<any> {
// 		this.queue.push(event);
// 		event.completer = new Promise<void>();
// 		if (!this.processing) {
// 			this.processing = true;
// 			this.queueProcessor();
// 		}
// 		return eventWrapper.completer;
// 	}

// 	async queueProcessor() {
// 		while (this.queue.length != 0) {
// 			var currentEvent = this.queue[0];
// 			const eventObject = {
// 				type: currentEvent.eventName,
// 				user: currentEvent.user,
// 			};
// 			this.machine.send(eventObject, { to: this.machine.id });
// 			await waitFor(this.machine, state =>
// 				state.matches(currentEvent.expectedState)
// 			);
// 			currentEvent.completer.complete(new User('testUser'));
// 			this.queue.shift();
// 		}
// 		this.processing = false;
// 	}
// }
