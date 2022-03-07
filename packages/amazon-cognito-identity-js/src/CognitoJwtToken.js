/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Buffer } from 'buffer';

/** @class */
export default class CognitoJwtToken {
	/**
	 * Constructs a new CognitoJwtToken object
	 * @param {string=} token The JWT token.
	 */
	constructor(token) {
		// Assign object
		this.jwtToken = token || '';
		this.payload = this.decodePayload();
	}

	/**
	 * @returns {string} the record's token.
	 */
	getJwtToken() {
		return this.jwtToken;
	}

	/**
	 * @returns {int} the token's expiration (exp member).
	 */
	getExpiration() {
		return this.payload.exp;
	}

	/**
	 * @returns {int} the token's "issued at" (iat member).
	 */
	getIssuedAt() {
		return this.payload.iat;
	}

	/**
	 * @returns {object} the token's payload.
	 */
	decodePayload() {
		const payload = this.jwtToken.split('.')[1];
		try {
			return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
		} catch (err) {
			return {};
		}
	}
}
