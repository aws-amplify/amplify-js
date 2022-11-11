import { Machine } from '../../src/stateMachine/machine';
import {
	MachineEvent,
	MachineContext,
	MachineEventPayload,
} from '../../src/stateMachine/types';

export const state1Name = 'State1';
export const state2Name = 'State2';
export const state3Name = 'State3';

export const goodEvent1: MachineEvent<DummyContext, State1Payload> = {
	name: 'event1',
	payload: {
		p1: 'good',
	},
	restingStates: [state2Name],
};

export const badEvent1: MachineEvent<DummyContext, State1Payload> = {
	name: 'event1',
	payload: {
		p1: 'bad',
	},
	restingStates: [state2Name],
};

export const goodEvent2: MachineEvent<DummyContext, State2Payload> = {
	name: 'event2',
	payload: {
		p2: 'good',
	},
	restingStates: [state3Name],
};

export const badEvent2: MachineEvent<DummyContext, State2Payload> = {
	name: 'event2',
	payload: {
		p2: 'bad',
	},
	restingStates: [state3Name],
};

export type DummyContext = MachineContext & {
	testSource: string;
	testFn?: jest.Mock<any, any>;
	optional1?: string;
	optional2?: string;
	actor?: Machine<DummyContext>;
};

export type State1Payload = MachineEventPayload & {
	p1?: string;
};

export type State2Payload = MachineEventPayload & {
	p2?: string;
};

export type State3Payload = MachineEventPayload & {
	p3?: string;
};
