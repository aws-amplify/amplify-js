// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export type LibraryAPIOptions = {
	AppSync: {
		query: string;
		variables?: object;
		authMode?: any;
		authToken?: string;
		/**
		 * @deprecated This property should not be used
		 */
		userAgentSuffix?: string;
	};
	customHeaders: Function;
};

export type APIConfig = {
	AppSync?: {
		defaultAuthMode?: GraphQLAuthMode;
		region?: string;
		endpoint?: string;
		modelIntrospectionSchema?: any;
	};
};

export type GraphQLAuthMode =
	| { type: GraphQLAuthModeKeys.apiKey; apiKey: string }
	| { type: GraphQLAuthModeKeys.jwt; token: 'id' | 'access' }
	| { type: GraphQLAuthModeKeys.iam }
	| { type: GraphQLAuthModeKeys.lambda }
	| { type: GraphQLAuthModeKeys.custom };

export enum GraphQLAuthModeKeys {
	apiKey = 'apiKey',
	jwt = 'jwt',
	iam = 'iam',
	lambda = 'lambda',
	custom = 'custom',
}
