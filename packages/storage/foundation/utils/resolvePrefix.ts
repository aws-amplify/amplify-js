// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';

import { assertValidationError } from '../assertions';
import { StorageValidationErrorCode } from '../../src/internals';

interface ResolvePrefixOptions {
	accessLevel: StorageAccessLevel;
	targetIdentityId?: string;
}

export const resolvePrefix = ({
	accessLevel,
	targetIdentityId,
}: ResolvePrefixOptions) => {
	if (accessLevel === 'private') {
		assertValidationError(
			!!targetIdentityId,
			StorageValidationErrorCode.NoIdentityId,
		);

		return `private/${targetIdentityId}/`;
	} else if (accessLevel === 'protected') {
		assertValidationError(
			!!targetIdentityId,
			StorageValidationErrorCode.NoIdentityId,
		);

		return `protected/${targetIdentityId}/`;
	} else {
		return 'public/';
	}
};
