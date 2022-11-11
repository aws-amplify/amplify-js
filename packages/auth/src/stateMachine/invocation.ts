// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Machine } from './machine';
import { MachineContext, MachineEventPayload, MachineEvent } from './types';

export class Invocation<
	ContextType extends MachineContext,
	PayloadType extends MachineEventPayload
> {
	event: MachineEvent<PayloadType>;
	machine: Machine<ContextType>;
	constructor(event: MachineEvent<PayloadType>, machine: Machine<ContextType>) {
		this.event = event;
		this.machine = machine;
	}
}
