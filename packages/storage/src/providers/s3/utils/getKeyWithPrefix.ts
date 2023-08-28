// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6, StorageAccessLevel } from '@aws-amplify/core';
import { resolvePrefix as defaultPrefixResolver } from '../../../utils/resolvePrefix';

type GetKeyWithPrefixOptions = {
	accessLevel: StorageAccessLevel;
	targetIdentityId?: string;
	key?: string;
};

export const getKeyWithPrefix = (
	amplify: AmplifyClassV6,
	{ accessLevel, targetIdentityId, key = '' }: GetKeyWithPrefixOptions
) => {
	const { prefixResolver = defaultPrefixResolver } =
		amplify.libraryOptions?.Storage?.S3 ?? {};
	return (
		prefixResolver({
			accessLevel,
			targetIdentityId,
		}) + key
	);
};
