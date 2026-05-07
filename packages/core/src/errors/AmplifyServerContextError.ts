// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyError } from './AmplifyError';

/**
 * Error thrown when an Amplify server context operation fails.
 * @deprecated Prefer AmplifyError for new code.
 */
export class AmplifyServerContextError extends AmplifyError {
	constructor(params: { message: string; recoverySuggestion?: string }) {
		super({
			name: 'AmplifyServerContextError',
			message: params.message,
			recoverySuggestion: params.recoverySuggestion,
		});
	}
}
