import * as exported from '../src';

describe('aws-amplify', () => {
	describe('import * keys', () => {
		it('should match snapshot', () => {
			expect(Object.keys(exported)).toMatchInlineSnapshot(`
			Array [
			  "Amplify",
			  "Analytics",
			  "AWSPinpointProvider",
			  "AWSKinesisProvider",
			  "AWSKinesisFirehoseProvider",
			  "AmazonPersonalizeProvider",
			  "Auth",
			  "Storage",
			  "StorageClass",
			  "API",
			  "APIClass",
			  "graphqlOperation",
			  "PubSub",
			  "Cache",
			  "Logger",
			  "Hub",
			  "ClientDevice",
			  "Signer",
			  "I18n",
			  "ServiceWorker",
			  "AWSCloudWatchProvider",
			  "withSSRContext",
			]
		`);
		});
	});
});
