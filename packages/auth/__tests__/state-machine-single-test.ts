// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HubCapsule } from '@aws-amplify/core';
import { noop } from 'lodash';
import { Invocation } from '../src/stateMachine/invocation';
import { Machine } from '../src/stateMachine/machine';
import { StateTransition } from '../src/stateMachine/types';
import {
	badEvent1,
	DummyContext,
	goodEvent1,
	goodEvent2,
	state1Name,
	State1Payload,
	state2Name,
	State2Payload,
	state3Name,
} from './utils/dummyEventsAndTypes';
import { dummyMachine } from './utils/dummyMachine';

let machine: Machine<DummyContext>;
let stateOneTransitions: StateTransition<DummyContext, State1Payload>[];
let stateTwoTransitions: StateTransition<DummyContext, State2Payload>[];
let stateTwoInvocation: Invocation<DummyContext, State2Payload>;

const testSource = 'state-machine-single-tests';
let events: HubCapsule[] = [];
const timeoutMS = 200;

// describe('State machine instantiation tests...', () => {
// 	beforeEach(() => {
// 		events = [];
// 		stateOneTransitions = [
// 			{
// 				event: 'event1',
// 				nextState: state2Name,
// 			},
// 		];
// 		machine = dummyMachine({
// 			initialContext: { testSource },
// 			stateOneTransitions,
// 		});
// 		machine.hub.listen(machine!.hubChannel, data => {
// 			events.push(data);
// 		});
// 	});

// 	test('...the SM can be instantiated', () => {
// 		expect(machine).toBeTruthy();
// 	});

// 	test('...the SM state map has been created', () => {
// 		const expectedState1 = machine?.states.get(state1Name);
// 		const expectedState2 = machine?.states.get(state2Name);
// 		const expectedState3 = machine?.states.get(state3Name);
// 		expect(machine?.states.size).toEqual(3);
// 		expect(expectedState1).toBeDefined();
// 		expect(expectedState2).toBeDefined();
// 		expect(expectedState3).toBeDefined();
// 	});

// 	test("...the SM's initial context is set", () => {
// 		expect(machine?.context.testSource).toEqual(testSource);
// 	});

// 	test("...the SM's initial state is set", () => {
// 		expect(machine?.current?.name).toEqual(state1Name);
// 	});

// 	test('...the SM performs a simple state transition', async () => {
// 		machine?.send<State1Payload>(goodEvent1);
// 		await new Promise(r => setTimeout(r, 1000));
// 		expect(events[0].payload.data.state).toEqual(state2Name);
// 	});
// });

// describe('State machine guard tests...', () => {
// 	beforeEach(() => {
// 		events = [];
// 		stateOneTransitions = [
// 			{
// 				event: 'event1',
// 				nextState: state2Name,
// 				guards: [
// 					(_ctx, evt) => {
// 						return evt.payload?.p1 == 'good';
// 					},
// 				],
// 			},
// 		];
// 		machine = dummyMachine({
// 			initialContext: { testSource },
// 			stateOneTransitions,
// 		});
// 		machine.hub.listen(machine!.hubChannel, data => {
// 			events.push(data);
// 		});
// 	});

// 	test('...the state transitions if guard passes', async () => {
// 		machine?.send<State1Payload>(goodEvent1);
// 		await new Promise(r => setTimeout(r, 1000));
// 		expect(events[0].payload.data.state).toEqual(state2Name);
// 	});

// 	test('...the state transitions does not transition if guard fails', async () => {
// 		machine?.send<State1Payload>(badEvent1);
// 		await new Promise(r => setTimeout(r, 1000));
// 		expect(events[0].payload.data.state).toEqual(state1Name);
// 	});
// });

