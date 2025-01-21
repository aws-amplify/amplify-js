// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';

import {
	PasskeyError,
	PasskeyErrorCode,
} from '../../../../src/client/utils/passkey/errors/shared';
import {
	handlePasskeyAuthenticationError,
	handlePasskeyRegistrationError,
} from '../../../../src/client/utils/passkey/errors/native';

describe('Native Passkey Error Handlers', () => {
	describe('handlePasskeyRegistrationError', () => {
		it('should return existing PasskeyError unchanged', () => {
			const existingError = new PasskeyError({
				name: PasskeyErrorCode.PasskeyNotSupported,
				message: 'test message',
			});

			const result = handlePasskeyRegistrationError(existingError);
			expect(result).toBe(existingError);
		});

		it('should map UserCancelled native error', () => {
			const nativeError = new Error('cancelled');
			(nativeError as any).code = 'UserCancelled';

			const result = handlePasskeyRegistrationError(nativeError);
			expect(result.name).toBe(PasskeyErrorCode.PasskeyRegistrationCanceled);
		});

		it('should map NotSupported native error', () => {
			const nativeError = new Error('not supported');
			(nativeError as any).code = 'NotSupported';

			const result = handlePasskeyRegistrationError(nativeError);
			expect(result.name).toBe(PasskeyErrorCode.PasskeyNotSupported);
		});

		it('should handle unknown errors', () => {
			const result = handlePasskeyRegistrationError(new Error('unknown'));
			expect(result.name).toBe(AmplifyErrorCode.Unknown);
		});

		it('should map NotConfigured native error', () => {
			const nativeError = new Error('not configured');
			(nativeError as any).code = 'NotConfigured';

			const result = handlePasskeyRegistrationError(nativeError);
			expect(result.name).toBe(
				PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
			);
		});

		it('should map Interrupted native error', () => {
			const nativeError = new Error('interrupted');
			(nativeError as any).code = 'Interrupted';

			const result = handlePasskeyRegistrationError(nativeError);
			expect(result.name).toBe(PasskeyErrorCode.PasskeyOperationAborted);
		});

		it('should handle non-Error objects', () => {
			const result = handlePasskeyRegistrationError('not an error');
			expect(result.name).toBe(AmplifyErrorCode.Unknown);
		});
	});

	describe('handlePasskeyAuthenticationError', () => {
		it('should return existing PasskeyError unchanged', () => {
			const existingError = new PasskeyError({
				name: PasskeyErrorCode.PasskeyNotSupported,
				message: 'test message',
			});

			const result = handlePasskeyAuthenticationError(existingError);
			expect(result).toBe(existingError);
		});

		it('should map NoCredentials native error', () => {
			const nativeError = new Error('no credentials');
			(nativeError as any).code = 'NoCredentials';

			const result = handlePasskeyAuthenticationError(nativeError);
			expect(result.name).toBe(PasskeyErrorCode.PasskeyRetrievalFailed);
		});

		it('should map UserCancelled native error', () => {
			const nativeError = new Error('cancelled');
			(nativeError as any).code = 'UserCancelled';

			const result = handlePasskeyAuthenticationError(nativeError);
			expect(result.name).toBe(PasskeyErrorCode.PasskeyAuthenticationCanceled);
		});

		it('should map NotSupported native error', () => {
			const nativeError = new Error('not supported');
			(nativeError as any).code = 'NotSupported';

			const result = handlePasskeyAuthenticationError(nativeError);
			expect(result.name).toBe(PasskeyErrorCode.PasskeyNotSupported);
		});

		it('should map NotConfigured native error', () => {
			const nativeError = new Error('not configured');
			(nativeError as any).code = 'NotConfigured';

			const result = handlePasskeyAuthenticationError(nativeError);
			expect(result.name).toBe(
				PasskeyErrorCode.InvalidPasskeyAuthenticationOptions,
			);
		});

		it('should map Interrupted native error', () => {
			const nativeError = new Error('interrupted');
			(nativeError as any).code = 'Interrupted';

			const result = handlePasskeyAuthenticationError(nativeError);
			expect(result.name).toBe(PasskeyErrorCode.PasskeyOperationAborted);
		});

		it('should handle non-Error objects', () => {
			const result = handlePasskeyAuthenticationError('not an error');
			expect(result.name).toBe(AmplifyErrorCode.Unknown);
		});

		it('should handle unknown errors', () => {
			const result = handlePasskeyAuthenticationError(new Error('unknown'));
			expect(result.name).toBe(AmplifyErrorCode.Unknown);
		});
	});
});
