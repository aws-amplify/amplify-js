// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { S3Configuration } from '../apis/internal/types';

const createDefaultCredentialsProvider = (amplify: AmplifyClassV6) => {
	/**
	 * A credentials provider function instead of a static credentials object is
	 * used because the long-running tasks like multipart upload may span over the
	 * credentials expiry. Auth.fetchAuthSession() automatically refreshes the
	 * credentials if they are expired.
	 */
	return async () => {
		const { credentials } = await amplify.Auth.fetchAuthSession();
		assertValidationError(
			!!credentials,
			StorageValidationErrorCode.NoCredentials,
		);

		return credentials;
	};
};

const createDefaultIdentityIdProvider = (amplify: AmplifyClassV6) => {
	return async () => {
		const { identityId } = await amplify.Auth.fetchAuthSession();
		assertValidationError(
			!!identityId,
			StorageValidationErrorCode.NoIdentityId,
		);

		return identityId;
	};
};

/**
 * It will return a Storage configuration used by lower level utils and APIs.
 *
 * @internal
 */
export const createStorageConfiguration = (
	amplify: AmplifyClassV6,
): S3Configuration => {
	const libraryOptions = amplify.libraryOptions?.Storage?.S3 ?? {};
	const serviceOptions = amplify.getConfig()?.Storage?.S3 ?? {};
	const credentialsProvider = createDefaultCredentialsProvider(amplify);
	const identityIdProvider = createDefaultIdentityIdProvider(amplify);

	return {
		libraryOptions,
		serviceOptions,
		credentialsProvider,
		identityIdProvider,
	};
};
