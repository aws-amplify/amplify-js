// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Headers } from '@aws-amplify/core/internals/aws-client-utils';

/**
 * @internal
 */
export const deserializeMetadata = (
	headers: Headers,
): Record<string, string> => {
	const objectMetadataHeaderPrefix = 'x-amz-meta-';
	const deserialized = Object.keys(headers)
		.filter(header => header.startsWith(objectMetadataHeaderPrefix))
		.reduce((acc, header) => {
			acc[header.replace(objectMetadataHeaderPrefix, '')] = headers[header];

			return acc;
		}, {} as any);

	return Object.keys(deserialized).length > 0 ? deserialized : undefined;
};
