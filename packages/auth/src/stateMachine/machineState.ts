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
