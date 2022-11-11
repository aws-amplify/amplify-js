// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { MachineContext } from './types';

export class Completer<ContextType extends MachineContext> {
	public readonly promise: Promise<ContextType>;
	public complete: (value: PromiseLike<ContextType> | ContextType) => void;

	public constructor() {
		this.promise = new Promise<ContextType>(resolve => {
			this.complete = resolve;
		});
	}
}
