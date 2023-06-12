// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Default partition for AWS services. This is used when the region is not provided or the region is not recognized.
 *
 * @internal
 */
export const defaultPartition = {
	id: 'aws',
	outputs: {
		dnsSuffix: 'amazonaws.com',
	},
	regionRegex: '^(us|eu|ap|sa|ca|me|af)\\-\\w+\\-\\d+$',
	regions: ['aws-global'],
};

/**
 * This data is adapted from the partition file from AWS SDK shared utilities but remove some contents for bundle size
 * concern. Information removed are `dualStackDnsSuffix`, `supportDualStack`, `supportFIPS`, restricted partitions, and
 * list of regions for each partition other than global regions.
 *
 * * Ref: https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints
 * * Ref: https://github.com/aws/aws-sdk-js-v3/blob/0201baef03c2379f1f6f7150b9d401d4b230d488/packages/util-endpoints/src/lib/aws/partitions.json#L1
 *
 * @internal
 */
export const partitionsInfo = {
	partitions: [
		defaultPartition,
		{
			id: 'aws-cn',
			outputs: {
				dnsSuffix: 'amazonaws.com.cn',
			},
			regionRegex: '^cn\\-\\w+\\-\\d+$',
			regions: ['aws-cn-global'],
		},
	],
};
