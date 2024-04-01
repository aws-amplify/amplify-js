// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOperationInputType,
	StorageOperationInputWithPath,
} from '../../../types/inputs';

export const isInputWithPath = (
	input: StorageOperationInputType,
): input is StorageOperationInputWithPath => {
	return input.path !== undefined;
};
