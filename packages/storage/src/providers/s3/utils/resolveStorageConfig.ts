// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

export function resolveStorageConfig() {
	const { bucket, region } = AmplifyV6.getConfig()?.Storage ?? {};
	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);
	assertValidationError(!!region, StorageValidationErrorCode.NoRegion);
	const { defaultAccessLevel } = AmplifyV6.libraryOptions?.Storage ?? {};
	return {
		defaultAccessLevel,
		bucket,
		region,
	};
}
