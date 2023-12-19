// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ServiceClientOptions } from '../types/aws';
import { TransferHandler, Endpoint } from '../types/core';
import { HttpRequest, HttpResponse } from '../types/http';

export const composeServiceApi = <
	TransferHandlerOptions,
	Input,
	Output,
	DefaultConfig,
>(
	transferHandler: TransferHandler<
		HttpRequest,
		HttpResponse,
		TransferHandlerOptions
	>,
	serializer: (
		input: Input,
		endpoint: Endpoint
	) => Promise<HttpRequest> | HttpRequest,
	deserializer: (output: HttpResponse) => Promise<Output>,
	defaultConfig: Partial<DefaultConfig>
) => {
	return async (
		config: OptionalizeKey<
			TransferHandlerOptions &
				ServiceClientOptions &
				Partial<DefaultConfig> &
				InferEndpointResolverOptionType<DefaultConfig>,
			DefaultConfig
		>,
		input: Input
	) => {
		const resolvedConfig = {
			...defaultConfig,
			...config,
		} as unknown as TransferHandlerOptions & ServiceClientOptions;
		// We may want to allow different endpoints from given config(other than region) and input.
		// Currently S3 supports additional `useAccelerateEndpoint` option to use accelerate endpoint.
		const endpoint = await resolvedConfig.endpointResolver(
			resolvedConfig,
			input
		);
		// Unlike AWS SDK clients, a serializer should NOT populate the `host` or `content-length` headers.
		// Both of these headers are prohibited per Spec(https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name).
		// They will be populated automatically by browser, or node-fetch polyfill.
		const request = await serializer(input, endpoint);
		const response = await transferHandler(request, {
			...resolvedConfig,
		});
		return await deserializer(response);
	};
};

type OptionalizeKey<InputType, InputDefaultsType> = {
	[KeyWithDefaultValue in keyof InputDefaultsType]?: KeyWithDefaultValue extends keyof InputType
		? InputType[KeyWithDefaultValue]
		: never;
} & {
	[KeyWithoutDefaultValue in keyof Omit<
		InputType,
		keyof InputDefaultsType
	>]: InputType[KeyWithoutDefaultValue];
};

type InferEndpointResolverOptionType<T> = T extends {
	endpointResolver: (options: infer EndpointOptions) => any;
}
	? EndpointOptions
	: never;
