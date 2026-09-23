// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { STORAGE_INPUT_KEY } from './constants';

/**
 * Resolves the final S3 key based on input type and key prefix.
 *
 * @param inputType - The type of input (key-based or path-based)
 * @param objectKey - The object key from the input
 * @param keyPrefix - The key prefix to prepend for key-based inputs
 * @returns The final S3 key to use for the operation
 */
export const resolveFinalKey = (
	inputType: string,
	objectKey: string,
	keyPrefix: string,
): string => {
	return inputType === STORAGE_INPUT_KEY
		? `${keyPrefix}${objectKey}`
		: objectKey;
};
