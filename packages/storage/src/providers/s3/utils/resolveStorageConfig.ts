// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

const DEFAULT_ACCESS_LEVEL = 'guest';

export function resolveStorageConfig(amplify: AmplifyClassV6) {
	const { bucket, region } = amplify.getConfig()?.Storage?.S3 ?? {};
	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);
	assertValidationError(!!region, StorageValidationErrorCode.NoRegion);
	const { defaultAccessLevel = DEFAULT_ACCESS_LEVEL } =
		amplify.libraryOptions?.Storage?.S3 ?? {};
	return {
		defaultAccessLevel,
		bucket,
		region,
	};
}
