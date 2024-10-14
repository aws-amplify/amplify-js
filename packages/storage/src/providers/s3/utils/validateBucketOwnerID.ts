// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';

export const validateBucketOwnerID = (accountID?: string) => {
	if (accountID === undefined) {
		return;
	}

	const validAWSAccountIDPattern = /^\d{12}/;
	assertValidationError(
		validAWSAccountIDPattern.test(accountID),
		StorageValidationErrorCode.InvalidAWSAccountID,
	);
};
