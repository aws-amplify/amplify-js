import { AmplifyClassV6 } from '@aws-amplify/core';

import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageConfiguration } from '../apis/internal/types';

const constructDefaultCredentialsProvider = (amplify: AmplifyClassV6) => {
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

const constructDefaultIdentityIdProvider = (amplify: AmplifyClassV6) => {
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
 * This constructor will return a storage configuration
 * that is independent from the Amplify singleton.
 *
 * @internal
 */
export const constructStorageConfiguration = (
	amplify: AmplifyClassV6,
): StorageConfiguration => {
	const libraryOptions = amplify.libraryOptions.Storage?.S3 ?? {};
	const serviceOptions = amplify.getConfig()?.Storage?.S3 ?? {};
	const credentialsProvider = constructDefaultCredentialsProvider(amplify);
	const identityIdProvider = constructDefaultIdentityIdProvider(amplify);

	return {
		libraryOptions,
		serviceOptions,
		credentialsProvider,
		identityIdProvider,
	};
};
