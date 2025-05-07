import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';

import {
	PasskeyError,
	PasskeyErrorCode,
} from '../../../../../src/client/utils/passkey/errors';
import { handlePasskeyError } from '../../../../../src/client/utils/passkey/errors/handlePasskeyError.native';
import { passkeyErrorMap } from '../../../../../src/client/utils/passkey/errors/passkeyError';
import { MockNativeError } from '../../../../mockData';

jest.mock('@aws-amplify/react-native', () => ({
	getIsNativeError: jest.fn(() => true),
}));

describe('handlePasskeyError', () => {
	it('returns new instance of PasskeyError with correct attributes when input error code is RELYING_PARTY_MISMATCH', () => {
		const err = new MockNativeError();
		err.code = 'RELYING_PARTY_MISMATCH';

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

	it('returns new instance of PasskeyError with correct attributes when input error code is NOT_SUPPORTED', () => {
		const err = new MockNativeError();
		err.code = 'NOT_SUPPORTED';

		const { message, recoverySuggestion } =
			passkeyErrorMap[PasskeyErrorCode.PasskeyNotSupported];

		expect(handlePasskeyError(err)).toMatchObject(
			new PasskeyError({
				name: PasskeyErrorCode.PasskeyNotSupported,
				message,
				recoverySuggestion,
				underlyingError: err,
			}),
		);
	});

	it('returns unknown PasskeyError when input does not match expected cases', () => {
		const err = new MockNativeError();
		err.name = 'UNKNOWN';

		expect(handlePasskeyError(err)).toMatchObject(
			new PasskeyError({
				name: AmplifyErrorCode.Unknown,
				message: 'An unknown error has occurred.',
				underlyingError: err,
			}),
		);
	});
});
