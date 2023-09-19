import { getDnsSuffix } from '../../src/clients/endpoints';

describe(getDnsSuffix.name, () => {
	test.each([
		['happy case aws partition', 'af-south-1', 'amazonaws.com'],
		['happy case aws partition', 'us-east-1', 'amazonaws.com'],
		['infer aws partition', 'us-unspecified-99', 'amazonaws.com'],
		['infer aws partition', 'eu-unspecified-99', 'amazonaws.com'],
		['infer aws partition', 'ap-unspecified-99', 'amazonaws.com'],
		['infer aws partition', 'sa-unspecified-99', 'amazonaws.com'],
		['infer aws partition', 'ca-unspecified-99', 'amazonaws.com'],
		['infer aws partition', 'me-unspecified-99', 'amazonaws.com'],
		['infer aws partition', 'af-unspecified-99', 'amazonaws.com'],
		['aws partition global', 'aws-global', 'amazonaws.com'],
		['happy case cn partition', 'cn-north-1', 'amazonaws.com.cn'],
		['infer cn partition', 'cn-unspecified-99', 'amazonaws.com.cn'],
		['cn partition global', 'aws-cn-global', 'amazonaws.com.cn'],
		['fallback to default partition', 'unrecognized-region', 'amazonaws.com'],
	])(`%s -- resolve region %s to dnsSuffix %s`, (_, region, dnsSuffix) => {
		expect(getDnsSuffix(region)).toEqual(dnsSuffix);
	});
});
