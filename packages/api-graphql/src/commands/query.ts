import {
	Amplify,
	parseAWSExports,
	getAmplifyUserAgent,
	httpClient,
} from '@aws-amplify/core';
import type { GraphQLOptions, GraphQLResult } from '../types';
export const USER_AGENT_HEADER = 'x-amz-user-agent';

/**
 * Handles AppSync GraphQL queries, including mutations.
 *
 * @param options GraphQL query options.
 * @param additionalHeaders Additional headers that will be appended to default headers.
 * @returns A promise that will resolve with query results.
 */
export const query = async (
	options: GraphQLOptions,
	additionalHeaders?: { [key: string]: string }
): Promise<GraphQLResult> => {
	const {
		query: paramQuery,
		variables = {},
		authMode,
		authToken,
		userAgentSuffix,
	} = options;
	const config = Amplify.getConfig();
	const amplifyConfig = parseAWSExports(config) as any;
	const storageConfig = amplifyConfig.Storage;
	const appSyncRegion = config.aws_appsync_region;
	const appSyncAuthMode = authMode || config.aws_appsync_authenticationType;
	const apiKey = config.aws_appsync_apiKey;
	const appSyncGraphQLEndpoint = config.aws_appsync_graphqlEndpoint;
	const customGraphQLEndpoint = amplifyConfig.graphql_endpoint;
	const customGraphQLRegion = amplifyConfig.graphql_endpoint_iam_region;

	// Process query
	// TODO: Extract this as a utility
	const query = paramQuery;

	const customHeaders = additionalHeaders || {};
	if (authToken) {
		customHeaders.Authorization = authToken;
	}

	const payloadParams = {};

	// Construct query headers
	// TODO: Extract this as a utility, expand to cover auth modes not currently covered by POC
	let authorizationHeaders = {};
	if (!authToken) {
		const userSession = Amplify.getUser();

		if (userSession) {
			const accessToken = userSession['accessToken'];
			authorizationHeaders = {
				Authorization: accessToken,
			};
		} else {
			throw new Error('Failed to load active user session.');
		}
	}

	const queryHeaders = {
		...(!customGraphQLEndpoint && authorizationHeaders),
		...(customGraphQLEndpoint &&
			(customGraphQLRegion ? authorizationHeaders : { Authorization: null })),
		//...(await graphql_headers({ query, variables })), Does this actually do anything?
		...customHeaders,
		...(!customGraphQLEndpoint && {
			[USER_AGENT_HEADER]: getAmplifyUserAgent(userAgentSuffix),
		}),
	};

	// Construct query & query attributes
	const endpoint = customGraphQLEndpoint || appSyncGraphQLEndpoint;
	const payload = Object.assign(
		{
			headers: queryHeaders,
			body: {
				query,
				variables,
			},
			signerServiceInfo: {
				service: !customGraphQLEndpoint ? 'appsync' : 'execute-api',
				region: !customGraphQLEndpoint ? appSyncRegion : customGraphQLRegion,
			},
		},
		payloadParams
	);

	if (!endpoint) {
		throw new Error('No graphql endpoint provided.');
	}

	// Submit query
	let response;
	let requestAuthMode: 'JWT' | 'SigV4' | 'None' = 'None';
	let customHeader = {};

	if (
		appSyncAuthMode === 'AMAZON_COGNITO_USER_POOLS' ||
		appSyncAuthMode === 'AWS_LAMBDA' ||
		appSyncAuthMode === 'OPENID_CONNECT'
	) {
		requestAuthMode = 'JWT';
	}

	if (appSyncAuthMode === 'AWS_IAM') {
		requestAuthMode = 'SigV4';
	}

	if (appSyncAuthMode === 'API_KEY') {
		customHeader['x-api-key'] = apiKey;
	}

	try {
		response = await httpClient({
			endpoint,
			method: 'POST',
			body: payload.body,
			region: payload.signerServiceInfo.region,
			service: payload.signerServiceInfo.service,
			authMode: requestAuthMode,
			headers: { ...customHeader },
		});

		// response = await restClient.post(endpoint, payload);
	} catch (err) {
		// If the exception is because user intentionally
		// cancelled the request, do not modify the exception
		// so that clients can identify the exception correctly.

		response = {
			data: {},
			errors: [err],
		};

		// Reject the promise with an empty response containing the errors
		throw response;
	}

	return response;
};
