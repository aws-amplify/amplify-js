/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { Source, DocumentNode, GraphQLError } from 'graphql';

export interface GraphQLOptions {
	query: string | DocumentNode;
	variables?: object;
	authMode?: keyof typeof GRAPHQL_AUTH_MODE;
	authToken?: string;
	subscription?: boolean;
}

export enum GRAPHQL_AUTH_MODE {
	API_KEY = 'API_KEY',
	AWS_IAM = 'AWS_IAM',
	OPENID_CONNECT = 'OPENID_CONNECT',
	AMAZON_COGNITO_USER_POOLS = 'AMAZON_COGNITO_USER_POOLS',
	AWS_LAMBDA = 'AWS_LAMBDA',
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
