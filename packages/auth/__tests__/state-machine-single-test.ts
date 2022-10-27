/*
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *	 http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { noop } from 'lodash';
import { Machine } from '../src/stateMachine/machine';
import { StateTransition } from '../src/stateMachine/types';
import {
	badEvent,
	DummyContext,
	dummyMachine,
	goodEvent,
	state1Name,
	State1Payload,
	state2Name,
} from './utils/dummyMachine';

let machine: Machine<DummyContext> | null;
let stateOneTransitions: StateTransition<DummyContext, State1Payload>[];
const testSource = 'state-machine-single-tests';

describe('State machine instantiation tests...', () => {
	beforeAll(() => {
		stateOneTransitions = [
			{
				event: 'event1',
				nextState: state2Name,
			},
		];
		machine = dummyMachine({ testSource }, stateOneTransitions);
	});

	test('...the SM can be instantiated', () => {
		expect(machine).toBeTruthy();
		expect(machine?.initial).toEqual(machine?.current);
	});

	test('...the SM state map has been created', () => {
		const expectedState1 = machine?.states.get(state1Name);
		const expectedState2 = machine?.states.get(state2Name);
		expect(machine?.states.size).toEqual(2);
		expect(expectedState1).toBeDefined();
		expect(expectedState2).toBeDefined();
	});

	test("...the SM's initial context is set", () => {
		expect(machine?.context.testSource).toEqual(testSource);
	});

	test("...the SM's initial state is set", () => {
		expect(machine?.initial?.name).toEqual(state1Name);
	});

	test('...the SM performs a simple state transition', () => {
		machine?.send<State1Payload>(goodEvent);
		expect(machine?.current?.name).toEqual(state2Name);
	});
});

describe('State machine guard tests...', () => {
	beforeEach(() => {
		stateOneTransitions = [
			{
				event: 'event1',
				nextState: state2Name,
				guards: [
					(ctx, evt) => {
						return evt.payload?.p1 == 'good';
					},
				],
			},
		];
		machine = dummyMachine({ testSource }, stateOneTransitions);
	});

	test('...the state transitions if guard passes', () => {
		machine?.send<State1Payload>(goodEvent);
		expect(machine?.current?.name).toEqual(state2Name);
	});

	test('...the state transitions does not transition if guard fails', () => {
		machine?.send<State1Payload>(badEvent);
		expect(machine?.current?.name).toEqual(state1Name);
	});
});

describe('State machine action tests...', () => {
	beforeEach(() => {
		const jestMock = jest.fn(() => {});
		stateOneTransitions = [
			{
				event: 'event1',
				nextState: state2Name,
				guards: [
					(_, evt) => {
						return evt.payload?.p1 == 'good';
					},
				],
				actions: [
					async (ctx, _) => {
						ctx.testFn ? ctx.testFn() : noop;
					},
				],
			},
		];
		machine = dummyMachine(
			{ testSource, testFn: jestMock },
			stateOneTransitions
		);
	});

	test('...the actions do not fire before transition', () => {
		expect(machine?.context.testFn).toHaveBeenCalledTimes(0);
	});

	test('...the actions fire after transition', () => {
		machine?.send<State1Payload>(goodEvent);
		expect(machine?.context.testFn).toHaveBeenCalledTimes(1);
	});

	test('...the actions do not fire if guard fails', () => {
		machine?.send<State1Payload>(badEvent);
		expect(machine?.context.testFn).toHaveBeenCalledTimes(0);
	});
});

describe('State machine reducer tests...', () => {
	beforeEach(() => {
		const jestMock = jest.fn(() => {});
		stateOneTransitions = [
			{
				event: 'event1',
				nextState: state2Name,
				guards: [
					(_, evt) => {
						return evt.payload?.p1 == 'good';
					},
				],
				reducers: [
					(ctx, evt) => {
						ctx.optional1 = evt.payload?.p1;
					},
				],
			},
		];
		machine = dummyMachine(
			{ testSource, testFn: jestMock },
			stateOneTransitions
		);
	});

	test('...the reducer is not invoked before transition ', () => {
		expect(machine?.context.optional1).toBeFalsy();
	});

	test('...the reducers fire after transition', () => {
		machine?.send<State1Payload>(goodEvent);
		expect(machine?.context.optional1).toEqual('good');
	});

	test('...the reducers do not fire if guard fails', () => {
		machine?.send<State1Payload>(badEvent);
		expect(machine?.context.optional1).toBeFalsy();
	});
});
