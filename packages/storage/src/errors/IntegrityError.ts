// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AmplifyErrorCode,
	AmplifyErrorParams,
} from '@aws-amplify/core/internals/utils';

import { StorageError } from './StorageError';

export class IntegrityError extends StorageError {
	constructor(params?: Pick<AmplifyErrorParams, 'metadata'>) {
		super({
			name: AmplifyErrorCode.Unknown,
			message: 'An unknown error has occurred.',
			recoverySuggestion:
				'This may be a bug. Please reach out to library authors.',
			metadata: params?.metadata,
		});

		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = IntegrityError;
		Object.setPrototypeOf(this, IntegrityError.prototype);
	}
}
