// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';

export const resolveIdentityId = (identityId?: string): string => {
	assertValidationError(!!identityId, StorageValidationErrorCode.NoIdentityId);

	return identityId;
};
