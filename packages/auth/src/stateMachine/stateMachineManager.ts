// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CurrentStateAndContext,
	EventBroker,
	MachineContext,
	MachineEvent,
	MachineManagerEvent,
} from './types';
import { Machine } from './machine';

type MachineState = CurrentStateAndContext<MachineContext, string>;

const CURRENT_STATES_EVENT_SYMBOL = Symbol('CURRENT_STATES_EVENT_PAYLOAD');

const CURRENT_STATES_EVENT: MachineEvent = {
	name: 'CURRENT_STATES_EVENT',
	payload: CURRENT_STATES_EVENT_SYMBOL,
};

/**
 * A state machine manager class that:
 * 1. Handles concurrent invocations. It queues the events if there's ongoing
 *     event processing. It makes sure at most 1 event is processed at any given
 *     time.
 * 2. Handles events may emit from any enclosing state machines' state transits,
 *     including cross-machine events.
 */
export class MachineManager<MachineTypes extends Machine<any, any, any>> {
	private _apiQueue: [
		MachineManagerEvent,
		(value: MachineState | PromiseLike<MachineState>) => void,
		(reason?: any) => void
	][] = [];
	private _machineQueue: MachineEvent[] = [];
	private _machines: Record<string, MachineTypes>;
	private _isActive = false;

	constructor(...machines: Array<MachineTypes>) {
		const managerEventBroker: EventBroker<MachineEvent> = {
			dispatch: event => {
				this._machineQueue.push(event);
			},
		};
		this._machines = machines.reduce((prev, curr) => {
			if (prev[curr.name]) {
				throw new Error(`Duplicated state machine name "${curr.name}"`);
			}
			// TODO: do we need to remove listeners?
			curr.addListener(managerEventBroker);
			prev[curr.name] = curr;
			return prev;
		}, {});
	}

	/**
	 * Invoking any enclosing state machine with given event, and return the
	 * context of all enclosing state machines context at the end of invocation.
	 *
	 * @param event - Machine event that may invoke any enclosing machine.
	 * @return
	 */
	async send(event: MachineManagerEvent): Promise<MachineState> {
		let resolve;
		let reject;
		const res = new Promise<MachineState>((res, rej) => {
			resolve = res;
			reject = rej;
		});
		this._apiQueue.push([event, resolve, reject]);
		if (!this._isActive) {
			this._processApiQueue();
		}
		return await res;
	}

	private async _processApiQueue() {
		this._isActive = true;
		for (const [event, resolve, reject] of this._apiQueue) {
			try {
				if (event.payload !== CURRENT_STATES_EVENT_SYMBOL) {
					await this._processApiEvent(event);
				}
				resolve(this._getMachineState(event.toMachine));
			} catch (e) {
				reject(e);
			}
		}
		this._isActive = false;
	}

	private async _processApiEvent(event: MachineEvent) {
		this._machineQueue.push(event);
		while (this._machineQueue.length > 0) {
			// Get the first event of the machine queue. This cause a DFS-like manner
			// of event propagation and state transits.
			const machineEvent = this._machineQueue.shift();
			await this._sendToMachine(machineEvent!);
		}
	}

	private async _sendToMachine(event: MachineEvent) {
		if (!event.toMachine) {
			throw new Error(
				`Event missing routing machine name. Event: ${JSON.stringify(event)}`
			);
		}
		const machine = this._machines[event.toMachine];
		if (!machine) {
			throw new Error(
				`Cannot route event to machine ${
					event.toMachine
				}. Event ${JSON.stringify(event)}`
			);
		}
		await machine.accept(event);
	}

	private _getMachineState(machineName: string): MachineState {
		if (!this._machines[machineName]) {
			throw new Error(
				`No state machine ${machineName} configured. Expect ${JSON.stringify(
					Object.keys(this._machines)
				)}`
			);
		}
		return this._machines[machineName].getCurrentState();
	}

	public async getCurrentState(
		machineName: string
	): Promise<CurrentStateAndContext<MachineContext, string>> {
		return await this.send({ ...CURRENT_STATES_EVENT, toMachine: machineName });
	}
}
