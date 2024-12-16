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
export type ClientGenerationParams<
	WithCustomEndpoint extends boolean,
	WithApiKey extends boolean,
> = {
	amplify: AmplifyClassV6;
} & CommonPublicClientOptions<WithCustomEndpoint, WithApiKey>;

/**
 * Common options that can be used on public `generateClient()` interfaces.
 */
export type CommonPublicClientOptions<
	WithCustomEndpoint extends boolean,
	WithApiKey extends boolean,
> = WithCustomEndpoint extends true
	? WithApiKey extends true
		?
				| {
						endpoint: string;
						authMode: 'apiKey';
						apiKey: string;
						authToken?: string;
						headers?: CustomHeaders;
				  }
				| {
						endpoint: string;
						apiKey: string;
						authMode: Exclude<GraphQLAuthMode, 'apiKey'>;
						authToken?: string;
						headers?: CustomHeaders;
				  }
		: {
				endpoint: string;
				authMode: Exclude<GraphQLAuthMode, 'apiKey'>;
				apiKey?: never;
				authToken?: string;
				headers?: CustomHeaders;
			}
	: {
			endpoint?: never;
			authMode?: GraphQLAuthMode;
			authToken?: string;
			headers?: CustomHeaders;
		};
