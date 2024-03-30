// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOperationInputWithPath,
	StorageOperationInputWithType,
} from '../../../types/inputs';

export const isInputWithPath = (
	input: StorageOperationInputWithType,
): input is StorageOperationInputWithPath => {
	return input.path !== undefined;
};
