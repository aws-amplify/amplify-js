// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { S3InternalConfig, S3ServiceOptions } from '../apis/internal/types';
import {
	BucketLocation,
	CommonOptions,
	LocationCredentialsProvider,
	Permission,
} from '../types/options';
import {
	StorageOperationInput,
	StorageOperationInputWithPath,
	StorageOperationOptionsInput,
} from '../../../types/inputs';
import { StorageError } from '../../../errors/StorageError';
import {
	INVALID_STORAGE_PATH,
	NO_STORAGE_CONFIG,
} from '../../../errors/constants';

type StorageCredentialsProvider = () => Promise<AWSCredentials>;
type StorageIdentityIdProvider = () => Promise<string>;

const createDefaultCredentialsProvider = (
	amplify: AmplifyClassV6,
): StorageCredentialsProvider => {
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

const createDefaultIdentityIdProvider = (
	amplify: AmplifyClassV6,
): StorageIdentityIdProvider => {
	return async () => {
		const { identityId } = await amplify.Auth.fetchAuthSession();
		assertValidationError(
			!!identityId,
			StorageValidationErrorCode.NoIdentityId,
		);

		return identityId;
	};
};

const isInputWithOptions = (
	input: unknown,
): input is { options: InternalStorageAPIConfig['options'] } => {
	return !!input && (input as any).options;
};
const isInputWithPath = (
	input: unknown,
): input is StorageOperationInputWithPath => {
	return !!input && (input as any).path;
};

const isInputWithSourceAndDestination = (
	input: unknown,
): input is {
	source: StorageOperationInputWithPath;
	destination: StorageOperationInputWithPath;
} => {
	return !!input && (input as any).destination && (input as any).source;
};

interface InternalStorageAPIConfig
	extends StorageOperationOptionsInput<
		CommonOptions & {
			bucket?: string;
			region?: string;
		}
	> {
	paths: StorageOperationInput['path'][];
}

/**
 * This function is independent from the different input permutations and is used mainly to resolve the
 * the main storage options.
 *
 * @internal
 */
export const createInternalStorageAPIConfig = (
	input: unknown,
): InternalStorageAPIConfig => {
	let options: NonNullable<InternalStorageAPIConfig['options']> = {};
	let paths: InternalStorageAPIConfig['paths'] = [];

	if (isInputWithPath(input)) {
		const { path } = input;
		paths = [path];
	} else if (isInputWithSourceAndDestination(input)) {
		const {
			destination: { path: destinationPath },
			source: { path: sourcePath },
		} = input;
		paths = [destinationPath, sourcePath];
	}

	if (isInputWithOptions(input)) {
		const { options: apiOptions } = input;
		options = { ...apiOptions };
	}

	return {
		paths,
		options,
	};
};

/**
 * It will return a Storage configuration used by lower level utils and APIs.
 *
 * @internal
 */
export const createStorageConfiguration = (
	amplify: AmplifyClassV6,
	apiInput: unknown,
	permission: Permission,
): S3InternalConfig => {
	const { paths, options } = createInternalStorageAPIConfig(apiInput);
	const { locationCredentialsProvider } = options ?? {};

	const libraryOptions = amplify.libraryOptions?.Storage?.S3 ?? {};
	const serviceOptions = getServiceOptions(amplify, options);
	const identityIdProvider = createDefaultIdentityIdProvider(amplify);
	const { bucket } = serviceOptions;

	const credentialsProvider = locationCredentialsProvider
		? createCustomCredentialsProvider({
				bucket,
				paths,
				locationCredentialsProvider,
				permission,
			})
		: createDefaultCredentialsProvider(amplify);

	return {
		libraryOptions,
		serviceOptions,
		credentialsProvider,
		identityIdProvider,
	};
};

const getServiceOptions = (
	amplify: AmplifyClassV6,
	options: InternalStorageAPIConfig['options'],
): S3ServiceOptions => {
	const { Storage } = amplify.getConfig() ?? {};
	const { dangerouslyConnectToHttpEndpointForTesting } = Storage?.S3 ?? {};

	if (isConfigFromApiInput(options)) {
		return {
			bucket: options?.bucket,
			region: options?.region,
			dangerouslyConnectToHttpEndpointForTesting,
		};
	} else if (isConfigFromAmplifySingleton(Storage?.S3)) {
		return {
			bucket: Storage?.S3.bucket,
			region: Storage?.S3.region,
			dangerouslyConnectToHttpEndpointForTesting,
		};
	}

	throw new StorageError({
		name: NO_STORAGE_CONFIG,
		message: 'Storage configuration is required.',
	});
};

export const createServerStorageConfiguration = (
	amplify: AmplifyClassV6,
): S3InternalConfig => {
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

interface CreateCustomCredentialsProviderParams {
	paths: InternalStorageAPIConfig['paths'];
	bucket?: string;
	locationCredentialsProvider: LocationCredentialsProvider;
	permission: Permission;
}

const createCustomCredentialsProvider = ({
	bucket,
	paths,
	permission,
	locationCredentialsProvider,
}: CreateCustomCredentialsProviderParams): StorageCredentialsProvider => {
	return async () => {
		const locations = await getLocations({ bucket, paths });
		const { credentials } = await locationCredentialsProvider({
			locations,
			permission,
		});

		return credentials;
	};
};

interface ResolvePathProps {
	path: StorageOperationInput['path'];
}
const resolvePath = ({ path }: ResolvePathProps): string => {
	if (!path || typeof path === 'function') {
		throw new StorageError({
			name: INVALID_STORAGE_PATH,
			message: 'path option needs to be a string',
		});
	}

	return path;
};

type GetLocationsParams = Pick<
	CreateCustomCredentialsProviderParams,
	'paths' | 'bucket'
>;
const getLocations: (
	params: GetLocationsParams,
) => Promise<BucketLocation[]> = async ({ paths, bucket }) => {
	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);

	return paths.map(path => ({ bucket, path: resolvePath({ path }) }));
};

const isConfigFromApiInput = (
	options: InternalStorageAPIConfig['options'],
): boolean => {
	return !!(options?.bucket && options?.region);
};

const isConfigFromAmplifySingleton = (
	s3Options?: S3ServiceOptions,
): s3Options is S3ServiceOptions => {
	return !!(s3Options && s3Options.bucket && s3Options.region);
};
