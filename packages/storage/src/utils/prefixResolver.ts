// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';
import { assertValidationError } from '../errors/assertValidationErrors';
import { StorageValidationErrorCode } from '../errors/types/validation';

type PrefixResolverOptions = {
	accessLevel: StorageAccessLevel;
	targetIdentityId?: string;
};

export const prefixResolver = ({
	accessLevel,
	targetIdentityId,
}: PrefixResolverOptions) => {
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
