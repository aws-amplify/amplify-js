// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type ApiConfig = Record<string, RestApiEndpoint | GraphQLApiEndpoint>;

export type RestApiEndpoint = {
	endpointType: 'REST';
	endpoint: string;
} & AuthModeConfig;

export type GraphQLApiEndpoint = {
	endpointType: 'GraphQL';
	// TODO[allanzhengyp]: use template literal types to make sure the graphql path `${string}/graphql`
	endpoint: string;
	// TODO[allanzhengyp]: move to library options?
	modelIntrospectionSchema?: any;
} & AuthModeConfig;

type AuthModeConfig =
	| AwsIamAuthModeConfig
	| ApiKeyAuthModeConfig
	| OpenIdConnectAuthModeConfig
	| CognitoUserPoolAuthModeConfig
	| CustomAuthModeConfig;

export type ApiAuthMode = AuthModeConfig['authorizationType'];

type AwsIamAuthModeConfig = {
	authorizationType: 'AWS_IAM';
	region?: string;
	service?: string;
};

type ApiKeyAuthModeConfig = {
	authorizationType: 'API_KEY';
	apiKey: string;
};

type OpenIdConnectAuthModeConfig = {
	authorizationType: 'OPENID_CONNECT';
};

type CognitoUserPoolAuthModeConfig = {
	// TODO[allanzhengyp]: Currently align with other libraries, rename to COGNITO_USERPOOLS to align with data store?
	authorizationType: 'AMAZON_COGNITO_USER_POOLS';
};

type CustomAuthModeConfig = {
	authorizationType: 'CUSTOM';
};
