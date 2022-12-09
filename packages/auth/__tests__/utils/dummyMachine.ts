// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Machine } from '../../src/stateMachine/machine';
import {
	EventBroker,
	MachineEvent,
	StateTransitions,
} from '../../src/stateMachine/types';

export type StateNames = 'State1' | 'State2' | 'State3';

export type Event1 = {
	name: 'event1';
	payload: {
		p1: 'good' | 'bad';
	};
};

export type Event2 = {
	name: 'event2';
	payload: {
		p2: 'good' | 'bad';
	};
};

export type Events = Event1 | Event2;

export type DummyContext = {
	testSource: string;
	testFn?: jest.Mock<any, any>;
	optional1?: string;
	optional2?: string;
};

export function dummyMachine(params: {
	initialContext: DummyContext;
	stateOneTransitions?: StateTransitions<DummyContext, Events, StateNames>;
	stateTwoTransitions?: StateTransitions<DummyContext, Events, StateNames>;
	stateThreeTransitions?: StateTransitions<DummyContext, Events, StateNames>;
	machineManager?: EventBroker<MachineEvent>;
}) {
	return new Machine<DummyContext, Events, StateNames>({
		name: 'DummyMachine',
		context: params.initialContext,
		initial: 'State1',
		machineManager: params.machineManager ?? { dispatch: () => {} },
		states: {
			State1: params.stateOneTransitions ?? {},
			State2: params.stateTwoTransitions ?? {},
			State3: params.stateThreeTransitions ?? {},
		},
	});
}
