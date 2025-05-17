import { getIsNativeError } from '@aws-amplify/react-native/internals/utils';

import {
	PasskeyError,
	PasskeyErrorCode,
} from '../../../../../src/client/utils/passkey/errors';
import { handlePasskeyRegistrationError } from '../../../../../src/client/utils/passkey/errors/handlePasskeyRegistrationError.native';
import { handlePasskeyError } from '../../../../../src/client/utils/passkey/errors/handlePasskeyError';
import { passkeyErrorMap } from '../../../../../src/client/utils/passkey/errors/passkeyError';
import { MockNativeError } from '../../../../mockData';

const mockHandlePasskeyError = jest.mocked(handlePasskeyError);
jest.mock('../../../../../src/client/utils/passkey/errors/handlePasskeyError');

jest.mock('@aws-amplify/react-native/internals/utils', () => ({
	getIsNativeError: jest.fn(() => true),
}));

const mockGetIsNativeError = jest.mocked(getIsNativeError);

describe('handlePasskeyRegistrationError', () => {
	it('returns early if err is already instanceof PasskeyError', () => {
		const err = new PasskeyError({
			name: 'PasskeyErrorName',
			message: 'Error Message',
		});

		expect(handlePasskeyRegistrationError(err)).toBe(err);
		expect(mockGetIsNativeError).not.toHaveBeenCalled();
	});

	it('returns new instance of PasskeyError with correct attributes when input error code is FAILED', () => {
		const err = new MockNativeError();
		err.code = 'FAILED';

		const { message, recoverySuggestion } =
			passkeyErrorMap[PasskeyErrorCode.PasskeyRegistrationFailed];

		expect(handlePasskeyRegistrationError(err)).toMatchObject(
			new PasskeyError({
				name: PasskeyErrorCode.PasskeyRegistrationFailed,
				message,
				recoverySuggestion,
				underlyingError: err,
			}),
		);
		expect(mockGetIsNativeError).toHaveBeenCalledWith(err);
	});
	it('returns new instance of PasskeyError with correct attributes when input error code is DUPLICATE', () => {
		const err = new MockNativeError();
		err.code = 'DUPLICATE';

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
		expect(mockGetIsNativeError).toHaveBeenCalledWith(err);
	});

	it('returns new instance of PasskeyError with correct attributes when input error code is CANCELED', () => {
		const err = new MockNativeError();
		err.code = 'CANCELED';

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
		expect(mockGetIsNativeError).toHaveBeenCalledWith(err);
	});

	it('invokes handlePasskeyError when input error does not match expected cases', () => {
		const err = new Error();
		err.name = 'Unknown';

		handlePasskeyRegistrationError(err);

		expect(mockHandlePasskeyError).toHaveBeenCalledWith(err);
		expect(mockGetIsNativeError).toHaveBeenCalledWith(err);
	});
});
