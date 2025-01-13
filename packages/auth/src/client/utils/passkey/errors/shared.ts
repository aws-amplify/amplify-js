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

const notSupportedRecoverySuggestion =
	'Passkeys may not be supported on this device. Ensure your application is running in a secure context (HTTPS) and Web Authentication API is supported.';
const abortOrCancelRecoverySuggestion =
	'User may have canceled the ceremony or another interruption has occurred. Check underlying error for details.';
const misconfigurationRecoverySuggestion =
	'Ensure your user pool is configured to support the WEB_AUTHN as an authentication factor.';

export const passkeyErrorMap: AmplifyErrorMap<PasskeyErrorCode> = {
	[PasskeyErrorCode.PasskeyNotSupported]: {
		message: 'Passkeys may not be supported on this device.',
		recoverySuggestion: notSupportedRecoverySuggestion,
	},
	[PasskeyErrorCode.InvalidPasskeyRegistrationOptions]: {
		message: 'Invalid passkey registration options.',
		recoverySuggestion: misconfigurationRecoverySuggestion,
	},
	[PasskeyErrorCode.InvalidPasskeyAuthenticationOptions]: {
		message: 'Invalid passkey authentication options.',
		recoverySuggestion: misconfigurationRecoverySuggestion,
	},
	[PasskeyErrorCode.PasskeyRegistrationFailed]: {
		message: 'Device failed to create passkey.',
		recoverySuggestion: notSupportedRecoverySuggestion,
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
		recoverySuggestion: abortOrCancelRecoverySuggestion,
	},
	[PasskeyErrorCode.PasskeyAuthenticationCanceled]: {
		message: 'Passkey authentication ceremony has been canceled.',
		recoverySuggestion: abortOrCancelRecoverySuggestion,
	},
	[PasskeyErrorCode.PasskeyOperationAborted]: {
		message: 'Passkey operation has been aborted.',
		recoverySuggestion: abortOrCancelRecoverySuggestion,
	},
	[PasskeyErrorCode.RelyingPartyMismatch]: {
		message: 'Relying party does not match current domain.',
		recoverySuggestion:
			'Ensure relying party identifier matches current domain.',
	},
};

export const assertPasskeyError: AssertionFunction<PasskeyErrorCode> =
	createAssertionFunction(passkeyErrorMap, PasskeyError);
