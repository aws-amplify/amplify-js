// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyError, ErrorParams } from '@aws-amplify/core';

/**
 * @internal
 */
export class AnalyticsError extends AmplifyError {
	constructor(params: ErrorParams) {
		super(params);

		// Hack for making the custom error class work when transpiled to es5
		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = AnalyticsError;
		Object.setPrototypeOf(this, AnalyticsError.prototype);
	}
}
