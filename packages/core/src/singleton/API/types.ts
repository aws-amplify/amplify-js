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
	| { type: 'apiKey'; apiKey: string }
	| { type: 'jwt'; token: 'id' | 'access' }
	| { type: 'iam' }
	| { type: 'lambda' }
	| { type: 'custom' };
