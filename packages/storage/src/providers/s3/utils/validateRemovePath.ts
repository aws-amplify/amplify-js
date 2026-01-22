// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Validates that the path is safe for removal operations.
 * Prevents deletion of dangerous paths that could affect entire buckets.
 *
 * @param path - The path to validate
 * @throws Error if the path is considered dangerous
 */
export const validateRemovePath = (path: string): void => {
	const DANGEROUS_PATHS = ['', '/', '*'];
	if (DANGEROUS_PATHS.includes(path.trim())) {
		throw new Error('Cannot delete root or bucket-wide paths');
	}
};
