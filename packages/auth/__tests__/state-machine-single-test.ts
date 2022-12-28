// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { noop } from 'lodash';
import { Machine } from '../src/stateMachine/machine';
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
const goodEvent1: Event1 = { name: 'event1', payload: { p1: 'good' } };
const badEvent1: Event1 = { name: 'event1', payload: { p1: 'bad' } };

describe('State machine instantiation tests...', () => {
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

	test('...the SM can be instantiated', () => {
		expect(machine).toBeTruthy();
	});

	test("...the SM's initial context is set", async () => {
		const currentStateAndContext = machine.getCurrentState();
		expect(currentStateAndContext.context.testSource).toEqual(testSource);
	});

	test("...the SM's initial state is set", async () => {
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext?.currentState).toEqual('State1');
	});

	test('...the SM performs a simple state transition', async () => {
		await machine?.accept(goodEvent1);
		expect(machine?.getCurrentState()?.currentState).toEqual('State2');
	});
});

describe('State machine guard tests...', () => {
	beforeEach(() => {
		machine = dummyMachine({
			initialContext: { testSource },
			stateOneTransitions: {
				event1: [
					{
						nextState: 'State2',
						guards: [(ctxt, event1) => event1.payload.p1 == 'bad'],
					},
				],
			},
		});
	});

	test('...the state transitions if guard passes', async () => {
		await machine?.accept(goodEvent1);
		expect(machine?.getCurrentState().currentState).toEqual('State2');
	});

	test('...the state transitions does not transition if guard fails', async () => {
		await machine?.accept({ name: 'event1', payload: { p1: 'bad' } });
		expect(machine?.getCurrentState().currentState).toEqual('State1');
	});
});

describe('State machine effect tests...', () => {
	const mockDispatch = jest.fn();
	const goodEvent2: Event2 = {
		name: 'event2',
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
						guards: [(ctx, event1) => event1.payload.p1 == 'bad'],
						effects: [
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
						effects: [
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

	test('...the effects do not fire before transition', async () => {
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.context.testFn).toHaveBeenCalledTimes(0);
	});

	test('...the effects fire after transition', async () => {
		await machine?.accept(goodEvent1);
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.context.testFn).toHaveBeenCalledTimes(1);
	});

	test('...the effects do not fire if guard fails', async () => {
		await machine?.accept(badEvent1);
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.context.testFn).toHaveBeenCalledTimes(0);
	});

	test('...the effects can dispath new event to event broker', async () => {
		await machine?.accept(goodEvent1);
		expect(mockDispatch).toBeCalledTimes(1);
		expect(mockDispatch).toBeCalledWith({
			...goodEvent2,
			toMachine: 'DummyMachine',
		});
	});

	test('...the effects can dispath new event with different machine name', async () => {
		await machine?.accept(goodEvent2);
		expect(mockDispatch).toBeCalledTimes(1);
		expect(mockDispatch).toBeCalledWith({
			...goodEvent2,
			toMachine: 'SomeOtherMachine',
		});
	});
});

describe('State machine reducer tests...', () => {
	const mockDispatch = jest.fn();

	beforeEach(() => {
		const jestMock = jest.fn(() => {});
		machine = dummyMachine({
			initialContext: { testSource, testFn: jestMock },
			stateOneTransitions: {
				event1: [
					{
						nextState: 'State2',
						guards: [(ctx, event1) => event1.payload.p1 == 'bad'],
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
						effects: [
							async (ctx, event1, broker) => {
								broker.dispatch({
									name: 'CurrentContext',
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

	test('...the reducer is not invoked before transition ', async () => {
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.context.optional1).toBeFalsy();
	});

	test('...the reducers fire after transition', async () => {
		await machine?.accept(goodEvent1);
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.context.optional1).toEqual('good');
	});

	test('...the reducers do not fire if guard fails', async () => {
		await machine?.accept(badEvent1);
		const currentStateAndContext = await machine?.getCurrentState();
		expect(currentStateAndContext.context.optional1).toBeFalsy();
	});

	test("...the reducers's update shared across the states", async () => {
		await machine?.accept(goodEvent1);
		const currentStateAndContext = machine?.getCurrentState();
		expect(currentStateAndContext.currentState).toEqual('State2');
		await machine?.accept(goodEvent1);
		expect(mockDispatch).toBeCalledTimes(1);
		expect(mockDispatch).toBeCalledWith(
			expect.objectContaining({
				name: 'CurrentContext',
				payload: {
					context: expect.objectContaining({ optional1: 'good' }),
				},
			})
		);
	});
});
