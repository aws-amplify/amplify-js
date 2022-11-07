// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Invocation } from '../../src/stateMachine/invocation';
import { Machine } from '../../src/stateMachine/machine';
import { MachineState } from '../../src/stateMachine/machineState';
import { QueuedMachine } from '../../src/stateMachine/queuedMachine';
import {
	MachineContext,
	MachineEventPayload,
	StateTransition,
} from '../../src/stateMachine/types';

const goodEvent1 = {
	name: 'event1',
	payload: {
		p1: 'good',
	},
};

const badEvent1 = {
	name: 'event1',
	payload: {
		p1: 'bad',
	},
};

const goodEvent2 = {
	name: 'event2',
	payload: {
		p1: 'good',
	},
};

const badEvent2 = {
	name: 'event2',
	payload: {
		p1: 'bad',
	},
};

type DummyContext = MachineContext & {
	testSource: string;
	testFn?: jest.Mock<any, any>;
	optional1?: string;
	optional2?: string;
	actor?: Machine<DummyContext>;
};

type State1Payload = MachineEventPayload & {
	p1?: string;
};

type State2Payload = MachineEventPayload & {
	p2?: string;
};

type State3Payload = MachineEventPayload & {
	p2?: string;
};

const state1Name = 'State1';
const state2Name = 'State2';
const state3Name = 'State3';

function dummyMachine(
	initialContext: DummyContext,
	stateOneTransitions?: StateTransition<DummyContext, State1Payload>[],
	stateOneInvocation?: Invocation<DummyContext, State1Payload>,
	stateTwoTransitions?: StateTransition<DummyContext, State2Payload>[],
	stateTwoInvocation?: Invocation<DummyContext, State2Payload>
): Machine<DummyContext> {
	return new Machine<DummyContext>({
		name: 'DummyMachine',
		context: initialContext,
		initial: state1Name,
		states: [
			new MachineState<DummyContext, State1Payload>({
				name: state1Name,
				transitions: stateOneTransitions,
				invocation: stateOneInvocation,
			}),
			new MachineState<DummyContext, State2Payload>({
				name: state2Name,
				transitions: stateTwoTransitions,
				invocation: stateTwoInvocation,
			}),
		],
	});
}

function dummyMachineQueued(
	initialContext: DummyContext,
	stateOneTransitions?: StateTransition<DummyContext, State1Payload>[],
	stateOneInvocation?: Invocation<DummyContext, State1Payload>,
	stateTwoTransitions?: StateTransition<DummyContext, State1Payload>[],
	stateTwoInvocation?: Invocation<DummyContext, State1Payload>,
	stateThreeTransitions?: StateTransition<DummyContext, State3Payload>[],
	stateThreeInvocation?: Invocation<DummyContext, State3Payload>
): QueuedMachine<DummyContext> {
	return new QueuedMachine<DummyContext>({
		name: 'DummyMachineQueued',
		context: initialContext,
		initial: state1Name,
		states: [
			new MachineState<DummyContext, State1Payload>({
				name: state1Name,
				transitions: stateOneTransitions,
				invocation: stateOneInvocation,
			}),
			new MachineState<DummyContext, State2Payload>({
				name: state2Name,
				transitions: stateTwoTransitions,
				invocation: stateTwoInvocation,
			}),
			new MachineState<DummyContext, State2Payload>({
				name: state3Name,
				transitions: stateThreeTransitions,
				invocation: stateThreeInvocation,
			}),
		],
	});
}

export {
	DummyContext,
	State1Payload,
	State2Payload,
	dummyMachine,
	dummyMachineQueued,
	state1Name,
	state2Name,
	state3Name,
	goodEvent1,
	badEvent1,
};
