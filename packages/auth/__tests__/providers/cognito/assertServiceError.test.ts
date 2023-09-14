import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';
import { assertServiceError } from '../../../src/errors/utils/assertServiceError';
import { AuthError } from '../../../src/errors/AuthError';
import { InitiateAuthException } from '../../../src/providers/cognito/types/errors';

describe('asserts service errors', () => {
	test('it should throw an unknown error when error is null', () => {
		try {
			const error = null;
			expect(assertServiceError(error)).toThrowError();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorCode.Unknown);
		}
	});
	test('it should throw an unknown error when error is a TypeError', () => {
		try {
			const error = new TypeError('TypeError');
			expect(assertServiceError(error)).toThrowError();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorCode.Unknown);
		}
	});
	test('it should throw an unknown error when error does not have a name', () => {
		try {
			const error = new Error('Error');
			expect(assertServiceError(error)).toThrowError();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorCode.Unknown);
		}
	});
	test('it should not throw if the error is coming from the service', () => {
		const error = new Error('Service Error');
		error.name = InitiateAuthException.InternalErrorException;
		expect(assertServiceError(error)).toBeUndefined();
	});
});
