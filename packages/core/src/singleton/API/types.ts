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

type EndpointConfig = {
	endpoint: string;
	defaultAuthMode: ApiAuthMode;
};

export type APIConfig = {
	REST?: Record<string, EndpointConfig>;
	AppSync?: {
		defaultAuthMode: ApiAuthMode;
		region: string;
		endpoint: string;
		modelIntrospectionSchema?: any;
	};
};

export type ApiAuthMode =
	| { type: 'apiKey'; apiKey: string }
	| { type: 'oidc'; token?: 'id' | 'access' }
	| { type: 'userPool'; token?: 'id' | 'access' }
	| { type: 'iam'; region?: string; service?: string }
	| { type: 'lambda' }
	| { type: 'none' };

export type ApiAuthModeKeys = ApiAuthMode['type'];
