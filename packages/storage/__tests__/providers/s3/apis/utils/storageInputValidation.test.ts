// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { validateStorageOperationInput } from "../../../../../src/providers/s3/utils";
import { STORAGE_INPUT_KEY, STORAGE_INPUT_PATH } from "../../../../../src/providers/s3/utils/constants";

describe('validateStorageOperationInput', () => {
  it('should return inputType as STORAGE_INPUT_PATH and objectKey as path when input is path', () => {
    const input = { path: 'testPath' };
    const result = validateStorageOperationInput(input);
    expect(result).toEqual({ inputType: STORAGE_INPUT_PATH, objectKey: 'testPath' });
  });

  it('should return inputType as STORAGE_INPUT_PATH and objectKey as result of path function when input is path function', () => {
    const input = { path: ({identityId}: {identityId?: string}) => `testPath/${identityId}` };
    const result = validateStorageOperationInput(input, '123');
    expect(result).toEqual({ inputType: STORAGE_INPUT_PATH, objectKey: 'testPath/123' });
  });

  it('should return inputType as STORAGE_INPUT_KEY and objectKey as key when input is key', () => {
    const input = { key: 'testKey' };
    const result = validateStorageOperationInput(input);
    expect(result).toEqual({ inputType: STORAGE_INPUT_KEY, objectKey: 'testKey' });
  });

  it('should throw an error when input is invalid', () => {
    const input = {invalid: 'test' } as any;
    expect(() => validateStorageOperationInput(input)).toThrow('invalid input');
  });
});