import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';

import {
	PasskeyError,
	PasskeyErrorCode,
} from '../../../../../src/client/utils/passkey/errors';
import { handlePasskeyError } from '../../../../../src/client/utils/passkey/errors/handlePasskeyError';
import { passkeyErrorMap } from '../../../../../src/client/utils/passkey/errors/passkeyError';

describe('handlePasskeyError', () => {
	it('returns new instance of PasskeyError with correct attributes when input error name is AbortError', () => {
		const err = new Error();
		err.name = 'AbortError';

		const { message, recoverySuggestion } =
			passkeyErrorMap[PasskeyErrorCode.PasskeyOperationAborted];

		expect(handlePasskeyError(err)).toMatchObject(
			new PasskeyError({
				name: PasskeyErrorCode.PasskeyOperationAborted,
				message,
				recoverySuggestion,
				underlyingError: err,
			}),
		);
	});

	it('returns new instance of PasskeyError with correct attributes when input error name is SecurityError', () => {
		const err = new Error();
		err.name = 'SecurityError';

		const { message, recoverySuggestion } =
			passkeyErrorMap[PasskeyErrorCode.RelyingPartyMismatch];

		expect(handlePasskeyError(err)).toMatchObject(
			new PasskeyError({
				name: PasskeyErrorCode.RelyingPartyMismatch,
				message,
				recoverySuggestion,
				underlyingError: err,
			}),
		);
	});

	it('returns unknown PasskeyError when input does not match expected cases', () => {
		const err = new Error();
		err.name = 'Unknown';

		expect(handlePasskeyError(err)).toMatchObject(
			new PasskeyError({
				name: AmplifyErrorCode.Unknown,
				message: 'An unknown error has occurred.',
				underlyingError: err,
			}),
		);
	});
});
