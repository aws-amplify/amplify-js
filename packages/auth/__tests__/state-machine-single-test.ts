// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { noop } from 'lodash';
import { Machine } from '../src/stateMachine/machine';
import { StateTransition } from '../src/stateMachine/types';
import {
	dummyMachine,
	DummyContext,
	Event1,
	Event2,
	Events,
	StateNames,
} from './utils/dummyMachine';

let machine: Machine<DummyContext, Events, StateNames>;
const testSource = 'state-machine-single-tests';
const goodEvent1: Event1 = { type: 'event1', payload: { p1: 'good' } };
const badEvent1: Event1 = { type: 'event1', payload: { p1: 'bad' } };

describe('State machine instantiation tests', () => {
	beforeEach(() => {
		machine = dummyMachine({
			initialContext: { testSource },
			stateOneTransitions: {
				event1: [
					{
						nextState: 'State2',
					},
				],
			},
		});
	});

	test('the SM can be instantiated', () => {
		expect(machine).toBeTruthy();
	});

	test("the SM's initial context is set", async () => {
		const currentStateAndContext = machine.getCurrentState();
		expect(currentStateAndContext.context.testSource).toEqual(testSource);
	});

	test("the SM's initial state is set", async () => {
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext?.currentState).toEqual('State1');
	});

	test('the SM performs a simple state transition', async () => {
		await machine?.accept(goodEvent1);
		expect(machine?.getCurrentState()?.currentState).toEqual('State2');
	});
});

describe('State machine guard', () => {
	beforeEach(() => {
		machine = dummyMachine({
			initialContext: { testSource },
			stateOneTransitions: {
				event1: [
					{
						nextState: 'State2',
						guards: [(ctxt, event1) => event1.payload.p1 !== 'bad'],
					},
				],
			},
		});
	});

	test('the state transitions if guard passes', async () => {
		await machine?.accept(goodEvent1);
		expect(machine?.getCurrentState().currentState).toEqual('State2');
	});

	test('the state transitions does not transition if guard fails', async () => {
		await machine?.accept({ type: 'event1', payload: { p1: 'bad' } });
		expect(machine?.getCurrentState().currentState).toEqual('State1');
	});
});

describe('State machine action', () => {
	const mockDispatch = jest.fn();
	const goodEvent2: Event2 = {
		type: 'event2',
		payload: { p2: 'good' },
	};

	beforeEach(() => {
		const jestMock = jest.fn();
		machine = dummyMachine({
			initialContext: { testSource, testFn: jestMock },
			stateOneTransitions: {
				event1: [
					{
						nextState: 'State2',
						guards: [(ctx, event1) => event1.payload.p1 !== 'bad'],
						actions: [
							async (ctx, even1, broker) => {
								ctx?.testFn ? ctx.testFn() : noop;
								broker.dispatch(goodEvent2);
							},
						],
					},
				],
				event2: [
					{
						nextState: 'State2',
						actions: [
							async (ctx, event1, broker) => {
								broker.dispatch({
									...goodEvent2,
									toMachine: 'SomeOtherMachine',
								});
							},
						],
					},
				],
			},
		});
		machine.addListener({ dispatch: mockDispatch });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('the actions do not fire before transition', async () => {
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.context.testFn).toHaveBeenCalledTimes(0);
	});

	test('the actions fire after transition', async () => {
		await machine?.accept(goodEvent1);
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.context.testFn).toHaveBeenCalledTimes(1);
	});

	test('the actions do not fire if guard fails', async () => {
		await machine?.accept(badEvent1);
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.context.testFn).toHaveBeenCalledTimes(0);
	});

	test('the actions can dispatch new event to event broker', async () => {
		await machine?.accept(goodEvent1);
		expect(mockDispatch).toBeCalledTimes(1);
		expect(mockDispatch).toBeCalledWith({
			...goodEvent2,
			toMachine: 'DummyMachine',
		});
	});

	test('the actions can dispatch new event with different machine name', async () => {
		await machine?.accept(goodEvent2);
		expect(mockDispatch).toBeCalledTimes(1);
		expect(mockDispatch).toBeCalledWith({
			...goodEvent2,
			toMachine: 'SomeOtherMachine',
		});
	});
});

