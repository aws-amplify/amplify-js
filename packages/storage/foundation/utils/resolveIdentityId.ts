// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageValidationErrorCode } from '../../src/errors/types/validation';
import { assertValidationError } from '../../src/errors/utils/assertValidationError';

export const resolveIdentityId = (identityId?: string): string => {
	assertValidationError(!!identityId, StorageValidationErrorCode.NoIdentityId);

	return identityId;
};
