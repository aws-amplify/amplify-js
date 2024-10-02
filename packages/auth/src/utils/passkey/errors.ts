// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyError,
	AmplifyErrorMap,
	AmplifyErrorParams,
	AssertionFunction,
	createAssertionFunction,
} from '@aws-amplify/core/internals/utils';

export class PasskeyError extends AmplifyError {
	constructor(params: AmplifyErrorParams) {
		super(params);

		// Hack for making the custom error class work when transpiled to es5
		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = PasskeyError;
		Object.setPrototypeOf(this, PasskeyError.prototype);
	}
}

export enum PasskeyErrorCode {
	InvalidCredentialCreationOptions = 'InvalidCredentialCreationOptions',
	PasskeyRegistrationFailed = 'PasskeyRegistrationFailed',
}

const passkeyErrorMap: AmplifyErrorMap<PasskeyErrorCode> = {
	[PasskeyErrorCode.InvalidCredentialCreationOptions]: {
		message: 'Invalid credential creation options',
		recoverySuggestion:
			'Ensure your user pool is configured to support WebAuthN passkey registration',
	},
	[PasskeyErrorCode.PasskeyRegistrationFailed]: {
		message: 'Platform failed to create credentials',
	},
};

export const assertPasskeyError: AssertionFunction<PasskeyErrorCode> =
	createAssertionFunction(passkeyErrorMap, PasskeyError);
