import { Machine } from '../../src/stateMachine/machine';
import { TransitionAction } from '../../src/stateMachine/types';

const wait = (ms: number) =>
	new Promise<void>(resolve => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
export type TickEvent = {
	type: 'tick';
	payload: {
		recordId: string;
	};
};
export type TockEvent = {
	type: 'tock';
	payload: {
		recordId: string;
	};
};
export type Events = TickEvent | TockEvent;
export type Context = {
	events: Events[];
};
type Machine1States = 'StateA' | 'StateB';

export const tickTockMachine = (
	tickEffect: TransitionAction<Context, TickEvent> = async () => {},
	tockEffect: TransitionAction<Context, TockEvent> = async () => {}
) =>
	new Machine<Context, Events, Machine1States>({
		context: { events: [] },
		name: 'TickTock' as const,
		initial: 'StateA',
		states: {
			StateA: {
				tick: [
					{
						nextState: 'StateB',
						actions: [
							tickEffect,
							async (ctxt, event, broker) => {
								await wait(1000);
								broker.dispatch({
									type: 'tock',
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
						actions: [
							tockEffect,
							async (ctxt, event, broker) => {
								await wait(1000);
								ctxt;
							},
						],
					},
				],
			},
		},
	});
