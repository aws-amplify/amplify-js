// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * General None HTTP-specific request interface
 */
export interface Request {
	url: URL;
	body?: unknown;
}

export interface Response {
	body: unknown;
}
export interface Endpoint {
	url: URL;
}
