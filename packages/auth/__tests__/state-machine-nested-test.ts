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
	DummyContext,
	dummyMachine,
	state1Name,
	State1Payload,
	state2Name,
} from './utils/dummyMachine';

const goodEvent = {
	name: 'event1',
	payload: {
		p1: 'good',
	},
};

const badEvent = {
	name: 'event1',
	payload: {
		p1: 'bad',
	},
};

let parentMachine: Machine<DummyContext> | null;
let parentStateOneTransitions: StateTransition<DummyContext, State1Payload>[];
const parentTestSource = 'state-machine-nested-tests-parent';

let childMachine: Machine<DummyContext> | null;
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
						ctx.actor?.send<State1Payload>(goodEvent);
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
		expect(parentMachine?.context.actor?.initial).toEqual(
			parentMachine?.context.actor?.current
		);
	});

	test('...parent can send an event to the child', () => {
		parentMachine?.send<State1Payload>(goodEvent);
		expect(parentMachine?.context.actor?.current.name).toEqual(state2Name);
	});
});

/// TODO: Invocation Tests
