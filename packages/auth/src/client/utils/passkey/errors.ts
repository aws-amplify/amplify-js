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
	PasskeyNotSupported = 'PasskeyNotSupported',
	InvalidCredentialCreationOptions = 'InvalidCredentialCreationOptions',
	InvalidCredentialRequestOptions = 'InvalidCredentialRequestOptions',
	PasskeyRegistrationFailed = 'PasskeyRegistrationFailed',
	PasskeyRetrievalFailed = 'PasskeyRetrievalFailed',
}

const passkeyErrorMap: AmplifyErrorMap<PasskeyErrorCode> = {
	[PasskeyErrorCode.PasskeyNotSupported]: {
		message: 'Passkey not supported on this device.',
		recoverySuggestion:
			'Ensure your application is running in a secure context (HTTPS).',
	},
	[PasskeyErrorCode.InvalidCredentialCreationOptions]: {
		message: 'Invalid credential creation options.',
		recoverySuggestion:
			'Ensure your user pool is configured to support WebAuthN passkey registration',
	},
	[PasskeyErrorCode.InvalidCredentialRequestOptions]: {
		message: 'Invalid credential request options.',
		recoverySuggestion:
			'User pool may not be configured to support WEB_AUTHN authentication factor.',
	},
	[PasskeyErrorCode.PasskeyRegistrationFailed]: {
		message: 'Device failed to create credentials.',
		recoverySuggestion:
			'Credentials may not be supported on this device. Ensure your browser is up to date and the Web Authentication API is supported.',
	},
	[PasskeyErrorCode.PasskeyRetrievalFailed]: {
		message: 'Device failed to retrieve credentials.',
		recoverySuggestion:
			'Credentials may not be available on this device. Try an alternative authentication factor like PASSWORD, EMAIL_OTP, or SMS_OTP.',
	},
};

export const assertPasskeyError: AssertionFunction<PasskeyErrorCode> =
	createAssertionFunction(passkeyErrorMap, PasskeyError);
