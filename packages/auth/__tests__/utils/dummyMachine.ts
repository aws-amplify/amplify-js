import { Invocation } from '../../src/stateMachine/invocation';
import { Machine } from '../../src/stateMachine/machine';
import { MachineState } from '../../src/stateMachine/machineState';
import {
	MachineContext,
	MachineEventPayload,
	StateTransition,
} from '../../src/stateMachine/types';

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

const state1Name = 'State1';
const state2Name = 'State2';

function dummyMachine(
	initialContext: DummyContext,
	stateOneTransitions?: StateTransition<DummyContext, State1Payload>[],
	stateOneInvocation?: Invocation<DummyContext, State1Payload>,
	stateTwoTransitions?: StateTransition<DummyContext, State1Payload>[],
	stateTwoInvocation?: Invocation<DummyContext, State1Payload>
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

export {
	DummyContext,
	State1Payload,
	State2Payload,
	dummyMachine,
	state1Name,
	state2Name,
	goodEvent,
	badEvent,
};
