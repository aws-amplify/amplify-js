// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../../../src/errors/types/validation';
import { validateStorageOperationInput } from '../../../../../src/providers/s3/utils';
import {
	STORAGE_INPUT_KEY,
	STORAGE_INPUT_PATH,
} from '../../../../../src/providers/s3/utils/constants';

describe('validateStorageOperationInput', () => {
	it('should return inputType as STORAGE_INPUT_PATH and objectKey as testPath when input is path as string', () => {
		const input = { path: 'testPath' };
		const result = validateStorageOperationInput(input);
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
		const result = validateStorageOperationInput(input, '123');
		expect(result).toEqual({
			inputType: STORAGE_INPUT_PATH,
			objectKey: 'testPath/123',
		});
	});

	it('should return inputType as STORAGE_INPUT_KEY and objectKey as testKey when input is key', () => {
		const input = { key: 'testKey' };
		const result = validateStorageOperationInput(input);
		expect(result).toEqual({
			inputType: STORAGE_INPUT_KEY,
			objectKey: 'testKey',
		});
	});

	it('should throw an error when input path starts with a /', () => {
		const input = { path: '/leading-slash-path' };
		expect(() => validateStorageOperationInput(input)).toThrow(
			validationErrorMap[
				StorageValidationErrorCode.InvalidStoragePathInput
			].message,
		);
	});

	it('should throw an error when input is invalid', () => {
		const input = { invalid: 'test' } as any;
		expect(() => validateStorageOperationInput(input)).toThrow(
			validationErrorMap[
				StorageValidationErrorCode.InvalidStorageOperationInput
			].message,
		);
	});

	it('should throw an error when both key & path are specified', () => {
		const input = { path: 'testPath/object', key: 'key' } as any;
		expect(() => validateStorageOperationInput(input)).toThrow(
			validationErrorMap[
				StorageValidationErrorCode.InvalidStorageOperationInput
			].message,
		);
	});
});
