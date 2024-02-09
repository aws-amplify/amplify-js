// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { MetadataBearer } from '@aws-sdk/types';
import { Endpoint } from './core';
import { HttpResponse } from './http';

export type {
	AwsCredentialIdentity as Credentials,
	MetadataBearer,
} from '@aws-sdk/types';

export type SourceData = string | ArrayBuffer | ArrayBufferView;

/**
 * Basic option type for endpoint resolvers. It contains region only.
 */
export type EndpointResolverOptions = { region: string };

export interface ServiceClientOptions {
	region: string;
	endpointResolver: (options: EndpointResolverOptions, input?: any) => Endpoint;
}

/**
 * parse errors from given response. If no error code is found, return undefined.
 * This function is protocol-specific (e.g. JSON, XML, etc.)
 */
export type ErrorParser = (
	response?: HttpResponse
) => Promise<(Error & MetadataBearer) | undefined>;
