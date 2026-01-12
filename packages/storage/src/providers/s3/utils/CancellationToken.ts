// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Internal class to manage cancellation state for storage operations
 */
export class CancellationToken {
	private _isCancelled = false;

	cancel(): void {
		this._isCancelled = true;
	}

	isCancelled(): boolean {
		return this._isCancelled;
	}
}
