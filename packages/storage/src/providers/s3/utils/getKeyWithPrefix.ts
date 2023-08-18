// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, StorageAccessLevel } from '@aws-amplify/core';
import { resolvePrefix as defaultPrefixResolver } from '../../../utils/resolvePrefix';

type GetKeyWithPrefixOptions = {
	accessLevel: StorageAccessLevel;
	targetIdentityId?: string;
	key: string;
};

export const getKeyWithPrefix = ({
	accessLevel,
	targetIdentityId,
	key,
}: GetKeyWithPrefixOptions) => {
	const { prefixResolver = defaultPrefixResolver } =
		AmplifyV6.libraryOptions?.Storage?.AWSS3 ?? {};
	return (
		prefixResolver({
			accessLevel,
			targetIdentityId,
		}) + key
	);
};
