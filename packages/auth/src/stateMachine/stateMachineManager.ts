// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventBroker, MachineEvent } from './types';
import { Machine } from './machine';

type AllMachineContext<MachineTypes extends Machine<any, any, any>> = {
	[name in MachineTypes['name']]: ReturnType<
		MachineTypes['getCurrentState']
	>['context'];
};

export class MachineManager<MachineTypes extends Machine<any, any, any>> {
	private _apiQueue: [
		MachineEvent,
		(
			value:
				| AllMachineContext<MachineTypes>
				| PromiseLike<AllMachineContext<MachineTypes>>
		) => void,
		(reason?: any) => void
	][] = [];
	private _machineQueue: MachineEvent[] = [];
	private _machines: { [name in MachineTypes['name']]: MachineTypes };
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
		}, {} as { [name in MachineTypes['name']]: MachineTypes });
	}

	async send(event: MachineEvent): Promise<AllMachineContext<MachineTypes>> {
		let resolve;
		let reject;
		const res = new Promise<AllMachineContext<MachineTypes>>((res, rej) => {
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
				await this._processApiEvent(event);
				resolve(this._getAllMachineContext());
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
			this._sendToMachine(machineEvent!);
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
		await (machine as MachineTypes).accept(event);
	}

	private _getAllMachineContext() {
		return Object.entries(this._machines).reduce((prev, [name, machine]) => {
			prev[name] = (machine as MachineTypes).getCurrentState().context;
			return prev;
		}, {} as AllMachineContext<MachineTypes>);
	}
}
