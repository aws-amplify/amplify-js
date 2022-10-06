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
			  "AuthModeStrategyType",
			  "DataStore",
			  "Predicates",
			  "SortDirection",
			  "syncExpression",
			  "PubSub",
			  "Cache",
			  "Interactions",
			  "Notifications",
			  "XR",
			  "Predictions",
			  "Logger",
			  "Hub",
			  "JS",
			  "ClientDevice",
			  "Signer",
			  "I18n",
			  "ServiceWorker",
			  "AWSCloudWatchProvider",
			  "withSSRContext",
			  "Geo",
			]
		`);
		});
	});
});
