// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, StorageAccessLevel } from '@aws-amplify/core';
import { prefixResolver as defaultPrefixResolver } from '../../../utils/prefixResolver';

export function getKeyWithPrefix(
	accessLevel: StorageAccessLevel,
	identityId: string,
	key: string
) {
	const { prefixResolver = defaultPrefixResolver } =
		AmplifyV6.libraryOptions?.Storage ?? {};
	return (
		prefixResolver({
			accessLevel,
			targetIdentityId: identityId,
		}) + key
	);
}