// describe('State machine action tests...', () => {
// 	beforeEach(() => {
// 		const jestMock = jest.fn(() => {});
// 		events = [];
// 		stateOneTransitions = [
// 			{
// 				event: 'event1',
// 				nextState: state2Name,
// 				guards: [
// 					(_, evt) => {
// 						return evt.payload?.p1 == 'good';
// 					},
// 				],
// 				actions: [
// 					async (ctx, _) => {
// 						ctx.testFn ? ctx.testFn() : noop;
// 					},
// 				],
// 			},
// 		];
// 		machine = dummyMachine({
// 			initialContext: { testSource, testFn: jestMock },
// 			stateOneTransitions,
// 		});
// 		machine.hub.listen(machine!.hubChannel, data => {
// 			events.push(data);
// 		});
// 	});

// 	test('...the actions do not fire before transition', () => {
// 		expect(machine?.context.testFn).toHaveBeenCalledTimes(0);
// 	});

// 	test('...the actions fire after transition', async () => {
// 		machine?.send<State1Payload>(goodEvent1);
// 		await new Promise(r => setTimeout(r, 1000));
// 		expect(machine?.context.testFn).toHaveBeenCalledTimes(1);
// 	});

// 	test('...the actions do not fire if guard fails', () => {
// 		machine?.send<State1Payload>(badEvent1);
// 		expect(machine?.context.testFn).toHaveBeenCalledTimes(0);
// 	});
// });

// describe('State machine reducer tests...', () => {
// 	beforeEach(() => {
// 		const jestMock = jest.fn(() => {});
// 		events = [];
// 		stateOneTransitions = [
// 			{
// 				event: 'event1',
// 				nextState: state2Name,
// 				guards: [
// 					(_, evt) => {
// 						return evt.payload?.p1 == 'good';
// 					},
// 				],
// 				reducers: [
// 					(ctx, evt) => {
// 						ctx.optional1 = evt.payload?.p1;
// 						return ctx;
// 					},
// 				],
// 			},
// 		];
// 		machine = dummyMachine({
// 			initialContext: { testSource, testFn: jestMock },
// 			stateOneTransitions,
// 		});
// 		machine.hub.listen(machine!.hubChannel, data => {
// 			events.push(data);
// 		});
// 	});

// 	test('...the reducer is not invoked before transition ', () => {
// 		expect(machine?.context.optional1).toBeFalsy();
// 	});

// 	test('...the reducers fire after transition', async () => {
// 		machine?.send<State1Payload>(goodEvent1);
// 		await new Promise(r => setTimeout(r, 1000));
// 		expect(machine?.context.optional1).toEqual('good');
// 	});

// 	test('...the reducers do not fire if guard fails', async () => {
// 		machine?.send<State1Payload>(badEvent1);
// 		await new Promise(r => setTimeout(r, 1000));
// 		expect(machine?.context.optional1).toBeFalsy();
// 	});
// });

describe('State Machine queueing tests...', () => {
	beforeEach(() => {
		events = [];
		stateTwoInvocation = new Invocation<DummyContext, State1Payload>({
			invokedPromise: async () => {
				await new Promise(r => setTimeout(r, timeoutMS));
				console.log('done...');
			},
		});
		stateOneTransitions = [
			{
				event: 'event1',
				nextState: state2Name,
			},
		];
		stateTwoTransitions = [
			{
				event: 'event2',
				nextState: state3Name,
			},
		];
		machine = dummyMachine({
			initialContext: { testSource },
			stateOneTransitions,
			stateTwoTransitions,
			stateTwoInvocation,
		});
		machine.hub.listen(machine!.hubChannel, data => {
			events.push(data);
		});
	});

	test('...the machine waits for first event to process, including when there are async tasks running', async () => {
		machine?.send<State1Payload>(goodEvent1);
		machine?.send<State2Payload>(goodEvent2);

		// invocation will block for value of timeoutMS
		// thus we check that transition has not happened yet.
		expect(machine?.current.name).toEqual(state2Name);

		// wait again to make sure the timeout has elapsed before checking state again
		await new Promise(r => setTimeout(r, timeoutMS + timeoutMS));
		expect(machine?.current.name).toEqual(state3Name);
	});
});
