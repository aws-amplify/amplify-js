// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultPartition, partitionsInfo } from './partitions';

/**
 * Get the AWS Services endpoint URL's DNS suffix for a given region. A typical AWS regional service endpoint URL will
 * follow this pattern: {endpointPrefix}.{region}.{dnsSuffix}. For example, the endpoint URL for Cognito Identity in
 * us-east-1 will be cognito-identity.us-east-1.amazonaws.com. Here the DnsSuffix is `amazonaws.com`.
 *
 * @param region
 * @returns The DNS suffix
 *
 * @internal
 */
export const getDnsSuffix = (region: string): string => {
	const { partitions } = partitionsInfo;
	for (const { regions, outputs, regionRegex } of partitions) {
		const regex = new RegExp(regionRegex);
		if (regions.includes(region) || regex.test(region)) {
			return outputs.dnsSuffix;
		}
	}

	return defaultPartition.outputs.dnsSuffix;
};
