import { Machine } from '../../src/stateMachine/machine';
import { TransitionEffect } from '../../src/stateMachine/types';

const wait = (ms: number) =>
	new Promise<void>(resolve => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
export type TickEvent = {
	name: 'tick';
	payload: {
		recordId: string;
	};
};
export type TockEvent = {
	name: 'tock';
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
	tickEffect: TransitionEffect<Context, TickEvent> = async () => {},
	tockEffect: TransitionEffect<Context, TockEvent> = async () => {}
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
						effects: [
							tickEffect,
							async (ctxt, event, broker) => {
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
