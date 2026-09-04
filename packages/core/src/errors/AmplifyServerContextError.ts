// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyError } from './AmplifyError';

/**
 * @deprecated The legacy server-context machinery has been removed in favor of
 * the singleton-free {@link AmplifyContext} model. This error type is retained
 * only for backwards compatibility of existing `catch`/re-export paths and will
 * be removed in a future major version.
 */
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
