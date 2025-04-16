// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, RetryStrategy } from '@aws-amplify/core/internals/utils';

export type GetInput = ApiInput<RestApiOptionsBase>;
export type PostInput = ApiInput<RestApiOptionsBase>;
export type PutInput = ApiInput<RestApiOptionsBase>;
export type PatchInput = ApiInput<RestApiOptionsBase>;
export type DeleteInput = ApiInput<Omit<RestApiOptionsBase, 'body'>>;
export type HeadInput = ApiInput<Omit<RestApiOptionsBase, 'body'>>;

export type GetOperation = Operation<RestApiResponse>;
export type PostOperation = Operation<RestApiResponse>;
export type PutOperation = Operation<RestApiResponse>;
export type PatchOperation = Operation<RestApiResponse>;
export type DeleteOperation = Operation<Omit<RestApiResponse, 'body'>>;
export type HeadOperation = Operation<Omit<RestApiResponse, 'body'>>;

/**
 * @internal
 */
export interface RestApiOptionsBase {
	headers?: Headers;
	queryParams?: Record<string, string>;
	body?: DocumentType | FormData;
	/**
	 * Option controls whether or not cross-site Access-Control requests should be made using credentials
	 * such as cookies, authorization headers or TLS client certificates. It has no effect on same-origin requests.
	 * If set to `true`, the request will include credentials such as cookies, authorization headers, TLS
	 * client certificates, and so on. Moreover the response cookies will also be set.
	 * If set to `false`, the cross-site request will not include credentials, and the response cookies from a different
	 * domain will be ignored.
	 *
	 * @default false
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials}
	 */
	withCredentials?: boolean;
	/**
	 * Retry strategy for the REST API calls. It will take precedence over REST `retryStrategy` in Amplify configuration libraryOptions.
	 *
	 * @default ` { strategy: 'jittered-exponential-backoff' } `
	 */
	retryStrategy?: RetryStrategy;
}

type Headers = Record<string, string>;

/**
 * Type representing an operation that can be canceled.
 *
 * @internal
 */
export interface Operation<Response> {
	response: Promise<Response>;
	cancel(abortMessage?: string): void;
}

interface ResponsePayload {
	blob(): Promise<Blob>;
	json(): Promise<DocumentType>;
	text(): Promise<string>;
}

/**
 * Basic response type of REST API.
 *
 * @internal
 */
export interface RestApiResponse {
	body: ResponsePayload;
	statusCode: number;
	headers: Headers;
}

/**
 * @internal
 */
export interface ApiInput<Options> {
	/**
	 * Name of the REST API configured in Amplify singleton.
	 */
	apiName: string;
	/**
	 * Path of the REST API.
	 */
	path: string;
	/**
	 * Options to overwrite the REST API call behavior.
	 */
	options?: Options;
}

/**
 * Input type to invoke REST POST API from GraphQl client.
 * @internal
 */
export interface InternalPostInput {
	// Resolved GraphQl endpoint url
	url: URL;
	options?: Omit<RestApiOptionsBase, 'retryStrategy'> & {
		/**
		 * Internal-only option for GraphQL client to provide the IAM signing service and region.
		 * * If auth mode is 'iam', you MUST set this value.
		 * * If auth mode is 'none', you MUST NOT set this value;
		 * * If auth mode is 'apiKey' or 'oidc' or 'lambda' or 'userPool' because associated
		 *   headers are provided, this value is ignored.
		 */
		signingServiceInfo?: {
			service?: string;
			region?: string;
		};
	};
	/**
	 * The abort controller to cancel the in-flight POST request.
	 * Required if you want to make the internal post request cancellable. To make the internal post cancellable, you
	 * must also call `updateRequestToBeCancellable()` with the promise from internal post call and the abort
	 * controller.
	 */
	abortController?: AbortController;
}

/**
 * Type for signingServiceInfo which enable IAM auth as well as overwrite the IAM signing info.
 * @internal
 */
export interface SigningServiceInfo {
	service?: string;
	region?: string;
}
