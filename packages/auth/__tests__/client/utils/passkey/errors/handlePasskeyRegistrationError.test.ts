import {
	PasskeyError,
	PasskeyErrorCode,
	handlePasskeyRegistrationError,
} from '../../../../../src/client/utils/passkey/errors';
import { handlePasskeyError } from '../../../../../src/client/utils/passkey/errors/handlePasskeyError';
import { passkeyErrorMap } from '../../../../../src/client/utils/passkey/errors/passkeyError';

const mockHandlePasskeyError = jest.mocked(handlePasskeyError);
jest.mock('../../../../../src/client/utils/passkey/errors/handlePasskeyError');

describe('handlePasskeyRegistrationError', () => {
	it('returns early if err is already instanceof PasskeyError', () => {
		const err = new PasskeyError({
			name: 'PasskeyErrorName',
			message: 'Error Message',
		});

		expect(handlePasskeyRegistrationError(err)).toBe(err);
	});

	it('returns new instance of PasskeyError with correct attributes when input error code is InvalidStateError', () => {
		const err = new Error();
		err.name = 'InvalidStateError';

		const { message, recoverySuggestion } =
			passkeyErrorMap[PasskeyErrorCode.PasskeyAlreadyExists];

		expect(handlePasskeyRegistrationError(err)).toMatchObject(
			new PasskeyError({
				name: PasskeyErrorCode.PasskeyAlreadyExists,
				message,
				recoverySuggestion,
				underlyingError: err,
			}),
		);
	});

	it('returns new instance of PasskeyError with correct attributes when input error code is NotAllowedError', () => {
		const err = new Error();
		err.name = 'NotAllowedError';

		const { message, recoverySuggestion } =
			passkeyErrorMap[PasskeyErrorCode.PasskeyRegistrationCanceled];

		expect(handlePasskeyRegistrationError(err)).toMatchObject(
			new PasskeyError({
				name: PasskeyErrorCode.PasskeyRegistrationCanceled,
				message,
				recoverySuggestion,
				underlyingError: err,
			}),
		);
	});

	it('invokes handlePasskeyError when input error does not match expected cases', () => {
		const err = new Error();
		err.name = 'Unknown';

		handlePasskeyRegistrationError(err);

		expect(mockHandlePasskeyError).toHaveBeenCalledWith(err);
	});
});
