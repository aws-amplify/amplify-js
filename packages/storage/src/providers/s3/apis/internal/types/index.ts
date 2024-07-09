import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { S3LibraryOptions, S3ServiceOptions } from '../../../types/options';

/**
 * S3 storage config input
 *
 * @internal
 */
export interface S3Configuration {
	serviceOptions: S3ServiceOptions;
	libraryOptions: S3LibraryOptions;
	credentialsProvider(): Promise<AWSCredentials>;
	identityIdProvider(): Promise<string>;
}
