// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Source, DocumentNode, GraphQLError, OperationTypeNode } from 'graphql';
export { OperationTypeNode } from 'graphql';
import { Auth, GRAPHQL_AUTH_MODE } from '@aws-amplify/auth';
export { GRAPHQL_AUTH_MODE };
import { Credentials } from '@aws-amplify/core';
import { Cache } from '@aws-amplify/cache';
import Observable from 'zen-observable-ts';

export interface GraphQLOptions {
	query: string | DocumentNode;
	variables?: object;
	authMode?: keyof typeof GRAPHQL_AUTH_MODE;
	authToken?: string;
	/**
	 * @deprecated This property should not be used
	 */
	userAgentSuffix?: string; // TODO: remove in v6
}

export interface GraphQLResult<T = object> {
	data?: T;
	errors?: GraphQLError[];
	extensions?: {
		[key: string]: any;
	};
}

export enum GraphQLAuthError {
	NO_API_KEY = 'No api-key configured',
	NO_CURRENT_USER = 'No current user',
	NO_CREDENTIALS = 'No credentials',
	NO_FEDERATED_JWT = 'No federated jwt',
	NO_AUTH_TOKEN = 'No auth token specified',
}

/**
 * GraphQLSource or string, the type of the parameter for calling graphql.parse
 * @see: https://graphql.org/graphql-js/language/#parse
 */
export type GraphQLOperation = Source | string;

export interface GraphQLAPIInterface {
	Auth: typeof Auth;
	Cache: typeof Cache;
	Credentials: typeof Credentials;

	getModuleName: () => string;
	configure: (options: object) => object;
	createInstance: () => Promise<string> | boolean;
	getGraphqlOperationType: (operation: GraphQLOperation) => OperationTypeNode;

	graphql: <T = any>(
		options: GraphQLOptions,
		additionalHeaders?: { [key: string]: string }
	) => Observable<GraphQLResult<T>> | Promise<GraphQLResult<T>>;

	createInstanceIfNotCreated: () => void;
	isCancel: (error) => boolean;
	cancel: (request: Promise<any>, message?: string) => boolean;
	hasCancelToken: (request: Promise<any>) => boolean;
}
