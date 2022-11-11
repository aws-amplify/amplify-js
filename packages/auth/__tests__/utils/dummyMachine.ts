// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Invocation } from '../../src/stateMachine/invocation';
import { Machine } from '../../src/stateMachine/machine';
import { MachineState } from '../../src/stateMachine/machineState';
import { StateTransition } from '../../src/stateMachine/types';
import {
	DummyContext,
	State1Payload,
	State2Payload,
	State3Payload,
	state1Name,
	state2Name,
	state3Name,
} from './dummyEventsAndTypes';

export function dummyMachine(params: {
	initialContext: DummyContext;
	stateOneTransitions?: StateTransition<DummyContext, State1Payload>[];
	stateOneInvocation?: Invocation<DummyContext, State1Payload>;
	stateTwoTransitions?: StateTransition<DummyContext, State2Payload>[];
	stateTwoInvocation?: Invocation<DummyContext, State2Payload>;
	stateThreeTransitions?: StateTransition<DummyContext, State3Payload>[];
	stateThreeInvocation?: Invocation<DummyContext, State3Payload>;
}): Machine<DummyContext> {
	return new Machine<DummyContext>({
		name: 'DummyMachine',
		context: params.initialContext,
		initial: state1Name,
		states: [
			new MachineState<DummyContext, State1Payload>({
				name: state1Name,
				transitions: params.stateOneTransitions,
				invocation: params.stateOneInvocation,
			}),
			new MachineState<DummyContext, State2Payload>({
				name: state2Name,
				transitions: params.stateTwoTransitions,
				invocation: params.stateTwoInvocation,
			}),
			new MachineState<DummyContext, State2Payload>({
				name: state3Name,
				transitions: params.stateThreeTransitions,
				invocation: params.stateThreeInvocation,
			}),
		],
	});
}
