import { Machine } from '../src/stateMachine/machine';
import { MachineManager } from '../src/stateMachine/stateMachineManager';
import { dummyMachine } from './utils/dummyMachine';

describe(MachineManager.name, () => {
	const wait = (ms: number) =>
		new Promise<void>(resolve => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	type Machine1States = 'StateA' | 'StateB';
	const machine1 = new Machine<any, any, Machine1States>({
		context: {},
		name: 'Machine1',
		initial: 'StateA',
		states: {
			StateA: {
				event1: [
					{
						nextState: 'StateB',
						effects: [
							async (ctxt, event, broker) => {
								console.log('tick');
								await wait(1000);
							},
						],
					},
				],
			},
			StateB: {
				event1: [
					{
						nextState: 'StateA',
						effects: [
							async (ctxt, event, broker) => {
								console.log('tock');
								await wait(1000);
							},
						],
					},
				],
			},
		},
	});

	const manager = new MachineManager(machine1);

	describe('event queueing', () => {
		it('should handle concurrent events', async () => {
			await Promise.all([
				manager.send({ name: 'event1', payload: {}, toMachine: 'Machine1' }),
				manager.send({ name: 'event1', payload: {}, toMachine: 'Machine1' }),
				manager.send({ name: 'event1', payload: {}, toMachine: 'Machine1' }),
				manager.send({ name: 'event1', payload: {}, toMachine: 'Machine1' }),
				manager.send({ name: 'event1', payload: {}, toMachine: 'Machine1' }),
			]);
		}, 30000);
	});
});
