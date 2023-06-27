// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Request, Response, TransferHandler } from './core';

/**
 * Use basic Record interface to workaround fetch Header class not available in Node.js
 * The header names must be lowercased.
 * TODO: use LowerCase<string> intrinsic when we can support typescript 4.0
 */
export type Headers = Record<string, string>;

export interface HttpRequest extends Request {
	method: string;
	headers: Headers;
	body?: BodyInit;
}

/**
 * Reduce the API surface of Fetch API's Body mixin to only the methods we need.
 * In React Native, body.arrayBuffer() is not supported.
 * body.formData() is not supported for now.
 */
export type ResponseBodyMixin = Pick<Body, 'blob' | 'json' | 'text'>;

export interface HttpResponse extends Response {
	body: (ResponseBodyMixin & ReadableStream) | ResponseBodyMixin | null;
	statusCode: number;
	/**
	 * @see {@link HttpRequest.headers}
	 */
	headers: Headers;
}

export interface HttpTransferOptions {
	abortSignal?: AbortSignal;
}

export type HttpTransferHandler = TransferHandler<
	HttpRequest,
	HttpResponse,
	HttpTransferOptions
>;
