import { AWSCloudWatchProvider } from '../../src/Providers/AWSCloudWatchProvider';
import { AWSCloudWatchProviderOptions } from '../../src/types';
import {
	AWS_CLOUDWATCH_CATEGORY,
	AWS_CLOUDWATCH_PROVIDER_NAME,
} from '../../src/Util/Constants';

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

const testConfig: AWSCloudWatchProviderOptions = {
	logGroupName: 'logGroup',
	logStreamName: 'logStream',
	region: 'us-west-2',
};

describe('AWSCloudWatchProvider test', () => {
	describe('getCategoryName test', () => {
		test('happy case', () => {
			const provider = new AWSCloudWatchProvider();
			expect(provider.getCategoryName()).toBe(AWS_CLOUDWATCH_CATEGORY);
		});
	});

	describe('getProviderName test', () => {
		test('happy case', () => {
			const provider = new AWSCloudWatchProvider();
			expect(provider.getProviderName()).toBe(AWS_CLOUDWATCH_PROVIDER_NAME);
		});
	});

	// describe('configure test', () => {
	// 	test('happy case', () => {
	// 		const provider = new AWSCloudWatchProvider();
	// 		expect(provider.configure({})).toEqual(testConfig);
	// 	});
	// });
});
