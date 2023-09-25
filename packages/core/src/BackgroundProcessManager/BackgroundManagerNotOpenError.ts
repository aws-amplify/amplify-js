// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export class BackgroundManagerNotOpenError extends Error {
	constructor(message: string) {
		super(`BackgroundManagerNotOpenError: ${message}`);
	}
}
