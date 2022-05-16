/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/** @class */
export default class CognitoRefreshToken {
	/**
	 * Constructs a new CognitoRefreshToken object
	 * @param {string=} RefreshToken The JWT refresh token.
	 */
	constructor({ RefreshToken } = {}) {
		// Assign object
		this.token = RefreshToken || '';
	}

	/**
	 * @returns {string} the record's token.
	 */
	getToken() {
		return this.token;
	}
}
