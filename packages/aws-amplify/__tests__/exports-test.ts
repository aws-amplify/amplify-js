import * as exported from '../src';

describe('aws-amplify', () => {
	describe('import * keys', () => {
		it('should match snapshot', () => {
			expect(Object.keys(exported)).toMatchInlineSnapshot(`
			Array [
			  "Amplify",
				"Cache",
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
			  "Interactions",
			  "Notifications",
			  "Predictions",
			  "Logger",
			  "Hub",
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
