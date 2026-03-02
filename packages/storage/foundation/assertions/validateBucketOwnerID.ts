// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageValidationErrorCode } from '../../src/errors/types/validation';

import { assertValidationError } from './assertValidationError';

const VALID_AWS_ACCOUNT_ID_PATTERN = /^\d{12}/;

export const validateBucketOwnerID = (accountID?: string) => {
	if (accountID === undefined) {
		return;
	}

	assertValidationError(
		VALID_AWS_ACCOUNT_ID_PATTERN.test(accountID),
		StorageValidationErrorCode.InvalidAWSAccountID,
	);
};
