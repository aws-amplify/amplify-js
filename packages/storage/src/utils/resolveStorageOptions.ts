// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { Credentials } from '@aws-sdk/types';

import { resolvePrefix as defaultPrefixResolver } from './resolvePrefix';
import { assertValidationError } from '../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../errors/types/validation';
import { StorageOptions } from '../types/params';

const DEFAULT_ACCESS_LEVEL = 'guest';

type InputStorageOptions = StorageOptions;

type ResolvedStorageOptions = {
	region: string;
	bucket: string;
	key: string;
};

export const resolveStorageOptions = (
	options: InputStorageOptions
): ResolvedStorageOptions => {
	const { bucket, region } = AmplifyV6.getConfig()?.Storage ?? {};
	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);
	assertValidationError(!!region, StorageValidationErrorCode.NoRegion);
	const { defaultAccessLevel, prefixResolver = defaultPrefixResolver } =
		AmplifyV6.libraryOptions?.Storage?.AWSS3 ?? {};
	return {
		region,
		bucket,
		key: prefixResolver({
			accessLevel:
				options.accessLevel ?? defaultAccessLevel ?? DEFAULT_ACCESS_LEVEL,
		}),
	};
};
