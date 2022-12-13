import { Machine } from '../src/stateMachine/machine';
import { MachineManager } from '../src/stateMachine/stateMachineManager';

describe(MachineManager.name, () => {
	const wait = (ms: number) =>
		new Promise<void>(resolve => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	type Context = {
		events: Events[];
	};
	type Events = {
		name: 'tick' | 'tock';
		payload: {
			recordId: string;
		};
	};
	type Machine1States = 'StateA' | 'StateB';
	const machine1 = new Machine<Context, Events, Machine1States>({
		context: { events: [] },
		name: 'Machine1' as const,
		initial: 'StateA',
		states: {
			StateA: {
				tick: [
					{
						nextState: 'StateB',
						effects: [
							async (ctxt, event, broker) => {
								console.log('tick');
								await wait(1000);
								broker.dispatch({
									name: 'tock',
									payload: 'tock',
								});
							},
						],
					},
				],
			},
			StateB: {
				tock: [
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
			const tickEvent = { name: 'tick', payload: {}, toMachine: 'Machine1' };
			const contexts = await Promise.all([
				manager.send(tickEvent),
				manager.send(tickEvent),
				manager.send(tickEvent),
			]);
			expect(contexts[1]).toEqual([{ event }]);
		}, 30000);
	});
});
