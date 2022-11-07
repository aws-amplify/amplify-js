// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Machine } from '../src/stateMachine/machine';
import { StateTransition } from '../src/stateMachine/types';
import {
	DummyContext,
	dummyMachine,
	goodEvent1,
	state1Name,
	State1Payload,
	state2Name,
} from './utils/dummyMachine';

let parentMachine: Machine<DummyContext>;
let parentStateOneTransitions: StateTransition<DummyContext, State1Payload>[];
const parentTestSource = 'state-machine-nested-tests-parent';

let childMachine: Machine<DummyContext>;
let childStateOneTransitions: StateTransition<DummyContext, State1Payload>[];
const childTestSource = 'state-machine-parent-tests-child';

describe('Nested state machine persisted actor tests...', () => {
	beforeAll(() => {
		parentStateOneTransitions = [
			{
				event: 'event1',
				nextState: state2Name,
				actions: [
					async (ctx, _) => {
						ctx.actor?.send<State1Payload>(goodEvent1);
					},
				],
			},
		];
		childStateOneTransitions = [
			{
				event: 'event1',
				nextState: state2Name,
			},
		];
		childMachine = dummyMachine(
			{
				testSource: childTestSource,
			},
			childStateOneTransitions
		);
		parentMachine = dummyMachine(
			{
				testSource: parentTestSource,
				actor: childMachine,
			},
			parentStateOneTransitions
		);
	});

	test('...the child SM can be instantiated on a parent machine context', () => {
		expect(parentMachine?.context.actor).toBeTruthy();
		expect(parentMachine?.context.actor?.current).toBeTruthy();
	});

	test('...parent can send an event to the child', () => {
		parentMachine?.send<State1Payload>(goodEvent1);
		expect(parentMachine?.context.actor?.current.name).toEqual(state2Name);
	});
});

/// TODO: Invocation Tests
