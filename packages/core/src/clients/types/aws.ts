// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Endpoint } from './core';
import { HttpResponse } from './http';

export type { Credentials } from '@aws-sdk/types';

export type SourceData = string | ArrayBuffer | ArrayBufferView;

export interface ServiceClientOptions {
	region: string;
	endpointResolver: (input: { region: string }) => Endpoint;
}

/**
 * parse errors from given response. If no error code is found, return undefined.
 * This function is protocol-specific (e.g. JSON, XML, etc.)
 */
export type ErrorParser = (
	response?: HttpResponse
) => Promise<Error | undefined>;
