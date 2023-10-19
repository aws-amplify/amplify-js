// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertValidationError } from '../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../errors/types/validation';
import { ResolvePrefixInput } from '../types/inputs';

export const resolvePrefix = ({
	accessLevel,
	targetIdentityId,
}: ResolvePrefixInput) => {
	if (accessLevel === 'private') {
		assertValidationError(
			!!targetIdentityId,
			StorageValidationErrorCode.NoIdentityId
		);
		return `private/${targetIdentityId}/`;
	} else if (accessLevel === 'protected') {
		assertValidationError(
			!!targetIdentityId,
			StorageValidationErrorCode.NoIdentityId
		);
		return `protected/${targetIdentityId}/`;
	} else {
		return 'public/';
	}
};
