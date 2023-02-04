// Contains functional subscription API

import { Amplify, parseAWSExports } from '@aws-amplify/core';
import { AWSAppSyncRealTimeProvider } from './AWSAppSyncRealTimeProvider';

// TODO Implement subscription functional API
let appSyncProvider: AWSAppSyncRealTimeProvider;

export function subscribe({ query, variables }) {
	const config = Amplify.getConfig();
	const amplifyConfig = parseAWSExports(config) as any;
	const storageConfig = amplifyConfig.Storage;
	const appSyncRegion = config.aws_appsync_region;
	const appSyncAuthMode = config.aws_appsync_authenticationType;
	const apiKey = config.aws_appsync_apiKey;
	const appSyncGraphQLEndpoint = config.aws_appsync_graphqlEndpoint;
	const customGraphQLEndpoint = amplifyConfig.graphql_endpoint;
	const customGraphQLRegion = amplifyConfig.graphql_endpoint_iam_region;

	if (!appSyncProvider) {
		appSyncProvider = new AWSAppSyncRealTimeProvider({
			appSyncGraphqlEndpoint: appSyncGraphQLEndpoint,
			apiKey,
			authenticationType: appSyncAuthMode,
			region: appSyncRegion,
		});
	}

	return appSyncProvider.subscribe('', {
		apiKey,
		query,
		variables,
		region: appSyncRegion,
		authenticationType: appSyncAuthMode,
		appSyncGraphqlEndpoint: appSyncGraphQLEndpoint,
	});
}
