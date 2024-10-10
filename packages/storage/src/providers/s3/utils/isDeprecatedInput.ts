// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOperationInputWithKey,
	StorageOperationInputWithPath,
	StorageOperationInputWithPrefix,
} from '../../../types/inputs';
import { CopyInput, CopyWithPathInput } from '../types';

export type StorageWithPathInput =
	| StorageOperationInputWithPath
	| CopyWithPathInput;

export type DeprecatedStorageInput =
	| StorageOperationInputWithKey
	| StorageOperationInputWithPrefix
	| CopyInput;

type StorageInput = DeprecatedStorageInput | StorageWithPathInput;

export const isDeprecatedInput = (
	input?: StorageInput,
): input is DeprecatedStorageInput => {
	return (
		isInputWithKey(input) ||
		isInputWithPrefix(input) ||
		isInputWithCopySourceOrDestination(input)
	);
};

const isInputWithKey = (
	input?: StorageInput,
): input is StorageOperationInputWithKey => {
	return !!(typeof (input as StorageOperationInputWithKey).key === 'string');
};
const isInputWithPrefix = (
	input?: StorageInput,
): input is StorageOperationInputWithPrefix => {
	return !!(
		typeof (input as StorageOperationInputWithPrefix).prefix === 'string'
	);
};
const isInputWithCopySourceOrDestination = (
	input?: StorageInput,
): input is CopyInput => {
	return !!(
		typeof (input as CopyInput).source?.key === 'string' ||
		typeof (input as CopyInput).destination?.key === 'string'
	);
};
