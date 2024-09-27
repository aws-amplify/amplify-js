// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EndpointResolverOptions } from '@aws-amplify/core/internals/aws-client-utils';

/**
 * Options for endpoint resolver.
 *
 * @internal
 */
export type S3EndpointResolverOptions = EndpointResolverOptions & {
	/**
	 * Whether to use the S3 Transfer Acceleration endpoint.
	 */
	useAccelerateEndpoint?: boolean;
	/**
	 * Fully qualified custom endpoint for S3. If this is set, this endpoint will be used regardless of region or
	 * useAccelerateEndpoint config.
	 * The path of this endpoint
	 */
	customEndpoint?: string;

	/**
	 * Whether to force path style URLs for S3 objects (e.g., https://s3.amazonaws.com/<bucketName>/<key> instead of
	 * https://<bucketName>.s3.amazonaws.com/<key>
	 * @default false
	 */
	forcePathStyle?: boolean;
};

export interface ServiceClientFactoryInput {
	endpointResolver(options: S3EndpointResolverOptions): { url: URL };
}
