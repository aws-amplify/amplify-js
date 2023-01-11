import {
	DocumentNode,
	OperationDefinitionNode,
	print,
	parse,
	GraphQLError,
} from 'graphql';
import {
	Amplify,
	parseAWSExports,
	getAmplifyUserAgent,
} from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import { GraphQLAuthError, GraphQLOptions } from '../types';
import { restClient, USER_AGENT_HEADER } from '../utils';

/**
 * Handles AppSync GraphQL queries.
 *
 * @param options GraphQL query options.
 * @param additionalHeaders Additional headers that will be appended to default headers.
 * @returns A promise that will resolve with query results.
 */
export const query = async (
	options: GraphQLOptions,
	additionalHeaders?: { [key: string]: string }
) => {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
	const appSyncRegion = amplifyConfig.aws_appsync_region;
	const appSyncGraphQLEndpoint = amplifyConfig.aws_appsync_graphqlEndpoint;
	const customGraphQLEndpoint = amplifyConfig.graphql_endpoint;
	const customGraphQLRegion = amplifyConfig.graphql_endpoint_iam_region;

	const {
		query: paramQuery,
		variables = {},
		authMode,
		authToken,
		userAgentSuffix,
	} = options;

	// Basic POC request validation
	if (authMode !== 'AMAZON_COGNITO_USER_POOLS') {
		throw new Error('Unsupported authentication mode.');
	}

	// Process query
	// TODO: Extract this as a utility
	const query =
		typeof paramQuery === 'string'
			? parse(paramQuery)
			: parse(print(paramQuery));
	const [operationDef = {}] = query.definitions.filter(
		def => def.kind === 'OperationDefinition'
	);
	const { operation: operationType } = operationDef as OperationDefinitionNode;
	const customHeaders = additionalHeaders || {};
	if (authToken) {
		customHeaders.Authorization = authToken;
	}
	const cancellableToken = restClient.getCancellableToken();
	const payloadParams = { cancellableToken };

	// Construct query headers
	// TODO: Extract this as a utility, expand to cover auth modes not currently covered by POC
	let session;
	let authorizationHeaders = {};
	if (!authToken) {
		try {
			// TODO: Replace this with new functional session method
			session = await Auth.currentSession();
		} catch (e) {
			throw new Error(GraphQLAuthError.NO_CURRENT_USER);
		}
		const authorizationToken = session.getAccessToken().getJwtToken();
		authorizationHeaders = {
			Authorization: authorizationToken,
		};
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
			queryHeaders,
			body: {
				query: print(query as DocumentNode),
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
		throw new GraphQLError('No graphql endpoint provided.');
	}

	// Submit query
	let response;
	try {
		response = await restClient.post(endpoint, payload);
	} catch (err) {
		// If the exception is because user intentionally
		// cancelled the request, do not modify the exception
		// so that clients can identify the exception correctly.
		if (restClient.isCancel(err)) {
			throw err;
		}

		response = {
			data: {},
			errors: [new GraphQLError(err.message, null, null, null, null, err)],
		};

		// Reject the promise with an empty response containing the errors
		throw response;
	}

	// Mark the request as "cancellable"
	restClient.updateRequestToBeCancellable(response, cancellableToken);

	return response;
};
