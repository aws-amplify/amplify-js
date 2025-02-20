// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Endpoint } from './core';
import { HttpResponse } from './http';

export interface ResponseMetadata {
	/**
	 * The status code of the last HTTP response received for this operation, if the error
	 * is caused by erroneous server response.
	 */
	httpStatusCode?: number;
	/**
	 * A unique identifier for the last request sent for this operation. Often
	 * requested by AWS service teams to aid in debugging.
	 */
	requestId?: string;
	/**
	 * A secondary identifier for the last request sent. Often requested by AWS
	 * service teams to aid in debugging.
	 */
	extendedRequestId?: string;
}

export type { AwsCredentialIdentity as Credentials } from '@aws-sdk/types';

export type SourceData = string | ArrayBuffer | ArrayBufferView;

/**
 * Basic option type for endpoint resolvers. It contains region only.
 */
export interface EndpointResolverOptions {
	region: string;
}

export interface ServiceClientOptions {
	region: string;
	endpointResolver(options: EndpointResolverOptions, input?: any): Endpoint;
}

/**
 * parse errors from given response. If no error code is found, return undefined.
 * This function is protocol-specific (e.g. JSON, XML, etc.)
 */
export type ErrorParser = (
	response?: HttpResponse,
) => Promise<(Error & { metadata: ResponseMetadata }) | undefined>;
