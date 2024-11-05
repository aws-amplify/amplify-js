// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOperationInput,
	StorageOperationInputWithPath,
} from '../../../types/inputs';

export const isInputWithPath = (
	input: StorageOperationInput,
): input is StorageOperationInputWithPath => {
	return input.path !== undefined;
};
