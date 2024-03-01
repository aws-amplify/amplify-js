// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorParams } from '../types/errors';

import { AmplifyError } from './AmplifyError';

/**
 * The type of an unwrapped HTTP response causing the given API error.
 * @internal
 */
export interface ApiErrorResponse {
	statusCode: number;
	headers: Record<string, string>;
	body?: string;
}

/**
 * The constructor parameters for an API error.
 * @internal
 */
export interface ApiErrorParams extends AmplifyErrorParams {
	response?: ApiErrorResponse;
}

/**
 * Error class for errors that associated with unsuccessful HTTP responses.
 * It's throw by API category REST API handlers and GraphQL query handlers for now.
 */
export class ApiError extends AmplifyError {
	private readonly _response?: ApiErrorResponse;

	/**
	 * The unwrapped HTTP response causing the given API error.
	 */
	get response(): ApiErrorResponse | undefined {
		return this._response
			? replicateApiErrorResponse(this._response)
			: undefined;
	}

	constructor(params: ApiErrorParams) {
		super(params);

		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = ApiError;
		Object.setPrototypeOf(this, ApiError.prototype);

		if (params.response) {
			this._response = params.response;
		}
	}
}

const replicateApiErrorResponse = (
	response: ApiErrorResponse,
): ApiErrorResponse => ({
	...response,
	headers: { ...response.headers },
});
