// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyError,
	AmplifyErrorMap,
	AmplifyErrorParams,
	AssertionFunction,
	createAssertionFunction,
} from '@aws-amplify/core/internals/utils';

import { NOT_SUPPORTED_RECOVERY_SUGGESTION } from './passkeyErrorPlatformConstants';

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
	// not supported
	PasskeyNotSupported = 'PasskeyNotSupported',
	// duplicate passkey
	PasskeyAlreadyExists = 'PasskeyAlreadyExists',
	// misconfigurations
	InvalidPasskeyRegistrationOptions = 'InvalidPasskeyRegistrationOptions',
	InvalidPasskeyAuthenticationOptions = 'InvalidPasskeyAuthenticationOptions',
	RelyingPartyMismatch = 'RelyingPartyMismatch',
	// failed credential creation / retrieval
	PasskeyRegistrationFailed = 'PasskeyRegistrationFailed',
	PasskeyRetrievalFailed = 'PasskeyRetrievalFailed',
	// cancel / aborts
	PasskeyRegistrationCanceled = 'PasskeyRegistrationCanceled',
	PasskeyAuthenticationCanceled = 'PasskeyAuthenticationCanceled',
	PasskeyOperationAborted = 'PasskeyOperationAborted',
}

const ABORT_OR_CANCEL_RECOVERY_SUGGESTION =
	'User may have canceled the ceremony or another interruption has occurred. Check underlying error for details.';

const MISCONFIGURATION_RECOVERY_SUGGESTION =
	'Ensure your user pool is configured to support the WEB_AUTHN as an authentication factor.';

export const passkeyErrorMap: AmplifyErrorMap<PasskeyErrorCode> = {
	[PasskeyErrorCode.PasskeyNotSupported]: {
		message: 'Passkeys may not be supported on this device.',
		recoverySuggestion: NOT_SUPPORTED_RECOVERY_SUGGESTION,
	},
	[PasskeyErrorCode.InvalidPasskeyRegistrationOptions]: {
		message: 'Invalid passkey registration options.',
		recoverySuggestion: MISCONFIGURATION_RECOVERY_SUGGESTION,
	},
	[PasskeyErrorCode.InvalidPasskeyAuthenticationOptions]: {
		message: 'Invalid passkey authentication options.',
		recoverySuggestion: MISCONFIGURATION_RECOVERY_SUGGESTION,
	},
	[PasskeyErrorCode.PasskeyRegistrationFailed]: {
		message: 'Device failed to create passkey.',
		recoverySuggestion: NOT_SUPPORTED_RECOVERY_SUGGESTION,
	},
	[PasskeyErrorCode.PasskeyRetrievalFailed]: {
		message: 'Device failed to retrieve passkey.',
		recoverySuggestion:
			'Passkeys may not be available on this device. Try an alternative authentication factor like PASSWORD, EMAIL_OTP, or SMS_OTP.',
	},
	[PasskeyErrorCode.PasskeyAlreadyExists]: {
		message: 'Passkey already exists in authenticator.',
		recoverySuggestion:
			'Proceed with existing passkey or try again after deleting the credential.',
	},
	[PasskeyErrorCode.PasskeyRegistrationCanceled]: {
		message: 'Passkey registration ceremony has been canceled.',
		recoverySuggestion: ABORT_OR_CANCEL_RECOVERY_SUGGESTION,
	},
	[PasskeyErrorCode.PasskeyAuthenticationCanceled]: {
		message: 'Passkey authentication ceremony has been canceled.',
		recoverySuggestion: ABORT_OR_CANCEL_RECOVERY_SUGGESTION,
	},
	[PasskeyErrorCode.PasskeyOperationAborted]: {
		message: 'Passkey operation has been aborted.',
		recoverySuggestion: ABORT_OR_CANCEL_RECOVERY_SUGGESTION,
	},
	[PasskeyErrorCode.RelyingPartyMismatch]: {
		message: 'Relying party does not match current domain.',
		recoverySuggestion:
			'Ensure relying party identifier matches current domain.',
	},
};

export const assertPasskeyError: AssertionFunction<PasskeyErrorCode> =
	createAssertionFunction(passkeyErrorMap, PasskeyError);
