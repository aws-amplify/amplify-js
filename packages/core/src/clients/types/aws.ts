// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Endpoint } from './core';
import { HttpResponse } from './http';

export type SourceData = string | ArrayBuffer | ArrayBufferView;

export interface ResponseMetadata {
	httpStatusCode?: number;
	requestId?: string;
	extendedRequestId?: string;
	cfId?: string;
	attempts?: number;
	totalRetryDelay?: number;
}

export interface MetadataBearer {
	$metadata: ResponseMetadata;
}

export interface Credentials {
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
	expiration?: Date;
	credentialScope?: string;
	accountId?: string;
}

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
) => Promise<(Error & MetadataBearer) | undefined>;
