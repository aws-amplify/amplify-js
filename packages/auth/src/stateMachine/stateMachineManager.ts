// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Logger } from '@aws-amplify/core';
import { v4 } from 'uuid';
import {
	CurrentStateAndContext,
	EventBroker,
	MachineContext,
	MachineEvent,
	MachineManagerEvent,
} from './types';
import { Machine } from './machine';

type MachineState = CurrentStateAndContext<MachineContext, string>;
// General type for any machine.
type MachineType = Machine<any, any, any>;

const CURRENT_STATES_EVENT_SYMBOL = Symbol('CURRENT_STATES_EVENT_PAYLOAD');
interface CurrentStateEventType extends Omit<MachineManagerEvent, 'name'> {
	name: typeof CURRENT_STATES_EVENT_SYMBOL;
}

const ADD_MACHINE_EVENT_SYMBOL = Symbol('ADD_MACHINE_EVENT_PAYLOAD');
interface AddMachineEventType extends Omit<MachineManagerEvent, 'name'> {
	name: typeof ADD_MACHINE_EVENT_SYMBOL;
	payload: { machine: MachineType };
}

type InternalEvent =
	| MachineManagerEvent
	| CurrentStateEventType
	| AddMachineEventType;

type MachinePromiseContext = [
	(value: MachineState | PromiseLike<MachineState>) => void,
	(reason?: any) => void
];

export interface MachineManagerOptions {
	name: string;
	logger: Logger;
}

/**
 * A state machine manager class that:
 * 1. Handles concurrent invocations. It queues the events if there's ongoing
 *     event processing. It makes sure at most 1 event is processed at any given
 *     time.
 * 2. Handles events may emit from any enclosing state machines' state transits,
 *     including cross-machine events.
 */
export class MachineManager {
	public readonly name: string;
	private readonly logger: Logger;
	private _apiQueue: {
		event: InternalEvent;
		promiseContext: MachinePromiseContext;
	}[] = [];
	private _machineQueue: MachineEvent[] = [];
	private _machines: Record<string, MachineType> = {};
	private _isActive = false;

	constructor(options: MachineManagerOptions) {
		this.name = options.name;
		this.logger = options.logger;
	}

	/**
	 * Get the state and context of the specified machine. If there are events
	 * being processed, it returns in the state and context after queueing events.
	 *
	 * @param machineName - The name of the requesting macine.
	 */
	public async getCurrentState(
		machineName: string
	): Promise<CurrentStateAndContext<MachineContext, string>> {
		return await this._enqueueEvent({
			name: CURRENT_STATES_EVENT_SYMBOL,
			payload: {},
			toMachine: machineName,
		});
	}

	/**
	 * Add a new state machine to the manager. If there are events being processed,
	 * it adds the state machine after queueing events. No operation if the input
	 * machine's name has already been added to the manager.
	 *
	 * @param machine
	 */
	public async addMachineIfAbsent(machine: MachineType) {
		await this._enqueueEvent({
			name: ADD_MACHINE_EVENT_SYMBOL,
			payload: { machine },
			toMachine: machine.name,
		});
	}

	/**
	 * Invoking any enclosing state machine with given event, and return the
	 * context of all enclosing state machines context at the end of invocation.
	 *
	 * @param event - Machine event that may invoke any enclosing machine.
	 */
	async send(event: MachineManagerEvent): Promise<MachineState> {
		return this._enqueueEvent(event);
	}

	private async _addMachineIfAbsent(machine: MachineType) {
		if (!this._machines[machine.name]) {
			const managerEventBroker: EventBroker<MachineEvent> = {
				dispatch: event => {
					this._machineQueue.push(event);
				},
			};
			machine.addListener(managerEventBroker);
			this._machines[machine.name] = machine;
		} else {
			this.logger.debug(
				`State machine ${machine.name} already exists in machine manager ${this.name}`
			);
		}
	}

	private async _enqueueEvent(event: InternalEvent) {
		let resolve;
		let reject;
		const res = new Promise<MachineState>((res, rej) => {
			resolve = res;
			reject = rej;
		});
		this._apiQueue.push({ event, promiseContext: [resolve, reject] });
		if (!this._isActive) {
			this._processApiQueue();
		}
		return await res;
	}

	private async _processApiQueue() {
		this._isActive = true;
		while (this._apiQueue.length > 0) {
			const {
				event,
				promiseContext: [resolve, reject],
			} = this._apiQueue.shift()!;
			try {
				if (event.name === CURRENT_STATES_EVENT_SYMBOL) {
					// Skip.
				} else if (event.name === ADD_MACHINE_EVENT_SYMBOL) {
					const newMachine = event.payload.machine;
					await this._addMachineIfAbsent(newMachine);
				} else {
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
			machineEvent!.id = machineEvent!.id ?? v4();
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
			this.logger.debug(
				`Cannot route event name ${event.name} to machine ${event.toMachine}. Event id ${event.id}.`
			);
			return;
			// Skip.
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
}
