// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';

/**
 * Utility for determining if credentials have changed.
 * 
 * @internal
 */
export const haveCredentialsChanged = (cachedCredentials: AWSCredentials, credentials: AWSCredentials) => {
	if (
		cachedCredentials.accessKeyId !== credentials.accessKeyId ||
		cachedCredentials.sessionToken !== credentials.sessionToken ||
		cachedCredentials.secretAccessKey !== credentials.secretAccessKey
	) {
		return true;
	}

	return false;
};
