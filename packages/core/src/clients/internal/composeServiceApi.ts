// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ServiceClientOptions } from '../types/aws';
import { Endpoint, TransferHandler } from '../types/core';
import { HttpRequest, HttpResponse } from '../types/http';

/**
 * Compose a service API handler that accepts input as defined shape and responds conforming to defined output shape.
 * A service API handler is composed with:
 * * A transfer handler
 * * A serializer function
 * * A deserializer function
 * * A default config object
 *
 * The returned service API handler, when called, will trigger the following workflow:
 * 1. When calling the service API handler function, the default config object is merged into the input config
 * object to assign the default values of some omitted configs, resulting to a resolved config object.
 * 2. The `endpointResolver` function from the default config object will be invoked with the resolved config object and
 * API input object resulting to an endpoint instance.
 * 3. The serializer function is invoked with API input object and the endpoint instance resulting to an HTTP request
 * instance.
 * 4. The HTTP request instance and the resolved config object is passed to the transfer handler function.
 * 5. The transfer handler function resolves to an HTTP response instance(can be either successful or failed status code).
 * 6. The deserializer function is invoked with the HTTP response instance resulting to the API output object, and
 * return to the caller.
 *
 *
 * @param transferHandler Async function for dispatching HTTP requests and returning HTTP response.
 * @param serializer  Async function for converting object in defined input shape into HTTP request targeting a given
 * 	endpoint.
 * @param deserializer Async function for converting HTTP response into output object in defined output shape, or error
 * 	shape.
 * @param defaultConfig  object containing default options to be consumed by transfer handler, serializer and
 *  deserializer.
 * @returns a async service API handler function that accepts a config object and input object in defined shape, returns
 * 	an output object in defined shape. It may also throw error instance in defined shape in deserializer. The config
 *  object type is composed with options type of transferHandler, endpointResolver function as well as endpointResolver
 *  function's input options type, region string. The config object property will be marked as optional if it's also
 * 	defined in defaultConfig.
 *
 * @internal
 */
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
		endpoint: Endpoint,
	) => Promise<HttpRequest> | HttpRequest,
	deserializer: (output: HttpResponse) => Promise<Output>,
	defaultConfig: Partial<DefaultConfig>,
) => {
	return async (
		config: OptionalizeKey<
			TransferHandlerOptions &
				ServiceClientOptions & // Required configs(e.g. endpointResolver, region) to serialize input shapes into requests
				InferEndpointResolverOptionType<DefaultConfig> & // Required inputs for endpointResolver
				Partial<DefaultConfig>, // Properties defined in default configs, we need to allow overwriting them when invoking the service API handler
			DefaultConfig
		>,
		input: Input,
	) => {
		const resolvedConfig = {
			...defaultConfig,
			...config,
		} as unknown as TransferHandlerOptions & ServiceClientOptions;
		// We need to allow different endpoints based on both given config(other than region) and input.
		// However for most of non-S3 services, region is the only input for endpoint resolver.
		const endpoint = await resolvedConfig.endpointResolver(
			resolvedConfig,
			input,
		);
		// Unlike AWS SDK clients, a serializer should NOT populate the `host` or `content-length` headers.
		// Both of these headers are prohibited per Spec(https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name).
		// They will be populated automatically by browser, or node-fetch polyfill.
		const request = await serializer(input, endpoint);
		const response = await transferHandler(request, {
			...resolvedConfig,
		});

		return deserializer(response);
	};
};

/**
 * Type helper to make a given key optional in a given type. For all the keys in the `InputDefaultsType`, if its value
 * is assignable to the value of the same key in `InputType`, we will mark the key in `InputType` is optional. If
 * the `InputType` and `InputDefaultsType` has the same key but un-assignable types, the resulting type is `never` to
 * trigger a type error down the line.
 *
 * @example
 * type InputType = {
 *   a: string;
 *   b: number;
 *   c: string;
 * };
 * type InputDefaultsType = {
 *   a: string;
 *   b: number;
 * };
 * type OutputType = OptionalizeKey<InputType, InputDefaultsType>;
 * OutputType equals to:
 * {
 *   a?: string;
 *   b?: number;
 *   c: string;
 * }
 */
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
	endpointResolver(options: infer EndpointOptions, input: any): any;
}
	? EndpointOptions
	: never;
