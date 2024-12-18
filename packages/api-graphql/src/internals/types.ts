// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';
import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';
import { CustomHeaders } from '@aws-amplify/data-schema/runtime';

/**
 * @private
 *
 * The knobs available for configuring `generateClient` internally.
 */
export type ClientGenerationParams = {
	amplify: AmplifyClassV6;
} & CommonPublicClientOptions;

export interface DefaultCommonClientOptions {
	endpoint?: never;
	authMode?: GraphQLAuthMode;
	apiKey?: string;
	authToken?: string;
	headers?: CustomHeaders;
}

/**
 * Common options that can be used on public `generateClient()` interfaces.
 */
export type CommonPublicClientOptions =
	| DefaultCommonClientOptions
	| {
			endpoint: string;
			authMode: 'apiKey';
			apiKey: string;
			authToken?: string;
			headers?: CustomHeaders;
	  }
	| {
			endpoint: string;
			authMode: Exclude<GraphQLAuthMode, 'apiKey'>;
			apiKey?: string;
			authToken?: string;
			headers?: CustomHeaders;
	  };
