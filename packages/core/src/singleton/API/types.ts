// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Headers } from '../../clients';

export type LibraryAPIOptions = {
	GraphQL?: {
		// custom headers for given GraphQL service. Will be applied to all operations.
		headers?: (options: {
			query: string;
			variables?: Record<string, DocumentType>;
		}) => Promise<Headers>;
	};
	REST?: {
		// custom headers for given REST service. Will be applied to all operations.
		headers?: (options: { apiName: string }) => Promise<Headers>;
	};
};

type APIGraphQLConfig = {
	/**
	 * Required GraphQL endpoint, must be a valid URL string.
	 */
	endpoint: string;
	/**
	 * Optional region string used to sign the request. Required only if the auth mode is 'iam'.
	 */
	region?: string;
	/**
	 * Optional API key string. Required only if the auth mode is 'apiKey'.
	 */
	apiKey?: string;
	/**
	 * Custom domain endpoint for GraphQL API.
	 */
	customEndpoint?: string;
	/**
	 * Optional region string used to sign the request to `customEndpoint`. Effective only if `customEndpoint` is
	 * specified, and the auth mode is 'iam'.
	 */
	customEndpointRegion?: string;
	/**
	 * Default auth mode for all the API calls to given service.
	 */
	defaultAuthMode: GraphQLAuthMode;
};

type APIRestConfig = {
	/**
	 * Required REST endpoint, must be a valid URL string.
	 */
	endpoint: string;
	/**
	 * Optional region string used to sign the request with IAM credentials. If Omitted, region will be extracted from
	 * the endpoint.
	 *
	 * @default 'us-east-1'
	 */
	region?: string;
	/**
	 * Optional service name string to sign the request with IAM credentials.
	 *
	 * @default 'execute-api'
	 */
	service?: string;
};

export type APIConfig = {
	REST?: Record<string, APIRestConfig>;
	GraphQL?: APIGraphQLConfig;
};

export type GraphQLAuthMode =
	| 'apiKey'
	| 'oidc'
	| 'userPool'
	| 'iam'
	| 'lambda'
	| 'none';

/**
 * Type representing a plain JavaScript object that can be serialized to JSON.
 */
export type DocumentType =
	| null
	| boolean
	| number
	| string
	| DocumentType[]
	| { [prop: string]: DocumentType };