describe('State machine reducer', () => {
	const mockDispatch = jest.fn();

	beforeEach(() => {
		const jestMock = jest.fn(() => {});
		machine = dummyMachine({
			initialContext: { testSource, testFn: jestMock },
			stateOneTransitions: {
				event1: [
					{
						nextState: 'State2',
						guards: [(ctx, event1) => event1.payload.p1 !== 'bad'],
						reducers: [
							(ctx, even1) => {
								ctx.optional1 = even1.payload.p1;
								return ctx;
							},
						],
					},
				],
			},
			stateTwoTransitions: {
				event1: [
					{
						nextState: 'State2',
						actions: [
							async (ctx, event1, broker) => {
								broker.dispatch({
									type: 'CurrentContext',
									payload: {
										context: ctx,
									},
								});
							},
						],
					},
				],
			},
		});

		machine.addListener({ dispatch: mockDispatch });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('the reducer is not invoked before transition ', async () => {
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.context.optional1).toBeFalsy();
	});

	test('the reducers fire after transition', async () => {
		await machine?.accept(goodEvent1);
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.context.optional1).toEqual('good');
	});

	test('the reducers do not fire if guard fails', async () => {
		await machine?.accept(badEvent1);
		const currentStateAndContext = await machine?.getCurrentState();
		expect(currentStateAndContext.context.optional1).toBeFalsy();
	});

	test("the reducers's update shared across the states", async () => {
		await machine?.accept(goodEvent1);
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.currentState).toEqual('State2');
		await machine?.accept(goodEvent1);
		expect(mockDispatch).toBeCalledTimes(1);
		expect(mockDispatch).toBeCalledWith(
			expect.objectContaining({
				type: 'CurrentContext',
				payload: {
					context: expect.objectContaining({ optional1: 'good' }),
				},
			})
		);
	});
});

describe('State machine transition', () => {
	const mockDispatch = jest.fn();
	const goodEvent2: Event2 = {
		type: 'event2',
		payload: { p2: 'good' },
	};

	const getDummyMachine = (
		event1Transition: Omit<
			StateTransition<DummyContext, Event1, StateNames>,
			'nextState'
		>
	) => {
		const machine = dummyMachine({
			initialContext: { testSource, testFn: jest.fn() },
			stateOneTransitions: {
				event1: [
					{
						...event1Transition,
						nextState: 'State2',
					},
				],
			},
		});
		machine.addListener({ dispatch: mockDispatch });
		return machine;
	};

	beforeEach(() => {});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('triggers actions after reducers', async () => {
		const mockAction = jest.fn();
		const machine = getDummyMachine({
			reducers: [
				ctxt => {
					ctxt.optional1 = 'reducer';
					return ctxt;
				},
			],
			actions: [mockAction],
		});
		await machine?.accept(goodEvent1);
		expect(machine?.getCurrentState()?.currentState).toEqual('State2');
		expect(machine?.getCurrentState()?.context).toEqual(
			expect.objectContaining({ optional1: 'reducer' })
		);
		expect(mockAction).toBeCalledWith(
			expect.objectContaining({ optional1: 'reducer' }),
			goodEvent1,
			expect.anything()
		);
	});

	test('transfers state after actions', async () => {
		const machineStateRecorder = jest.fn();
		const mockAction = jest.fn().mockImplementation(() => {
			machineStateRecorder(machine?.getCurrentState().currentState);
		});
		const machine = getDummyMachine({
			actions: [mockAction],
		});
		await machine?.accept(goodEvent1);
		// Machine still in State1 when action is called.
		expect(machineStateRecorder).toBeCalledWith('State1');
		// Machine in State2 after transition is completed.
		expect(machine?.getCurrentState()?.currentState).toEqual('State2');
	});

	test('wait for actions after state transition', async () => {
		const machineStateRecorder = jest.fn();
		// Mock action that waits for 100ms before completing. When it's triggered,
		// the machine is still in State1. When it's completed, the machine is in
		// State2, and waiting for the action to complete.
		const mockAction = jest.fn().mockImplementation(async () => {
			machineStateRecorder(machine?.getCurrentState().currentState);
			await new Promise(resolve => setTimeout(resolve, 100));
			machineStateRecorder(machine?.getCurrentState().currentState);
		});
		const machine = getDummyMachine({
			actions: [mockAction],
		});
		await machine?.accept(goodEvent1);
		expect(machineStateRecorder).nthCalledWith(1, 'State1');
		expect(machineStateRecorder).nthCalledWith(2, 'State2');
		expect(machine?.getCurrentState()?.currentState).toEqual('State2');
	});
});
