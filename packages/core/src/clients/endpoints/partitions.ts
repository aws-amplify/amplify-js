/**
 * This file is adapted from the partition file from AWS SDK shared utilities but remove some contents for bundle size
 * concern. Information removed are `dualStackDnsSuffix`, `supportDualStack`, `supportFIPS`, restricted partitions, and
 * list of regions for each partition other than global regions.
 *
 * * Ref: https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints
 * * Ref: https://github.com/aws/aws-sdk-js-v3/blob/0201baef03c2379f1f6f7150b9d401d4b230d488/packages/util-endpoints/src/lib/aws/partitions.json#L1
 * @internal
 */
const partitionsInfo = {
	partitions: [
		{
			id: 'aws',
			outputs: {
				dnsSuffix: 'amazonaws.com',
			},
			regionRegex: '^(us|eu|ap|sa|ca|me|af)\\-\\w+\\-\\d+$',
			regions: ['aws-global'],
		},
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

/**
 * @internal
 */
export default partitionsInfo;
