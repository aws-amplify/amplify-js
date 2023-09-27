// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export default class NotEnabledError extends Error {
	constructor() {
		super(
			'Function is unavailable as Push has not been enabled. Please call `Push.enable` before calling this function.'
		);
		this.name = 'NotEnabledError';
	}
}
