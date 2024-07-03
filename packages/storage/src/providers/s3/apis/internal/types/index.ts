import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { S3LibraryOptions, S3ServiceOptions } from '../../../types/options';

/**
 * Storage config input
 *
 * @internal
 */
export interface StorageConfiguration {
	serviceOptions: S3ServiceOptions;
	libraryOptions: S3LibraryOptions;
	credentialsProvider(): Promise<AWSCredentials>;
	identityIdProvider(): Promise<string>;
}
