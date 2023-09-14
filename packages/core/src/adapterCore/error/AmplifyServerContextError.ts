// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyError } from '../../errors';

export class AmplifyServerContextError extends AmplifyError {
	constructor({
		message,
		recoverySuggestion,
		underlyingError,
	}: {
		message: string;
		recoverySuggestion?: string;
		underlyingError?: Error;
	}) {
		super({
			name: 'AmplifyServerContextError',
			message,
			recoverySuggestion,
			underlyingError,
		});
	}
}
