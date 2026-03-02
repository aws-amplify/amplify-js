// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageValidationErrorCode } from '../../src/internals';
import { assertValidationError } from '../assertions/assertValidationError';

export const resolveIdentityId = (identityId?: string): string => {
	assertValidationError(!!identityId, StorageValidationErrorCode.NoIdentityId);

	return identityId;
};
