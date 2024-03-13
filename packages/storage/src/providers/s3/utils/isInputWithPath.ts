// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOperationInputPath,
	StorageOperationInputType,
} from '../../../types/inputs';

export const isInputWithPath = (
	input: StorageOperationInputType,
): input is StorageOperationInputPath => {
	return input.path !== undefined;
};
