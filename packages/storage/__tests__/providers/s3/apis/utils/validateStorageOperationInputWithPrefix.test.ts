// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../../../src/errors/types/validation';
import { validateStorageOperationInputWithPrefix } from '../../../../../src/providers/s3/utils';
import {
	STORAGE_INPUT_PATH,
	STORAGE_INPUT_PREFIX,
} from '../../../../../src/providers/s3/utils/constants';

describe('validateStorageOperationInputWithPrefix', () => {
	it('should return inputType as STORAGE_INPUT_PATH and objectKey as testPath when input is path as string', () => {
		const input = { path: 'testPath' };
		const result = validateStorageOperationInputWithPrefix(input);
		expect(result).toEqual({
			inputType: STORAGE_INPUT_PATH,
			objectKey: 'testPath',
		});
	});

	it('should return inputType as STORAGE_INPUT_PATH and objectKey as result of path function when input is path as function', () => {
		const input = {
			path: ({ identityId }: { identityId?: string }) =>
				`testPath/${identityId}`,
		};
		const result = validateStorageOperationInputWithPrefix(input, '123');
		expect(result).toEqual({
			inputType: STORAGE_INPUT_PATH,
			objectKey: 'testPath/123',
		});
	});

	it('should return inputType as STORAGE_INPUT_PREFIX and objectKey as testKey when input is prefix', () => {
		const input = { prefix: 'testKey' };
		const result = validateStorageOperationInputWithPrefix(input);
		expect(result).toEqual({
			inputType: STORAGE_INPUT_PREFIX,
			objectKey: 'testKey',
		});
	});

	it('should take a default prefix when input has invalid objects', () => {
		const input = { invalid: 'test' } as any;
		const result = validateStorageOperationInputWithPrefix(input);
		expect(result).toEqual({
			inputType: STORAGE_INPUT_PREFIX,
			objectKey: '',
		});
	});

	it('should throw an error when input path starts with a /', () => {
		const input = { path: '/test' } as any;
		expect(() => validateStorageOperationInputWithPrefix(input)).toThrow(
			validationErrorMap[StorageValidationErrorCode.InvalidStoragePathInput]
				.message,
		);
	});

	it('should throw an error when input has both path and prefix', () => {
		const input = { prefix: 'testPrefix', path: 'test' } as any;
		expect(() => validateStorageOperationInputWithPrefix(input)).toThrow(
			validationErrorMap[
				StorageValidationErrorCode.InvalidStorageOperationPrefixInput
			].message,
		);
	});
});
