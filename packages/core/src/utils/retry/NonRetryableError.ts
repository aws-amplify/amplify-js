// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export class NonRetryableError extends Error {
	public readonly nonRetryable = true;
	constructor(message: string) {
		super(message);
	}
}
