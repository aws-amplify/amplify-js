// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Invocation } from './invocation';
import {
	MachineContext,
	MachineEvent,
	MachineEventPayload,
	MachineStateParams,
	StateTransition,
} from './types';

export class MachineState<
	ContextType extends MachineContext,
	PayloadType extends MachineEventPayload
> {
	name: string;
	transitions?: StateTransition<ContextType, PayloadType>[];
	invocation?: Invocation<MachineContext, MachineEventPayload>;
	constructor(params: MachineStateParams<ContextType, PayloadType>) {
		this.name = params.name;
		//TODO: validate transitions with uniqueness on event
		this.transitions = params.transitions;
		this.invocation = params.invocation;
	}

	findTransition(
		event: MachineEvent<PayloadType>
	): StateTransition<ContextType, PayloadType> | undefined {
		return this.transitions?.find(t => t.event === event.name);
	}
}
