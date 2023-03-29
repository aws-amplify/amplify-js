// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyError } from '@aws-amplify/core/src/Errors';
import { ErrorParams } from '@aws-amplify/core/src/types/types';

export class AuthError extends AmplifyError {
	constructor(params: ErrorParams) {
		super(params);
	}
}
