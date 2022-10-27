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

import { MachineContext } from './types/MachineContext';
import { MachineEvent } from './types/MachineEvent';
import { MachineEventPayload } from './types/MachineEventPayload';
import { StateMachine } from './StateMachine';

export class Invocation<
	ContextType extends MachineContext,
	PayloadType extends MachineEventPayload
> {
	event: MachineEvent<PayloadType>;
	machine: StateMachine<ContextType>;
	constructor(
		event: MachineEvent<PayloadType>,
		machine: StateMachine<ContextType>
	) {
		this.event = event;
		this.machine = machine;
	}
}
