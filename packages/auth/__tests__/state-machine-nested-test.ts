// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HubCapsule } from '@aws-amplify/core';
import { Machine } from '../src/stateMachine/machine';
import { StateTransition } from '../src/stateMachine/types';
import {
	DummyContext,
	State1Payload,
	state2Name,
	goodEvent1,
} from './utils/dummyEventsAndTypes';
import { dummyMachine } from './utils/dummyMachine';

let parentMachine: Machine<DummyContext>;
let parentStateOneTransitions: StateTransition<DummyContext, State1Payload>[];
const parentTestSource = 'state-machine-nested-tests-parent';

let childMachine: Machine<DummyContext>;
let childStateOneTransitions: StateTransition<DummyContext, State1Payload>[];
const childTestSource = 'state-machine-parent-tests-child';
let events: HubCapsule[] = [];

describe('Nested state machine persisted actor tests...', () => {
	beforeEach(() => {
		events = [];
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
		childMachine = dummyMachine({
			initialContext: {
				testSource: childTestSource,
			},
			stateOneTransitions: childStateOneTransitions,
		});
		parentMachine = dummyMachine({
			initialContext: {
				testSource: parentTestSource,
				actor: childMachine,
			},
			stateOneTransitions: parentStateOneTransitions,
		});
		parentMachine.hub.listen(parentMachine!.hubChannel, data => {
			events.push(data);
		});
	});

	test('...the child SM can be instantiated on a parent machine context', () => {
		expect(parentMachine?.context.actor).toBeTruthy();
		expect(parentMachine?.context.actor?.current).toBeTruthy();
	});

	test('...parent can send an event to the child', async () => {
		parentMachine?.send<State1Payload>(goodEvent1);
		await new Promise(r => setTimeout(r, 1000));
		expect(events[0].payload.data.state).toEqual(state2Name);
	});
});

/// TODO: Invocation Tests
