// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ApiError, ApiErrorParams } from '@aws-amplify/core/internals/utils';

export class RestApiError extends ApiError {
	constructor(params: ApiErrorParams) {
		super(params);

		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = RestApiError;
		Object.setPrototypeOf(this, RestApiError.prototype);
	}
}
