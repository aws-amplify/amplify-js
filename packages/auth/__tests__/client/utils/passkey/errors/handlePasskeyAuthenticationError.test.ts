import {
	PasskeyError,
	PasskeyErrorCode,
	handlePasskeyAuthenticationError,
} from '../../../../../src/client/utils/passkey/errors';
import { handlePasskeyError } from '../../../../../src/client/utils/passkey/errors/handlePasskeyError';
import { passkeyErrorMap } from '../../../../../src/client/utils/passkey/errors/passkeyError';

const mockHandlePasskeyError = jest.mocked(handlePasskeyError);
jest.mock('../../../../../src/client/utils/passkey/errors/handlePasskeyError');

describe('handlePasskeyAuthenticationError', () => {
	it('returns early if err is already instanceof PasskeyError', () => {
		const err = new PasskeyError({
			name: 'PasskeyErrorName',
			message: 'Error Message',
		});

		expect(handlePasskeyAuthenticationError(err)).toBe(err);
	});

	it('returns new instance of PasskeyError with correct attributes when input error name is NotAllowedError', () => {
		const err = new Error();
		err.name = 'NotAllowedError';

		const { message, recoverySuggestion } =
			passkeyErrorMap[PasskeyErrorCode.PasskeyAuthenticationCanceled];

		expect(handlePasskeyAuthenticationError(err)).toMatchObject(
			new PasskeyError({
				name: PasskeyErrorCode.PasskeyAuthenticationCanceled,
				message,
				recoverySuggestion,
				underlyingError: err,
			}),
		);
	});

	it('invokes handlePasskeyError when input error does not match expected cases', () => {
		const err = new Error();
		err.name = 'Unknown';

		handlePasskeyAuthenticationError(err);

		expect(mockHandlePasskeyError).toHaveBeenCalledWith(err);
	});
});
